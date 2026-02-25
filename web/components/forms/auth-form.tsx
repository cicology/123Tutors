"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AuthFormProps {
  onLogin: (email: string) => void
  initialMode?: "login" | "signup"
  modeLock?: boolean
  compact?: boolean
}

export function AuthForm({ onLogin, initialMode = "login", modeLock = false, compact = false }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialMode !== "signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [generalError, setGeneralError] = useState("")

  useEffect(() => {
    setIsLogin(initialMode !== "signup")
  }, [initialMode])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setGeneralError("")
    setSuccessMessage("")

    try {
      if (isLogin) {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setGeneralError(error.message)
        } else if (data.user) {
          onLogin(data.user.email || email)
        }
      } else {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setGeneralError(error.message)
        } else if (data.user) {
          setSuccessMessage("Account created successfully! Please check your email to verify your account.")
          setIsLogin(true)
          setEmail("")
          setPassword("")
          setConfirmPassword("")
        }
      }
    } catch (error: any) {
      setGeneralError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={compact ? "p-4 sm:p-6" : "min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8"}>
      <div className="w-full max-w-md space-y-4 sm:space-y-6 mx-auto">
        <div className="text-center space-y-2 sm:space-y-3">
          <img
            src="/images/123tutors-logo.png"
            alt="123tutors"
            className="h-12 w-12 sm:h-16 sm:w-16 mx-auto rounded-full object-cover border-2 border-[#FF0090]"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-[#1f1b17]">123Tutors Portal</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <Card className="modern-panel bg-white/85 border-[rgba(31,27,23,0.14)] shadow-lg">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl text-center text-[#960056]">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {isLogin ? "Enter your credentials to access the dashboard" : "Fill in your details to create an account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {successMessage && (
              <Alert className="mb-3 sm:mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600 text-xs sm:text-sm">{successMessage}</AlertDescription>
              </Alert>
            )}

            {generalError && (
              <Alert className="mb-3 sm:mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 text-xs sm:text-sm">{generalError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm sm:text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090] text-sm sm:text-base ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <Alert className="py-1 sm:py-2 border-red-200 bg-red-50">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    <AlertDescription className="text-red-600 text-xs sm:text-sm">{errors.email}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm sm:text-base">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090] pr-10 text-sm sm:text-base ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <Alert className="py-1 sm:py-2 border-red-200 bg-red-50">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    <AlertDescription className="text-red-600 text-xs sm:text-sm">{errors.password}</AlertDescription>
                  </Alert>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 text-sm sm:text-base">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090] text-sm sm:text-base ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <Alert className="py-1 sm:py-2 border-red-200 bg-red-50">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      <AlertDescription className="text-red-600 text-xs sm:text-sm">
                        {errors.confirmPassword}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#FF0090] hover:bg-[#E6007A] text-white text-sm sm:text-base py-2 sm:py-3"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {!modeLock && (
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    variant="link"
                    className="p-0 ml-1 text-[#960056] hover:text-[#7a0046] text-xs sm:text-sm"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setErrors({})
                      setGeneralError("")
                      setSuccessMessage("")
                      setEmail("")
                      setPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>© 2024 123tutors. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
