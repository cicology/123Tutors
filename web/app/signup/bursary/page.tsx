import { AuthRouteShell } from "@/components/features/auth-route-shell"

export default function SignupBursaryPage() {
  return (
    <AuthRouteShell
      mode="signup"
      signupRole="bursary_admin"
      title="Bursary Admin Signup"
      description="Create a bursary admin account and continue to the bursary dashboard."
    />
  )
}

