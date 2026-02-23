import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { api } from "../../services/api";

function safeArray(data) {
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [requestStats, setRequestStats] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [
          dashboardData,
          tutorRequests,
          tutorUsers,
          reqStats,
          invStats,
        ] = await Promise.all([
          api.getAnalyticsDashboard(),
          api.getTutorRequests({ limit: 400 }),
          api.getUsersByType("tutor"),
          api.getTutorRequestStats(),
          api.getInvoiceStats(),
        ]);

        setDashboard(dashboardData || null);
        setRequests(safeArray(tutorRequests));
        setTutors(safeArray(tutorUsers));
        setRequestStats(reqStats || null);
        setInvoiceStats(invStats || null);
      } catch (err) {
        setError(err.message || "Unable to load analytics.");
      }
    };

    load();
  }, []);

  const revenue = Number(invoiceStats?.totalRevenue || 0);
  const tutorPayments = useMemo(
    () => requests.reduce((sum, request) => sum + Number(request.tutorRatePerHour || 0), 0),
    [requests],
  );
  const profit = revenue - tutorPayments;

  const marketingSpend = useMemo(
    () => requests.reduce((sum, request) => sum + Number(request.platformFee || 0), 0),
    [requests],
  );

  const marketingRevenue = useMemo(
    () => requests.reduce((sum, request) => sum + Number(request.totalAmount || 0), 0),
    [requests],
  );

  const marketingRoi = marketingSpend > 0 ? ((marketingRevenue - marketingSpend) / marketingSpend) * 100 : 0;

  return (
    <section className="page-wrap">
      <h1>Analytics</h1>
      <p>Revenue, profitability, marketing ROI, and tutor growth metrics.</p>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="card-grid three">
        <StatCard label="Revenue" value={`R ${revenue.toFixed(2)}`} />
        <StatCard label="Tutor payments" value={`R ${tutorPayments.toFixed(2)}`} />
        <StatCard label="Profit" value={`R ${profit.toFixed(2)}`} />
        <StatCard label="Marketing spend" value={`R ${marketingSpend.toFixed(2)}`} />
        <StatCard label="Marketing ROI" value={`${marketingRoi.toFixed(1)}%`} />
        <StatCard label="Tutor signups" value={tutors.length} />
      </div>

      <section className="card">
        <h2>Request Funnel</h2>
        <div className="card-grid three">
          <StatCard label="Total requests" value={requestStats?.totalRequests || 0} />
          <StatCard label="Pending" value={requestStats?.pendingRequests || 0} />
          <StatCard label="Approved/Paid" value={requestStats?.approvedRequests || 0} />
          <StatCard label="Rejected" value={requestStats?.rejectedRequests || 0} />
          <StatCard label="Total amount" value={`R ${Number(requestStats?.totalAmount || 0).toFixed(2)}`} />
          <StatCard label="Paid amount" value={`R ${Number(requestStats?.paidAmount || 0).toFixed(2)}`} />
        </div>
      </section>

      <section className="card">
        <h2>Invoice Health</h2>
        <div className="card-grid three">
          <StatCard label="Total invoices" value={invoiceStats?.totalInvoices || 0} />
          <StatCard label="Paid invoices" value={invoiceStats?.paidInvoices || 0} />
          <StatCard label="Pending invoices" value={invoiceStats?.pendingInvoices || 0} />
          <StatCard label="Overdue invoices" value={invoiceStats?.overdueInvoices || 0} />
          <StatCard label="Pending amount" value={`R ${Number(invoiceStats?.pendingAmount || 0).toFixed(2)}`} />
          <StatCard label="Dashboard data source" value={dashboard ? "Live API" : "Fallback"} />
        </div>
      </section>

      <section className="card">
        <h2>Tutor Signup Stats</h2>
        {tutors.length === 0 ? <p className="muted-text">No tutor profiles found.</p> : null}
        <div className="card-grid two">
          {tutors.map((tutor) => (
            <article className="card subtle" key={tutor.email}>
              <p><strong>{tutor.email}</strong></p>
              <p>ID: {tutor.uniqueId}</p>
              <p>Created: {tutor.creationDate ? new Date(tutor.creationDate).toLocaleDateString() : "-"}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
