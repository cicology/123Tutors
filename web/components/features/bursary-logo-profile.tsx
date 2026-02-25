"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { apiService } from "@/lib/api-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ui/image-upload"
import { useBursary } from "@/lib/contexts/bursary-context"
import {
  Upload,
  Camera,
  Edit,
  Save,
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  DollarSign,
  Calendar,
  Award,
} from "lucide-react"

interface BursaryProfile {
  uniqueId: string
  bursaryName: string
  logo: string
  description: string
  email: string
  phone: string
  website: string
  address: string
  totalStudents: number
  totalBudget: string
  yearEstablished: number
  programsOffered: number
  primaryColor: string
  secondaryColor: string
}

export function BursaryLogoProfile() {
  const { userProfile, refreshUserProfile } = useBursary()
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<BursaryProfile>({
    uniqueId: "BN_1",
    bursaryName: "South African Education Foundation",
    logo: "/images/123tutors-logo.png",
    description: "Empowering students through quality education and comprehensive bursary programs. We believe in creating opportunities for academic excellence and personal growth.",
    email: "info@saef.org.za",
    phone: "+27 11 123 4567",
    website: "www.saef.org.za",
    address: "123 Education Street, Johannesburg, 2000",
    totalStudents: 45,
    totalBudget: "R1,500,000",
    yearEstablished: 2010,
    programsOffered: 8,
    primaryColor: "#FF0090",
    secondaryColor: "#F8F9FA",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)
  const [logoUploadDialog, setLogoUploadDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        console.log('Loading profile from API...')
        // Try to get existing profile, fallback to default if not found
        const response = await apiService.getBursaryProfile("BN_1") as any
        console.log('API response:', response)
        if (response && response.uniqueId) {
          console.log('Setting profile data:', response)
          setProfile(response)
          setEditedProfile(response)
        } else {
          console.log('No valid profile data found, using defaults')
        }
      } catch (err) {
        console.log('Error loading profile:', err)
        console.log('No existing profile found, using default')
        // Profile doesn't exist yet, keep default values
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Prepare the profile data for the API
      const profileData = {
        uniqueId: editedProfile.uniqueId,
        bursaryName: editedProfile.bursaryName,
        address: editedProfile.address,
        logo: editedProfile.logo,
        description: editedProfile.description,
        email: editedProfile.email,
        phone: editedProfile.phone,
        website: editedProfile.website,
        totalStudents: editedProfile.totalStudents,
        totalBudget: editedProfile.totalBudget,
        yearEstablished: editedProfile.yearEstablished,
        programsOffered: editedProfile.programsOffered,
        primaryColor: editedProfile.primaryColor,
        secondaryColor: editedProfile.secondaryColor,
        slug: editedProfile.bursaryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        creator: 'system'
      }

      // Try to update existing profile first
      try {
        const updatedProfile = await apiService.updateBursaryProfile(editedProfile.uniqueId, profileData) as any
        setProfile(updatedProfile)
        setEditedProfile(updatedProfile)
      } catch (updateError) {
        // If update fails, try to create new profile
        const newProfile = await apiService.createBursaryProfile(profileData) as any
        setProfile(newProfile)
        setEditedProfile(newProfile)
      }

      setIsEditing(false)
      
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userProfile?.email) return

    try {
      setLoading(true)
      // Upload to storage service (same as profile image)
      const result = await apiService.uploadProfileImage(userProfile.email, file)
      console.log('Organization logo uploaded:', result.imageUrl)
      
      // Add cache-busting query parameter to force image reload
      const logoUrlWithTimestamp = `${result.imageUrl}?t=${Date.now()}`
      
      // Update profile with new logo URL from Supabase
      setEditedProfile((prev) => ({ ...prev, logo: logoUrlWithTimestamp }))
      setProfile((prev) => ({ ...prev, logo: logoUrlWithTimestamp }))
    } catch (error) {
      console.error('Error uploading organization logo:', error)
      setError('Failed to upload organization logo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 xs:space-y-6 sm:space-y-8 lg:space-y-8 xl:space-y-10 2xl:space-y-12">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900">Bursary Organization Profile</h2>
          <p className="text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl text-gray-600">Manage your organization's branding and information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                className="border-pink-200 bg-transparent"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo Section */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={isEditing ? editedProfile.logo : profile.logo} alt="Organization Logo" />
                <AvatarFallback className="bg-pink-600 text-white text-2xl">
                  {(isEditing ? editedProfile.bursaryName : profile.bursaryName).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                onClick={() => logoFileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-pink-600 hover:bg-pink-700 flex items-center justify-center transition-colors"
                type="button"
                disabled={loading}
              >
                <Camera className="h-4 w-4 text-white" />
              </button>
              {isEditing && (
                <Dialog open={logoUploadDialog} onOpenChange={setLogoUploadDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-pink-600 hover:bg-pink-700"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Update Organization Logo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-pink-200 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 mx-auto text-pink-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-4">Upload your organization's logo</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label htmlFor="logo-upload">
                          <Button asChild className="bg-pink-600 hover:bg-pink-700 text-white">
                            <span>Choose File</span>
                          </Button>
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Recommended: Square image, minimum 200x200px, PNG or JPG format
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Organization Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                      Organization Name
                    </Label>
                    <Input
                      id="orgName"
                      value={editedProfile.bursaryName}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, bursaryName: e.target.value }))}
                      className="border-pink-200 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <textarea
                      id="orgDescription"
                      value={editedProfile.description}
                      onChange={(e) => setEditedProfile((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-pink-200 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 min-h-[80px]"
                      placeholder="Describe your organization's mission and values..."
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <CardTitle className="text-2xl text-gray-900 mb-2">{profile.bursaryName}</CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {profile.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="border-pink-200 text-pink-700">
                      <Building className="h-3 w-3 mr-1" />
                      Educational Foundation
                    </Badge>
                    <Badge variant="outline" className="border-pink-200 text-pink-700">
                      <Award className="h-3 w-3 mr-1" />
                      Bursary Provider
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
              <Users className="h-8 w-8 mx-auto text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-pink-600">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.totalStudents}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({
                        ...prev,
                        totalStudents: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="text-center border-pink-200 focus:border-pink-500 h-8 text-lg font-bold"
                  />
                ) : (
                  profile.totalStudents
                )}
              </div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>

            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
              <DollarSign className="h-8 w-8 mx-auto text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-pink-600">
                {isEditing ? (
                  <Input
                    value={editedProfile.totalBudget}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({
                        ...prev,
                        totalBudget: e.target.value,
                      }))
                    }
                    className="text-center border-pink-200 focus:border-pink-500 h-8 text-lg font-bold"
                  />
                ) : (
                  profile.totalBudget
                )}
              </div>
              <div className="text-sm text-gray-600">Annual Budget</div>
            </div>

            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
              <Calendar className="h-8 w-8 mx-auto text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-pink-600">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.yearEstablished}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({
                        ...prev,
                        yearEstablished: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="text-center border-pink-200 focus:border-pink-500 h-8 text-lg font-bold"
                  />
                ) : (
                  profile.yearEstablished
                )}
              </div>
              <div className="text-sm text-gray-600">Established</div>
            </div>

            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
              <Award className="h-8 w-8 mx-auto text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-pink-600">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedProfile.programsOffered}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({
                        ...prev,
                        programsOffered: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="text-center border-pink-200 focus:border-pink-500 h-8 text-lg font-bold"
                  />
                ) : (
                  profile.programsOffered
                )}
              </div>
              <div className="text-sm text-gray-600">Programs</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-pink-100 pt-6">
            <h3 className="text-base xs:text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-pink-600" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="border-pink-200 focus:border-pink-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-pink-600" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.phone}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="border-pink-200 focus:border-pink-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-pink-600" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">Website</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.website}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="border-pink-200 focus:border-pink-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.website}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    {isEditing ? (
                      <textarea
                        value={editedProfile.address}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-pink-200 rounded-md focus:border-pink-500 focus:ring-1 focus:ring-pink-500 min-h-[60px]"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          {isEditing && (
            <div className="border-t border-pink-100 pt-6 mt-6">
              <h3 className="text-base xs:text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-4">Brand Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Primary Color</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      value={editedProfile.primaryColor}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="w-12 h-10 border border-pink-200 rounded cursor-pointer"
                    />
                    <Input
                      value={editedProfile.primaryColor}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="border-pink-200 focus:border-pink-500"
                      placeholder="#FF0090"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Secondary Color</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="color"
                      value={editedProfile.secondaryColor}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="w-12 h-10 border border-pink-200 rounded cursor-pointer"
                    />
                    <Input
                      value={editedProfile.secondaryColor}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          secondaryColor: e.target.value,
                        }))
                      }
                      className="border-pink-200 focus:border-pink-500"
                      placeholder="#F8F9FA"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="border-pink-200">
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900">Profile Preview</CardTitle>
          <CardDescription>How your organization appears to students and tutors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={isEditing ? editedProfile.logo : profile.logo} alt="Organization Logo" />
                <AvatarFallback className="bg-pink-600 text-white text-xl">
                  {(isEditing ? editedProfile.bursaryName : profile.bursaryName).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{isEditing ? editedProfile.bursaryName : profile.bursaryName}</h3>
                <p className="text-gray-600">Bursary Provider</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {isEditing ? editedProfile.totalStudents : profile.totalStudents} Students
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Since {isEditing ? editedProfile.yearEstablished : profile.yearEstablished}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {isEditing ? editedProfile.description : profile.description}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
