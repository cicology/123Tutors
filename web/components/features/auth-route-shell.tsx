"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/forms/auth-form"
import { apiService } from "@/lib/api-service"

type AuthMode = "login" | "signup"
type SignupRole = "user" | "tutor" | "bursary_admin"

interface AuthRouteShellProps {
  mode: AuthMode
  title: string
  description: string
  signupRole?: SignupRole
}

function buildUniqueId(role: SignupRole) {
  const prefixMap: Record<SignupRole, string> = {
    user: "UP_USER",
    tutor: "UP_TUTOR",
    bursary_admin: "UP_BURSARY",
  }
  return `${prefixMap[role]}_${Date.now()}`
}

function getDashboardRoute(userType: string | undefined, fallbackRoute = "/dashboard/bursary") {
  switch (userType) {
    case "student":
    case "user":
      return "/dashboard/student"
    case "tutor":
      return "/dashboard/tutor"
    case "admin":
      return "/dashboard/admin"
    case "bursary_admin":
      return "/dashboard/bursary"
    default:
      return fallbackRoute
  }
}

export function AuthRouteShell({ mode, title, description, signupRole }: AuthRouteShellProps) {
  const router = useRouter()
  const [routeError, setRouteError] = useState("")

  const handleLogin = async (email: string) => {
    setRouteError("")

    try {
      const profile: any = await apiService.getUserProfile(email)
      router.push(getDashboardRoute(profile?.userType))
      return
    } catch {
      // Continue for first-time users with no profile rows.
    }

    if (signupRole) {
      try {
        const createdProfile = await apiService.createUserProfile({
          email,
          userType: signupRole,
          uniqueId: buildUniqueId(signupRole),
          creator: "next_signup_flow",
        })
        router.push(getDashboardRoute((createdProfile as any)?.userType, getDashboardRoute(signupRole)))
        return
      } catch (error: any) {
        setRouteError(error?.message || "Your account is ready, but profile setup failed. Please contact support.")
      }
    }

    router.push("/dashboard/bursary")
  }

  return (
    <main className="modern-shell min-h-screen">
      <section className="modern-content mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-14">
        <aside className="modern-panel rise-in rounded-3xl p-6 sm:p-8">
          <span className="modern-badge">{mode === "login" ? "Secure Access" : "New Account"}</span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#1f1b17]">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#4f4a44]">{description}</p>
          <div className="mt-6 space-y-3 text-sm text-[#4f4a44]">
            <p>Parity is maintained in workflow and data contracts; this layer modernizes presentation only.</p>
            <p>
              Need tutoring first?{" "}
              <Link className="font-semibold text-[#960056] underline" href="/request">
                Submit a tutor request
              </Link>
              .
            </p>
          </div>
        </aside>

        <div className="rise-in" style={{ animationDelay: "90ms" }}>
          {routeError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {routeError}
            </div>
          ) : null}

          <div className="modern-panel rounded-3xl p-1">
            <AuthForm onLogin={handleLogin} initialMode={mode} modeLock={mode === "login"} compact />
          </div>
        </div>
      </section>
    </main>
  )
}
