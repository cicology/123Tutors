// Bursary Context for managing current bursary state
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/lib/api-service'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  email: string
  userType: string
  bursaryName?: string
  uniqueId: string
  profileImageUrl?: string
  bursary?: {
    uniqueId: string
    bursaryName: string
  }
}

interface BursaryContextType {
  currentBursary: string | null
  setCurrentBursary: (bursary: string) => void
  isLoading: boolean
  userProfile: UserProfile | null
  isBursaryAdmin: boolean
  userBursaries: string[]
  refreshUserProfile: () => Promise<void>
}

const BursaryContext = createContext<BursaryContextType | undefined>(undefined)

// Helper function to extract bursary from unique_id pattern
function extractBursaryFromUniqueId(uniqueId: string): string | null {
  const pattern = uniqueId.match(/^UP_([A-Z]+)_\d+$/)
  if (pattern) {
    const bursaryCode = pattern[1]
    const bursaryMapping: Record<string, string> = {
      'TEST': 'Test Bursary',
      'SAEF': 'South African Education Foundation',
      'FUNZA': 'Funza Lushaka',
      'NSFAS': 'NSFAS'
    }
    return bursaryMapping[bursaryCode] || null
  }
  return null
}

// Helper function to get bursary from email domain
function getBursaryFromEmailDomain(email: string): string {
  const emailDomain = email.split('@')[1] || ''
  const bursaryMapping: Record<string, string> = {
    'nsfas.org.za': 'NSFAS',
    'funza.org.za': 'Funza Lushaka',
    'funzalushaka.org.za': 'Funza Lushaka',
    'saef.org.za': 'South African Education Foundation',
    'test.com': 'Test Bursary',
  }
  return bursaryMapping[emailDomain] || 'NSFAS'
}

export function BursaryProvider({ children }: { children: ReactNode }) {
  const [currentBursary, setCurrentBursary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userBursaries, setUserBursaries] = useState<string[]>([])

  useEffect(() => {
    const initializeUserProfile = async () => {
      try {
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user && user.email) {
          // Fetch user profile from backend
          try {
            const profile = await apiService.getUserProfile(user.email)
            setUserProfile(profile)
            
            // Check if user is bursary admin and get bursary from unique_id mapping
            if (profile.userType === 'bursary_admin') {
              // Use unique_id based bursary identification
              if (profile.bursary && profile.bursary.bursaryName) {
                setCurrentBursary(profile.bursary.bursaryName)
                setUserBursaries([profile.bursary.bursaryName])
              } else if (profile.bursaryName) {
                // Fallback to bursaryName field
                setCurrentBursary(profile.bursaryName)
                setUserBursaries([profile.bursaryName])
              } else {
                // Extract bursary from unique_id pattern (e.g., UP_TEST_002 -> Test Bursary)
                const bursaryFromUniqueId = extractBursaryFromUniqueId(profile.uniqueId)
                if (bursaryFromUniqueId) {
                  setCurrentBursary(bursaryFromUniqueId)
                  setUserBursaries([bursaryFromUniqueId])
                } else {
                  // Fallback to email domain mapping
                  const mappedBursary = getBursaryFromEmailDomain(user.email)
                  setCurrentBursary(mappedBursary)
                  setUserBursaries([mappedBursary])
                }
              }
            } else {
              // Fallback to email domain mapping for non-bursary-admin users
              const mappedBursary = getBursaryFromEmailDomain(user.email)
              setCurrentBursary(mappedBursary)
              setUserBursaries([mappedBursary])
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
            // Fallback to email domain mapping
            const mappedBursary = getBursaryFromEmailDomain(user.email)
            setCurrentBursary(mappedBursary)
            setUserBursaries([mappedBursary])
          }
        }
      } catch (error) {
        console.error('Error initializing user profile:', error)
        // Fallback to default bursary
        setCurrentBursary('NSFAS')
        setUserBursaries(['NSFAS'])
      } finally {
        setIsLoading(false)
      }
    }

    initializeUserProfile()
  }, [])

  const refreshUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        const profile = await apiService.getUserProfile(user.email)
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error)
    }
  }

  const isBursaryAdmin = userProfile?.userType === 'bursary_admin'

  return (
    <BursaryContext.Provider value={{
      currentBursary,
      setCurrentBursary,
      isLoading,
      userProfile,
      isBursaryAdmin,
      userBursaries,
      refreshUserProfile
    }}>
      {children}
    </BursaryContext.Provider>
  )
}

export function useBursary() {
  const context = useContext(BursaryContext)
  if (context === undefined) {
    throw new Error('useBursary must be used within a BursaryProvider')
  }
  return context
}
