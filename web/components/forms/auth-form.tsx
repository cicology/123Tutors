"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export type LoginRole = "student" | "tutor" | "bursary_admin" | "admin"

interface AuthFormProps {
  onLogin: (email: string, role?: LoginRole) => void
  initialMode?: "login" | "signup"
  modeLock?: boolean
  compact?: boolean
  loginRole?: LoginRole
  onLoginRoleChange?: (role: LoginRole) => void
}

const loginRoleCards: Array<{
  value: LoginRole
  label: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { value: "student", label: "Student / Parent", detail: "Track requests and progress", icon: GraduationCap },
  { value: "tutor", label: "Tutor", detail: "Manage sessions and jobs", icon: BriefcaseBusiness },
  { value: "bursary_admin", label: "Bursary Admin", detail: "Run bursary operations", icon: Users },
  { value: "admin", label: "Platform Admin", detail: "Oversee full system", icon: ShieldCheck },
]

export function AuthForm({
  onLogin,
  initialMode = "login",
  modeLock = false,
  compact = false,
  loginRole = "student",
  onLoginRoleChange,
}: AuthFormProps) {
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

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setGeneralError("")
    setSuccessMessage("")

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setGeneralError(error.message)
        } else if (data.user) {
          onLogin(data.user.email || email, loginRole)
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setGeneralError(error.message)
        } else if (data.user) {
          setSuccessMessage("Account created successfully. Check your email to verify your account.")
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
    <div className={compact ? "p-4 sm:p-6" : "min-h-screen p-4 sm:p-6"}>
      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-[#ff009033] bg-white/88 shadow-[0_24px_60px_rgba(54,23,45,0.16)]">
        <div className="pointer-events-none absolute -left-24 -top-24 h-44 w-44 rounded-full bg-[#ff6bc740] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-52 w-52 rounded-full bg-[#ff009030] blur-3xl" />

        <div className="relative z-10 border-b border-[#1f1b1724] px-5 pb-4 pt-6 sm:px-7 sm:pt-7">
          <div className="flex items-center gap-4">
            <img
              src="/images/123tutors-logo.png"
              alt="123Tutors"
              className="h-14 w-14 rounded-2xl border border-[#ff009055] bg-white p-1 object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#960056]">123Tutors Platform</p>
              <h1 className="mt-1 text-xl font-semibold text-[#1f1b17]">{isLogin ? "Welcome back" : "Create account"}</h1>
              <p className="text-sm text-[#5a534d]">
                {isLogin ? "Sign in and continue where you left off." : "Set up your account in under a minute."}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-6">
          {isLogin && onLoginRoleChange ? (
            <div className="mb-5 space-y-2">
              <Label className="text-sm font-medium text-[#3f3833]">Choose your role</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {loginRoleCards.map((role) => {
                  const Icon = role.icon
                  const active = loginRole === role.value
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => onLoginRoleChange(role.value)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        active
                          ? "border-[#ff0090] bg-[#ff009015] shadow-[0_8px_20px_rgba(255,0,144,0.12)]"
                          : "border-[#1f1b1724] bg-white hover:border-[#ff009066] hover:bg-[#ff00900a]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 rounded-lg p-1.5 ${
                            active ? "bg-[#ff009025] text-[#960056]" : "bg-[#f7f1f6] text-[#725f6b]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#251f1a]">{role.label}</p>
                          <p className="text-xs text-[#6b625b]">{role.detail}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {successMessage ? (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700">{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          {generalError ? (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">{generalError}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#3f3833]">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-11 border-[#1f1b1726] bg-white/90 text-[15px] focus-visible:ring-[#ff009055] ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#3f3833]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`h-11 border-[#1f1b1726] bg-white/90 pr-10 text-[15px] focus-visible:ring-[#ff009055] ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-9 px-2 text-[#756a61] hover:bg-[#ff009011] hover:text-[#1f1b17]"
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
            </div>

            {!isLogin ? (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#3f3833]">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`h-11 border-[#1f1b1726] bg-white/90 text-[15px] focus-visible:ring-[#ff009055] ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {errors.confirmPassword ? <p className="text-xs text-red-600">{errors.confirmPassword}</p> : null}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-[#ff0090] to-[#ff4dae] text-sm font-semibold text-white hover:opacity-95"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign in to dashboard" : "Create account"}
            </Button>
          </form>

          {!modeLock ? (
            <div className="mt-5 text-center text-sm text-[#615852]">
              {isLogin ? "No account yet?" : "Already have an account?"}
              <Button
                variant="link"
                className="ml-1 h-auto p-0 font-semibold text-[#960056] hover:text-[#770046]"
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
                {isLogin ? "Create one" : "Sign in"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

