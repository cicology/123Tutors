import { AuthRouteShell } from "@/components/features/auth-route-shell"

export default function SignupStudentParentPage() {
  return (
    <AuthRouteShell
      mode="signup"
      signupRole="user"
      title="Student / Parent Signup"
      description="Create a student account and continue to the student dashboard."
    />
  )
}

