"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { BursaryProvider } from "@/lib/contexts/bursary-context"
import { BursaryDashboard } from "@/components/features/bursary-dashboard"
import { StudentDashboard } from "@/components/features/student-dashboard"
import { TutorDashboard } from "@/components/features/tutor-dashboard"
import { AdminDashboard } from "@/components/features/admin-dashboard"

type DashboardType = "bursary" | "student" | "tutor" | "admin"

interface DashboardRouteShellProps {
  roleLabel: string
  dashboardType?: DashboardType
  initialTab?: string
}

export function DashboardRouteShell({
  roleLabel,
  dashboardType = "bursary",
  initialTab = "home"
}: DashboardRouteShellProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!isMounted) {
          return
        }

        if (!user) {
          router.replace("/login")
          return
        }

        setIsAuthenticated(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return
      }

      if (!session?.user) {
        setIsAuthenticated(false)
        router.replace("/login")
        return
      }
      setIsAuthenticated(true)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="modern-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF0090]" />
          <p className="text-sm text-[#4f4a44]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Render the appropriate dashboard based on type
  const renderDashboard = () => {
    switch (dashboardType) {
      case "student":
        return <StudentDashboard onLogout={handleLogout} />
      case "tutor":
        return <TutorDashboard onLogout={handleLogout} />
      case "admin":
        return <AdminDashboard onLogout={handleLogout} />
      case "bursary":
      default:
        return (
          <BursaryProvider>
            <BursaryDashboard onLogout={handleLogout} initialTab={initialTab} />
          </BursaryProvider>
        )
    }
  }

  // For non-bursary dashboards, render directly without the portal route banner
  if (dashboardType !== "bursary") {
    return renderDashboard()
  }

  // Bursary dashboard with portal route banner
  return (
    <main className="modern-shell min-h-screen">
      <div className="modern-content border-b border-[rgba(255,0,144,0.2)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[#960056] sm:px-6">
        Portal route: {roleLabel}
      </div>
      <div className="modern-content">
        {renderDashboard()}
      </div>
    </main>
  )
}
