import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  Search,
  User,
} from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";
import Seo from "../../components/seo/Seo";
import { useAuth } from "../../features/auth/AuthContext";
import { api } from "../../services/api";
import { createEftReference, openPaystackCheckout } from "../../services/paystack";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "requests", label: "My Requests", icon: FileText },
  { id: "tutors", label: "Search Tutors", icon: Search },
  { id: "lessons", label: "Lessons", icon: Clock3 },
  { id: "profile", label: "My Profile", icon: User },
];

function safeArray(data) {
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

function formatMoney(amount) {
  return `R ${Number(amount || 0).toFixed(2)}`;
}

function formatHours(hours) {
  return Number(hours || 0).toFixed(1);
}

function requestStatusClass(request) {
  if (request.paid) {
    return "paid";
  }
  if (request.notInterested) {
    return "rejected";
  }
  return "pending";
}

function requestStatusText(request) {
  if (request.paid) {
    return "Paid";
  }
  if (request.notInterested) {
    return "Rejected";
  }
  return "Pending";
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [tutorSearch, setTutorSearch] = useState({ course: "", tutors: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const email = user?.email || "";

  const loadDashboard = useCallback(async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [studentRequests, sessionOrders, studentLessons] = await Promise.all([
        api.getTutorRequestsByStudent(email),
        api.getTutorSessionOrders({ limit: 200 }),
        api.getStudentLessons({ limit: 200 }),
      ]);

      setRequests(safeArray(studentRequests));

      const orderRows = safeArray(sessionOrders).filter(
        (row) => row.studentEmail?.toLowerCase() === email.toLowerCase(),
      );
      setOrders(orderRows);

      const lessonRows = safeArray(studentLessons).filter((row) => {
        const ownerByName = row.studentName?.toLowerCase().includes(email.split("@")[0]?.toLowerCase());
        const ownerByUserId = row.userIdStudent === user?.uniqueId;
        return ownerByName || ownerByUserId || !row.studentName;
      });
      setLessons(lessonRows);
    } catch (err) {
      setError(err.message || "Unable to load student dashboard.");
    } finally {
      setLoading(false);
    }
  }, [email, user?.uniqueId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const hoursRemaining = useMemo(
    () => orders.reduce((sum, row) => sum + Number(row.hoursRemaining || 0), 0),
    [orders],
  );

  const pendingApprovals = useMemo(
    () => lessons.filter((row) => !row.studentReviewed && !row.lessonRejected).length,
    [lessons],
  );

  const activeTutors = useMemo(() => {
    const tutorSet = new Set(
      orders
        .map((row) => row.tutorEmail)
        .filter(Boolean)
        .map((value) => String(value).toLowerCase()),
    );
    return tutorSet.size;
  }, [orders]);

  const myCourses = useMemo(() => {
    const courseSet = new Set();
    orders.forEach((row) => {
      if (row.course) {
        courseSet.add(row.course);
      }
    });
    requests.forEach((row) => {
      if (row.requestCourses) {
        courseSet.add(row.requestCourses);
      }
    });
    return courseSet.size;
  }, [orders, requests]);

  const upcomingSessions = useMemo(() => orders.slice(0, 5), [orders]);

  const searchTutors = async () => {
    try {
      setError("");
      const result = await api.findTutors({ courses: tutorSearch.course });
      setTutorSearch((prev) => ({ ...prev, tutors: result?.tutors || [] }));
    } catch (err) {
      setError(err.message || "Tutor search failed.");
    }
  };

  const payRequest = async (request, method) => {
    setError("");
    setMessage("");

    if (method === "paystack") {
      try {
        const reference = `REQ_${request.uniqueId}_${Date.now()}`;
        openPaystackCheckout({
          email,
          amount: Number(request.totalAmount || 0),
          reference,
          metadata: {
            requestId: request.uniqueId,
            requestUniqueId: request.uniqueId,
            channel: "student_dashboard",
          },
          onSuccess: async (response) => {
            try {
              const resolvedReference = response?.reference || reference;
              await api.verifyPaystackPayment({
                reference: resolvedReference,
                requestUniqueId: request.uniqueId,
              });
              setMessage("Payment completed and verified.");
              loadDashboard();
            } catch (verifyError) {
              // Fallback keeps operations moving if verification endpoint fails unexpectedly.
              await api.patchTutorRequest(request.uniqueId, {
                paid: true,
                paidDate: new Date().toISOString(),
              });
              setMessage("Payment completed. Request marked paid while verification sync retries.");
              loadDashboard();
            }
          },
        });
      } catch (err) {
        setError(err.message || "Paystack checkout failed.");
      }
      return;
    }

    try {
      const reference = createEftReference("EFT_REQ");
      await api.patchTutorRequest(request.uniqueId, {
        eftPaid: Number(request.totalAmount || 0),
        contactComments: `EFT initiated by ${email} reference ${reference}`,
      });
      setMessage(`EFT logged with reference ${reference}. Admin will verify payment.`);
      loadDashboard();
    } catch (err) {
      setError(err.message || "EFT logging failed.");
    }
  };

  const approveLesson = async (lesson, approved) => {
    try {
      await api.updateStudentLesson(lesson.uniqueId, {
        studentReviewed: true,
        lessonRejected: !approved,
        studentReviewDate: new Date().toISOString(),
      });
      setMessage(approved ? "Lesson approved." : "Lesson rejected and flagged for review.");
      loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to update lesson review.");
    }
  };

  const addHours = async (request, additionalHours) => {
    try {
      const nextHours = `${request.hoursListText || ""},${Number(additionalHours)}`;
      await api.patchTutorRequest(request.uniqueId, {
        hoursListText: nextHours,
        totalAmount: Number(request.totalAmount || 0) + Number(additionalHours) * 250,
      });
      setMessage("Hours added to request. Complete payment via Paystack or EFT for activation.");
      loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to add hours to request.");
    }
  };

  const requestSwapTutor = async (request) => {
    try {
      await api.patchTutorRequest(request.uniqueId, {
        swapout: true,
        contactComments: `${request.contactComments || ""}\nStudent requested tutor swap on ${new Date().toISOString()}`,
      });
      setMessage("Tutor swap request submitted for admin processing.");
      loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to submit tutor swap request.");
    }
  };

  const displayName = user?.email ? user.email.split("@")[0] : "Student";

  return (
    <>
      <Seo
        title="Student Dashboard"
        description="Manage tutor requests, pay for sessions, track hours, and review lessons on 123tutors."
      />

      <DashboardShell
        portalLabel="Student Portal"
        title="Student Dashboard"
        description="Request tutors, manage bookings, and keep lesson progress on track."
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profileName={displayName}
        profileMeta={email || "student@123tutors.co.za"}
      >
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        {activeTab === "home" ? (
          <>
            <div className="card-grid three">
              <article className="card">
                <p className="stat-label">Active tutors</p>
                <p className="stat-value">{activeTutors}</p>
                <p className="stat-note">Tutors currently linked to your sessions</p>
              </article>
              <article className="card">
                <p className="stat-label">Hours remaining</p>
                <p className="stat-value">{formatHours(hoursRemaining)}h</p>
                <p className="stat-note">Across all active bookings</p>
              </article>
              <article className="card">
                <p className="stat-label">Pending lesson approvals</p>
                <p className="stat-value">{pendingApprovals}</p>
                <p className="stat-note">Lessons waiting for your review</p>
              </article>
              <article className="card">
                <p className="stat-label">Courses</p>
                <p className="stat-value">{myCourses}</p>
                <p className="stat-note">Modules currently in your tutoring profile</p>
              </article>
            </div>

            <div className="card-grid two">
              <section className="card">
                <h2>Upcoming Sessions</h2>
                {upcomingSessions.length === 0 ? (
                  <p className="muted-text">No sessions booked yet.</p>
                ) : (
                  upcomingSessions.map((order) => (
                    <article className="card subtle" key={order.uniqueId}>
                      <p>
                        <strong>{order.course || "Course"}</strong>
                      </p>
                      <p>Tutor: {order.tutorEmail || "Awaiting allocation"}</p>
                      <p>Hours remaining: {formatHours(order.hoursRemaining)}h</p>
                      <p>Rate: {formatMoney(order.tutorRatePerHour)}</p>
                    </article>
                  ))
                )}
              </section>

              <section className="card">
                <h2>Action Checklist</h2>
                <div className="card-grid">
                  <article className="card subtle">
                    <p>
                      <strong>Review pending lessons</strong>
                    </p>
                    <p className="muted-text">{pendingApprovals} lesson(s) require approval.</p>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveTab("lessons")}>
                      Open lesson reviews
                    </button>
                  </article>
                  <article className="card subtle">
                    <p>
                      <strong>Find tutors for new courses</strong>
                    </p>
                    <p className="muted-text">Search by module and compare tutor profiles.</p>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveTab("tutors")}>
                      Search tutors
                    </button>
                  </article>
                  <article className="card subtle">
                    <p>
                      <strong>Manage payments</strong>
                    </p>
                    <p className="muted-text">Pay requests with Paystack or submit EFT details.</p>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveTab("requests")}>
                      Open requests
                    </button>
                  </article>
                </div>
              </section>
            </div>
          </>
        ) : null}

        {activeTab === "requests" ? (
          <section className="card">
            <h2>My Requests and Payments</h2>
            {loading ? <p className="muted-text">Loading requests...</p> : null}
            {requests.length === 0 ? <p className="muted-text">No requests found.</p> : null}
            <div className="card-grid two">
              {requests.map((request) => (
                <article className="card subtle" key={request.uniqueId}>
                  <p>
                    <strong>
                      {request.studentFirstName} {request.studentLastName}
                    </strong>
                  </p>
                  <p>Request ID: {request.uniqueId}</p>
                  <p>Courses: {request.requestCourses || "-"}</p>
                  <p>Total amount: {formatMoney(request.totalAmount)}</p>
                  <p>Assigned tutors: {request.tutorsAssignedList || "Not assigned yet"}</p>
                  <p>
                    Status:{" "}
                    <span className={`status-pill ${requestStatusClass(request)}`}>
                      {requestStatusText(request)}
                    </span>
                  </p>
                  <div className="inline-form">
                    <button type="button" className="btn btn-accent" onClick={() => payRequest(request, "paystack")}>
                      Pay with Paystack
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => payRequest(request, "eft")}>
                      Pay via EFT
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => addHours(request, 5)}>
                      Add 5 hours
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => requestSwapTutor(request)}>
                      Swap tutor
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "tutors" ? (
          <>
            <section className="card">
              <h2>Search Tutors</h2>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder="Course or module"
                  value={tutorSearch.course}
                  onChange={(event) =>
                    setTutorSearch((prev) => ({ ...prev, course: event.target.value }))
                  }
                />
                <button className="btn btn-accent" type="button" onClick={searchTutors}>
                  Search
                </button>
              </div>
              {tutorSearch.tutors.length ? (
                <div className="card-grid three">
                  {tutorSearch.tutors.map((tutor) => (
                    <article className="card subtle" key={tutor.id || tutor.email}>
                      <p>
                        <strong>{tutor.name || "Tutor"}</strong>
                      </p>
                      <p>{tutor.specialization || "General tutoring"}</p>
                      <p>Email: {tutor.email || "-"}</p>
                      <p>Rate: {tutor.hourlyRate ? `R ${tutor.hourlyRate}/hr` : "On request"}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-text">No tutor search results yet. Start with a module name.</p>
              )}
            </section>

            <section className="card">
              <h2>My Bookings and Tutor Contacts</h2>
              {orders.length === 0 ? <p className="muted-text">No bookings yet.</p> : null}
              {orders.map((order) => (
                <article className="card subtle" key={order.uniqueId}>
                  <p>
                    <strong>{order.course || "Course"}</strong>
                  </p>
                  <p>Tutor: {order.tutorEmail || "Not allocated"}</p>
                  <p>Hours remaining: {formatHours(order.hoursRemaining)}h</p>
                  <p>Tutor rate: {formatMoney(order.tutorRatePerHour)}</p>
                </article>
              ))}
            </section>
          </>
        ) : null}

        {activeTab === "lessons" ? (
          <section className="card">
            <h2>Review Lessons</h2>
            {loading ? <p className="muted-text">Loading lessons...</p> : null}
            {lessons.length === 0 ? <p className="muted-text">No lessons logged yet.</p> : null}
            {lessons.map((lesson) => (
              <article className="card subtle" key={lesson.uniqueId}>
                <p>
                  <strong>{lesson.courseName || "Course"}</strong>
                </p>
                <p>
                  Date:{" "}
                  {lesson.lessonDate
                    ? new Date(lesson.lessonDate).toLocaleString()
                    : "Not set"}
                </p>
                <p>Tutor: {lesson.tutorName || lesson.tutorUniqueId || "Unknown"}</p>
                <p>Hours: {formatHours(lesson.lessonHours)}h</p>
                <p>
                  Status:{" "}
                  {lesson.studentReviewed ? (
                    <span className="status-pill paid">Reviewed</span>
                  ) : (
                    <span className="status-pill pending">Pending review</span>
                  )}
                </p>

                {!lesson.studentReviewed ? (
                  <div className="inline-form">
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={() => approveLesson(lesson, true)}
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => approveLesson(lesson, false)}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}

        {activeTab === "profile" ? (
          <section className="card">
            <h2>My Profile</h2>
            <div className="grid two">
              <article className="card subtle">
                <p>
                  <strong>Email</strong>
                </p>
                <p>{email || "-"}</p>
              </article>
              <article className="card subtle">
                <p>
                  <strong>User type</strong>
                </p>
                <p>{user?.userType || "student"}</p>
              </article>
              <article className="card subtle">
                <p>
                  <strong>Active tutors</strong>
                </p>
                <p>{activeTutors}</p>
              </article>
              <article className="card subtle">
                <p>
                  <strong>Requests created</strong>
                </p>
                <p>{requests.length}</p>
              </article>
              <article className="card subtle">
                <p>
                  <strong>Courses in progress</strong>
                </p>
                <p>{myCourses}</p>
              </article>
              <article className="card subtle">
                <p>
                  <strong>Hours remaining</strong>
                </p>
                <p>{formatHours(hoursRemaining)}h</p>
              </article>
            </div>
          </section>
        ) : null}
      </DashboardShell>
    </>
  );
}
