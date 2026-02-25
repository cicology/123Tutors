"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  email?: string
  className?: string
}

export function ImageUpload({ currentImageUrl, onImageUploaded, email, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 5MB.')
      return
    }

    setError(null)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      if (!email) {
        throw new Error('Email is required for image upload')
      }
      const result = await apiService.uploadProfileImage(email, file)
      onImageUploaded(result.imageUrl)
      setPreviewUrl(null)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = previewUrl || currentImageUrl

  return (
    <Card className={`bg-white border-[#FF0090] border-2 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#FF0090] mb-2">Profile Image</h3>
            
            {/* Image Display */}
            <div className="relative inline-block">
              {displayImage ? (
                <div className="relative">
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-[#FF0090] mx-auto"
                  />
                  {previewUrl && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full border-2 border-dashed border-[#FF0090] flex items-center justify-center mx-auto">
                  <ImageIcon className="h-8 w-8 text-[#FF0090]" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF0090] mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {displayImage ? 'Change Image' : 'Upload Image'}
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Upload Instructions */}
            <div className="mt-2 text-xs text-gray-500">
              <p>Supported formats: JPEG, PNG, GIF, WebP</p>
              <p>Maximum size: 5MB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
