"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, BriefcaseBusiness, GraduationCap, ShieldCheck, Users } from "lucide-react"
import { AuthForm, type LoginRole } from "@/components/forms/auth-form"
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

function normalizeUserType(value: string | undefined) {
  if (!value) return "user"
  return value.toLowerCase().replace(/\s+/g, "_")
}

function getDashboardRoute(userType: string | undefined, fallbackRoute = "/dashboard/bursary") {
  const normalizedType = normalizeUserType(userType)
  switch (normalizedType) {
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

function isRoleMatch(selectedRole: LoginRole | undefined, userType: string | undefined) {
  if (!selectedRole) return true
  const normalizedType = normalizeUserType(userType)

  if (selectedRole === "student") {
    return normalizedType === "student" || normalizedType === "user"
  }

  return selectedRole === normalizedType
}

function getRoleLabel(role: LoginRole) {
  switch (role) {
    case "student":
      return "Student / Parent"
    case "tutor":
      return "Tutor"
    case "bursary_admin":
      return "Bursary Admin"
    case "admin":
      return "Platform Admin"
  }
}

const loginPanels = [
  {
    role: "student",
    title: "Student / Parent",
    route: "/dashboard/student",
    icon: GraduationCap,
    signup: "/signup/student-parent",
  },
  {
    role: "tutor",
    title: "Tutor",
    route: "/dashboard/tutor",
    icon: BriefcaseBusiness,
    signup: "/signup/tutor",
  },
  {
    role: "bursary_admin",
    title: "Bursary Admin",
    route: "/dashboard/bursary",
    icon: Users,
    signup: "/signup/bursary",
  },
  {
    role: "admin",
    title: "Platform Admin",
    route: "/dashboard/admin",
    icon: ShieldCheck,
    signup: null,
  },
] as const

export function AuthRouteShell({ mode, title, description, signupRole }: AuthRouteShellProps) {
  const router = useRouter()
  const [routeError, setRouteError] = useState("")
  const [selectedRole, setSelectedRole] = useState<LoginRole>("student")

  const loginPanel = useMemo(
    () => loginPanels.find((panel) => panel.role === selectedRole) ?? loginPanels[0],
    [selectedRole],
  )

  const handleLogin = async (email: string, role?: LoginRole) => {
    setRouteError("")
    const requestedRole = role ?? selectedRole

    try {
      const profile: any = await apiService.getUserProfile(email)
      const profileUserType = profile?.userType ?? profile?.user_type

      if (!isRoleMatch(requestedRole, profileUserType)) {
        setRouteError(
          `This account is registered as ${profileUserType || "another role"}. Switch to ${getRoleLabel(
            requestedRole,
          )} only if that is your actual account type.`,
        )
        return
      }

      router.push(getDashboardRoute(profileUserType))
      return
    } catch {
      // Continue for first-time users with no profile rows.
    }

    if (mode === "login") {
      setRouteError("Account authenticated, but no platform profile was found. Please complete signup for your role.")
      return
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
          <span className="modern-badge">{mode === "login" ? "Role-Based Login" : "New Account"}</span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#1f1b17]">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#4f4a44]">{description}</p>

          {mode === "login" ? (
            <div className="mt-6 rounded-2xl border border-[#1f1b1720] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8f4d74]">Selected destination</p>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-[#ff00902b] bg-[#ff00900f] px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-[#2c2621]">{loginPanel.title}</p>
                  <p className="text-xs text-[#6f655d]">{loginPanel.route}</p>
                </div>
                <loginPanel.icon className="h-5 w-5 text-[#960056]" />
              </div>

              {loginPanel.signup ? (
                <Link
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#960056] underline underline-offset-4"
                  href={loginPanel.signup}
                >
                  New {loginPanel.title} account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <p className="mt-3 text-xs text-[#6f655d]">Admin access is provisioned by platform owners only.</p>
              )}
            </div>
          ) : (
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
          )}
        </aside>

        <div className="rise-in" style={{ animationDelay: "90ms" }}>
          {routeError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {routeError}
            </div>
          ) : null}

          <div className="modern-panel rounded-3xl p-1">
            <AuthForm
              onLogin={handleLogin}
              initialMode={mode}
              modeLock={mode === "login"}
              compact
              loginRole={selectedRole}
              onLoginRoleChange={mode === "login" ? setSelectedRole : undefined}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

