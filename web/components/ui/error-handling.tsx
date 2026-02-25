"use client"

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  error: string | null
  onRetry?: () => void
  title?: string
  description?: string
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  title = "Something went wrong", 
  description = "An unexpected error occurred. Please try again." 
}: ErrorBoundaryProps) {
  if (!error) return null

  const isNetworkError = error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')
  const isServerError = error.toLowerCase().includes('server') || error.toLowerCase().includes('500')
  const isNotFoundError = error.toLowerCase().includes('not found') || error.toLowerCase().includes('404')

  return (
    <Card className="w-full max-w-md mx-auto border-red-200 bg-red-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {isNetworkError ? (
            <WifiOff className="h-12 w-12 text-red-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <CardTitle className="text-red-800">{title}</CardTitle>
        <CardDescription className="text-red-600">
          {isNetworkError 
            ? "Unable to connect to the server. Please check your internet connection."
            : isServerError
            ? "The server is experiencing issues. Please try again later."
            : isNotFoundError
            ? "The requested resource was not found."
            : description
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-y-3">
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded-md">
            <strong>Error details:</strong> {error}
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface LoadingDisplayProps {
  message?: string
}

export function LoadingDisplay({ message = "Loading..." }: LoadingDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0090]"></div>
      <div className="text-lg text-gray-600">{message}</div>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon 
}: EmptyStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-gray-200 bg-gray-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {icon || <div className="h-12 w-12 bg-gray-300 rounded-full"></div>}
        </div>
        <CardTitle className="text-gray-800">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      {actionLabel && onAction && (
        <CardContent className="text-center">
          <Button onClick={onAction} className="bg-[#FF0090] hover:bg-[#E6007A] text-white">
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
