import { AuthRouteShell } from "@/components/features/auth-route-shell"

export default function SignupTutorPage() {
  return (
    <AuthRouteShell
      mode="signup"
      signupRole="tutor"
      title="Tutor Signup"
      description="Create a tutor account and continue to the tutor workspace."
    />
  )
}

