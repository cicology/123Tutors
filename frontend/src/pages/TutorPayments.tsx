import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const TutorPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await apiService.getPayments();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      if (response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await apiService.getPaymentSummary();
      if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleRequestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.requestPayment({
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Payment request submitted successfully");
      setDialogOpen(false);
      setFormData({ amount: "", notes: "" });
      fetchPayments();
      fetchSummary();
    } catch (error) {
      console.error("Error requesting payment:", error);
      toast.error("Failed to request payment");
    }
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
      case "student_confirmed":
        return (
          <Badge variant="default" className="bg-blue-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Student Confirmed
          </Badge>
        );
      case "student_declined":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Declined by Student
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="default" className="bg-orange-500">
            <Clock className="mr-1 h-3 w-3" />
            Awaiting Student
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">Payments</h1>
            <p className="text-muted-foreground">Track your earnings and request payouts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Request Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Payment</DialogTitle>
                <DialogDescription>
                  Submit a payment request for your earnings
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRequestPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZAR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information about this payment request..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent">
                    Request Payment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {summary && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{summary.total?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{summary.thisMonth?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Current month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  R{summary.pending?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting payout</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalHours?.toFixed(1) || "0.0"}</div>
                <p className="text-xs text-muted-foreground">{summary.totalSessions || 0} sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{summary.lastMonth?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Previous month</p>
              </CardContent>
            </Card>
          </div>
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
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-sm text-muted-foreground">
                Payment history will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => {
                  const hours = payment.sessionDuration ? Math.floor(payment.sessionDuration / 60) : 0;
                  const minutes = payment.sessionDuration ? payment.sessionDuration % 60 : 0;
                  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                  
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">R{Number(payment.tutorAmount || payment.amount).toFixed(2)}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(payment.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                          {payment.paidAt && (
                            <span className="ml-2">
                              • Paid: {format(new Date(payment.paidAt), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>
                        {payment.sessionDuration && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Session Duration: {durationText}
                          </p>
                        )}
                        {payment.lesson?.subject && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Subject: {payment.lesson.subject} • Student: {payment.student?.firstName} {payment.student?.lastName}
                          </p>
                        )}
                        {payment.status === 'student_declined' && payment.notes && (
                          <p className="text-xs text-red-500 mt-1 italic">
                            Decline reason: {payment.notes}
                          </p>
                        )}
                        {payment.status === 'pending' && (
                          <p className="text-xs text-orange-500 mt-1">
                            Waiting for student confirmation
                          </p>
                        )}
                        {payment.status === 'student_confirmed' && (
                          <p className="text-xs text-blue-500 mt-1">
                            Student confirmed • Awaiting finalization
                          </p>
                        )}
                        {payment.notes && payment.status !== 'student_declined' && (
                          <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Total: R{Number(payment.amount).toFixed(2)}
                        </p>
                        {payment.commissionAmount && (
                          <p className="text-xs text-muted-foreground">
                            Commission: R{Number(payment.commissionAmount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TutorPayments;

