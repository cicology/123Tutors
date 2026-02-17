import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, CheckCircle2, Clock, Plus, ArrowLeft, Users, BookOpen, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const TutorReferrals = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tutorData, setTutorData] = useState<any>(null);

  useEffect(() => {
    fetchReferrals();
    fetchStats();
    fetchTutorData();
  }, []);

  const fetchTutorData = async () => {
    try {
      const response = await apiService.getTutorDashboard();
      if (response.data?.tutor) {
        setTutorData(response.data.tutor);
      }
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await apiService.getReferrals();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      if (response.data) {
        setReferrals(response.data);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getReferralStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const generateCode = async () => {
    try {
      const response = await apiService.generateReferralCode();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Referral code generated successfully");
      fetchReferrals();
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate referral code");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="default" className="bg-orange-500">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeReferral = referrals.find((r) => r.status === "pending" && r.type === "tutor");
  const tutorReferrals = referrals.filter((r) => r.type === "tutor");
  const studentReferrals = referrals.filter((r) => r.type === "student");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-gradient">123tutors</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tutor-dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referrals</h1>
            <p className="text-muted-foreground">Earn rewards by referring new tutors</p>
          </div>
          <Button variant="accent" size="lg" onClick={generateCode}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Code
          </Button>
        </div>

        {tutorData?.isAmbassador && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-200 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600 fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Ambassador Status</h3>
                  <p className="text-sm text-yellow-700">
                    You've earned ambassador status! Keep referring tutors to earn more rewards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.tutorReferrals || 0} tutor, {stats.studentReferrals || 0} student
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed || 0}</div>
                <p className="text-xs text-muted-foreground">Successful referrals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{stats.totalReward?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{stats.pending || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting completion</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Refer Tutor Friends
              </CardTitle>
              <CardDescription>Share your code and earn R100 per friend</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                When a tutor friend signs up using your code and gets approved, you earn R100 and become an Ambassador!
              </p>
              {activeReferral ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Referral Code:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-muted border rounded font-mono text-lg font-bold">
                      {activeReferral.referralCode}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(activeReferral.referralCode)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="accent" onClick={generateCode} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Referral Code
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Refer Students
              </CardTitle>
              <CardDescription>Refer student requests to other tutors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                When you refer a student request to another tutor and both accept, you earn R30!
              </p>
              <p className="text-sm font-medium">
                Go to your dashboard to refer pending course requests to other tutors.
              </p>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link to="/tutor-dashboard">View Requests</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {activeReferral && (
          <Card className="mb-8 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle>Your Active Referral Code</CardTitle>
              <CardDescription>Share this code with others to earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 px-4 py-3 bg-background border rounded-lg font-mono text-lg font-bold">
                  {activeReferral.referralCode}
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(activeReferral.referralCode)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-64 mb-4" />
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No referral codes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first referral code to start earning rewards
              </p>
              <Button variant="accent" onClick={generateCode}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Referral Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {tutorReferrals.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tutor Referrals
                  </CardTitle>
                  <CardDescription>Referrals of tutor friends (R100 per successful referral)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tutorReferrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-semibold text-lg">
                              {referral.referralCode}
                            </span>
                            {getStatusBadge(referral.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created: {format(new Date(referral.createdAt), "MMM dd, yyyy")}
                            {referral.completedAt && (
                              <span className="ml-2">
                                • Completed: {format(new Date(referral.completedAt), "MMM dd, yyyy")}
                              </span>
                            )}
                          </div>
                          {referral.reward > 0 && (
                            <div className="text-sm font-medium text-green-600 mt-1">
                              Reward: R{Number(referral.reward).toFixed(2)}
                            </div>
                          )}
                        </div>
                        {referral.status === "pending" && referral.referralCode && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(referral.referralCode)}
                          >
                            <Copy className="mr-2 h-3 w-3" />
                            Copy
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {studentReferrals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Student Referrals
                  </CardTitle>
                  <CardDescription>Referrals of student requests (R30 per successful referral)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentReferrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">
                              Student Request Referral
                            </span>
                            {getStatusBadge(referral.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created: {format(new Date(referral.createdAt), "MMM dd, yyyy")}
                            {referral.completedAt && (
                              <span className="ml-2">
                                • Completed: {format(new Date(referral.completedAt), "MMM dd, yyyy")}
                              </span>
                            )}
                          </div>
                          {referral.reward > 0 && (
                            <div className="text-sm font-medium text-green-600 mt-1">
                              Reward: R{Number(referral.reward).toFixed(2)}
                            </div>
                          )}
                          {referral.status === "pending" && (
                            <div className="text-xs text-orange-600 mt-1">
                              Waiting for student and tutor to accept
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TutorReferrals;

