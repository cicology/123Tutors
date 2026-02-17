import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let response: any = null;
    try {
      response = await apiService.login(email, password);
      
      if (response.error) {
        toast.error(response.error);
        setLoading(false);
        return;
      }

      if (response.data) {
        const { isStudent, isTutor, isAdmin, roles } = response.data;
        
        // Check for admin first
        if (isAdmin || (roles && roles.includes('admin'))) {
          toast.success("Welcome back, Admin!");
          navigate("/admin-dashboard");
          return;
        }
        
        if (isStudent && isTutor) {
          // Default to student dashboard if user is both student and tutor
          toast.success("Welcome back! Redirecting to student dashboard...");
          navigate("/student-dashboard");
          return;
        }
        
        if (isStudent) {
          toast.success("Welcome back!");
          navigate("/student-dashboard");
          return;
        }
        
        if (isTutor) {
          toast.success("Welcome back!");
          navigate("/tutor-dashboard");
          return;
        }
        
        // Fallback
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (response?.error) {
        errorMessage = response.error;
      }
      
      // Show helpful message for connection errors
      if (errorMessage.includes("Cannot connect") || errorMessage.includes("Failed to fetch")) {
        toast.error(errorMessage, {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold inline-block">
            <span className="text-gradient">123tutors</span>
          </Link>
        </div>

        {/* Sign In Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/find-tutor" className="text-accent hover:underline font-medium">
                  Get started as a student
                </Link>
                {" "}or{" "}
                <Link to="/become-tutor" className="text-accent hover:underline font-medium">
                  become a tutor
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
