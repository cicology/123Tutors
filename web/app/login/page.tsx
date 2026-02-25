import { AuthRouteShell } from "@/components/features/auth-route-shell"

export default function LoginPage() {
  return (
    <AuthRouteShell
      mode="login"
      title="Login"
      description="Access your student, tutor, bursary, or admin dashboard."
    />
  )
}

