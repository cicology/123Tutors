import React, { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { api } from "../../services/api";
import { createEftReference, openPaystackCheckout } from "../../services/paystack";
import { useAuth } from "../../features/auth/AuthContext";

function safeArray(data) {
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

function containsAssignedTutor(request) {
  return Boolean(request?.tutorsAssignedList && String(request.tutorsAssignedList).trim().length);
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tutorSearch, setTutorSearch] = useState({
    specialization: "",
    programme: "",
    university: "",
    tutors: [],
  });
  const [manualAction, setManualAction] = useState({
    requestId: "",
    hoursToAdd: 0,
    invoiceAmount: 0,
    studentEmail: "",
    studentName: "",
    bursaryName: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const [
        requestsResult,
        tutorsResult,
        ordersResult,
        stats,
        noteResult,
      ] = await Promise.all([
        api.getTutorRequests({ limit: 300 }),
        api.getUsersByType("tutor"),
        api.getTutorSessionOrders({ limit: 300 }),
        api.getTutorRequestStats(),
        api.getNotifications(user?.bursaryName || ""),
      ]);

      const requestRows = safeArray(requestsResult);
      setRequests(requestRows);
      setTutors(safeArray(tutorsResult));
      setOrders(safeArray(ordersResult));
      setNotifications(Array.isArray(noteResult) ? noteResult : []);

      if (stats?.totalRequests !== undefined) {
        setMessage(`Dashboard synced: ${stats.totalRequests} total requests.`);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard.");
    }
  }, [user?.bursaryName]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const newTutorRequests = useMemo(
    () => requests.filter((request) => !request.paid && !request.notInterested),
    [requests],
  );

  const unallocatedPaid = useMemo(
    () => requests.filter((request) => request.paid && !containsAssignedTutor(request)),
    [requests],
  );

  const allocatedPaid = useMemo(
    () => requests.filter((request) => request.paid && containsAssignedTutor(request)),
    [requests],
  );

  const refundedStudents = useMemo(
    () => requests.filter((request) => request.refunded),
    [requests],
  );

  const creditedHoursStudents = useMemo(
    () => requests.filter((request) => Number(request.credited || 0) > 0),
    [requests],
  );

  const addedHoursStudents = useMemo(
    () => requests.filter((request) => String(request.hoursListText || "").includes(",")),
    [requests],
  );

  const payrollTotal = useMemo(
    () =>
      orders.reduce(
        (sum, row) => sum + Number(row.tutorEarning || 0),
        0,
      ),
    [orders],
  );

  const searchTutors = async () => {
    try {
      const result = await api.findTutors({
        specialization: tutorSearch.specialization,
        programme: tutorSearch.programme,
        university: tutorSearch.university,
      });
      setTutorSearch((prev) => ({ ...prev, tutors: result?.tutors || [] }));
    } catch (err) {
      setError(err.message || "Tutor search failed.");
    }
  };

  const assignTutorToRequest = async (requestId, tutor) => {
    const request = requests.find((row) => row.uniqueId === requestId);
    if (!request) {
      setError("Request not found.");
      return;
    }

    const existing = request.tutorsAssignedList || "";
    const nextList = existing ? `${existing},${tutor.id || tutor.email}` : (tutor.id || tutor.email);

    await api.patchTutorRequest(requestId, {
      tutorsAssignedList: nextList,
      tutorsNotifiedNum: Number(request.tutorsNotifiedNum || 0) + 1,
    });

    setMessage(`Tutor ${tutor.name || tutor.email} assigned to request ${requestId}.`);
    loadDashboard();
  };

  const addHoursAndInvoice = async (event) => {
    event.preventDefault();

    const { requestId, hoursToAdd, invoiceAmount, studentEmail, studentName, bursaryName } = manualAction;
    if (!requestId) {
      setError("Request ID is required.");
      return;
    }

    const request = requests.find((row) => row.uniqueId === requestId);
    if (!request) {
      setError("Request not found.");
      return;
    }

    const nextHours = `${request.hoursListText || ""},${Number(hoursToAdd || 0)}`;
    await api.patchTutorRequest(requestId, {
      hoursListText: nextHours,
      totalAmount: Number(request.totalAmount || 0) + Number(invoiceAmount || 0),
    });

    const invoiceId = api.uniqueId("INV");
    await api.createInvoice({
      uniqueId: invoiceId,
      invoiceNumber: invoiceId,
      studentEmail: studentEmail || request.studentEmail,
      studentName: studentName || `${request.studentFirstName || ""} ${request.studentLastName || ""}`,
      bursaryName: bursaryName || request.bursaryName,
      amount: Number(invoiceAmount || 0),
      status: "pending",
      paymentMethod: "manual_invoice",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requestUniqueId: requestId,
      notes: "Manual invoice from admin dashboard",
      autoSendEmail: true,
    });

    setMessage("Hours added and manual invoice created. PDF/email dispatch can be triggered by invoice service.");
    setManualAction({
      requestId: "",
      hoursToAdd: 0,
      invoiceAmount: 0,
      studentEmail: "",
      studentName: "",
      bursaryName: "",
    });
    loadDashboard();
  };

  const swapTutorOut = async (requestId, reason) => {
    await api.patchTutorRequest(requestId, {
      swapout: true,
      contactComments: `Swap requested by admin. Reason: ${reason}`,
    });
    setMessage(`Swap marked on request ${requestId}.`);
    loadDashboard();
  };

  const payTutor = async (order) => {
    if (!order.tutorEmail) {
      setError("Order has no tutor email.");
      return;
    }

    try {
      openPaystackCheckout({
        email: user?.email || "admin@123tutors.co.za",
        amount: Number(order.tutorEarning || 0),
        reference: `PAY_TUTOR_${order.uniqueId}_${Date.now()}`,
        metadata: {
          orderId: order.uniqueId,
          tutorEmail: order.tutorEmail,
          purpose: "tutor_payroll",
        },
        onSuccess: async () => {
          const ref = createEftReference("TUTOR_PAID");
          await api.createInvoice({
            uniqueId: api.uniqueId("PAYROLL"),
            invoiceNumber: ref,
            studentEmail: order.studentEmail,
            studentName: order.studentName,
            bursaryName: null,
            amount: Number(order.tutorEarning || 0),
            status: "paid",
            paymentMethod: "paystack_tutor_payroll",
            dueDate: new Date().toISOString(),
            requestUniqueId: order.requestId,
            notes: `Tutor payroll paid to ${order.tutorEmail}`,
          });
          setMessage(`Tutor payroll completed for ${order.tutorEmail}.`);
          loadDashboard();
        },
      });
    } catch (err) {
      setError(err.message || "Paystack payroll action failed.");
    }
  };

  return (
    <section className="page-wrap">
      <h1>Admin Dashboard</h1>
      <p>Manage tutor applications, requests, allocations, invoicing, and payroll.</p>

      <div className="card-grid three">
        <StatCard label="New tutor requests" value={newTutorRequests.length} />
        <StatCard label="Unallocated paid" value={unallocatedPaid.length} />
        <StatCard label="Allocated paid" value={allocatedPaid.length} />
        <StatCard label="Refunded students" value={refundedStudents.length} />
        <StatCard label="Credited hours students" value={creditedHoursStudents.length} />
        <StatCard label="Tutor payroll pipeline" value={`R ${payrollTotal.toFixed(2)}`} />
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}

      <section className="card">
        <h2>Tutor Applications</h2>
        {tutors.length === 0 ? <p className="muted-text">No tutor profiles found.</p> : null}
        <div className="card-grid three">
          {tutors.map((tutor) => (
            <article className="card subtle" key={tutor.email}>
              <p><strong>{tutor.email}</strong></p>
              <p>ID: {tutor.uniqueId}</p>
              <p>Bursary: {tutor.bursaryName || "-"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Tutors Search</h2>
        <div className="inline-form">
          <input
            className="input"
            placeholder="Specialization"
            value={tutorSearch.specialization}
            onChange={(event) =>
              setTutorSearch((prev) => ({ ...prev, specialization: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Programme"
            value={tutorSearch.programme}
            onChange={(event) => setTutorSearch((prev) => ({ ...prev, programme: event.target.value }))}
          />
          <input
            className="input"
            placeholder="University"
            value={tutorSearch.university}
            onChange={(event) => setTutorSearch((prev) => ({ ...prev, university: event.target.value }))}
          />
          <button className="btn btn-outline" type="button" onClick={searchTutors}>
            Search tutors
          </button>
        </div>

        {tutorSearch.tutors.length ? (
          <div className="card-grid three">
            {tutorSearch.tutors.map((tutor) => (
              <article className="card subtle" key={tutor.id}>
                <p><strong>{tutor.name}</strong></p>
                <p>{tutor.email}</p>
                <p>{tutor.specialization}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>New Tutor Requests</h2>
        {newTutorRequests.length === 0 ? <p className="muted-text">No pending requests.</p> : null}
        {newTutorRequests.map((request) => (
          <article className="card subtle" key={request.uniqueId}>
            <p>
              <strong>{request.uniqueId}</strong> - {request.studentFirstName} {request.studentLastName}
            </p>
            <p>{request.requestCourses || "No course list"}</p>
            <p>Bursary: {request.bursaryName || "Private"}</p>
            <div className="inline-form">
              <button className="btn btn-outline" type="button" onClick={() => api.approveTutorRequest(request.uniqueId).then(loadDashboard)}>
                Mark Paid/Approved
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => api.rejectTutorRequest(request.uniqueId, "Admin rejected").then(loadDashboard)}>
                Reject
              </button>
              {tutorSearch.tutors[0] ? (
                <button
                  className="btn btn-accent"
                  type="button"
                  onClick={() => assignTutorToRequest(request.uniqueId, tutorSearch.tutors[0])}
                >
                  Assign first searched tutor
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Add Hours + Send Invoice Manually</h2>
        <form className="form" onSubmit={addHoursAndInvoice}>
          <div className="grid three">
            <label>
              Request ID
              <input
                className="input"
                value={manualAction.requestId}
                onChange={(event) =>
                  setManualAction((prev) => ({ ...prev, requestId: event.target.value }))
                }
              />
            </label>
            <label>
              Hours to add
              <input
                className="input"
                type="number"
                min="0"
                value={manualAction.hoursToAdd}
                onChange={(event) =>
                  setManualAction((prev) => ({ ...prev, hoursToAdd: Number(event.target.value || 0) }))
                }
              />
            </label>
            <label>
              Invoice amount
              <input
                className="input"
                type="number"
                min="0"
                value={manualAction.invoiceAmount}
                onChange={(event) =>
                  setManualAction((prev) => ({ ...prev, invoiceAmount: Number(event.target.value || 0) }))
                }
              />
            </label>
            <label>
              Student email
              <input
                className="input"
                type="email"
                value={manualAction.studentEmail}
                onChange={(event) =>
                  setManualAction((prev) => ({ ...prev, studentEmail: event.target.value }))
                }
              />
            </label>
            <label>
              Student name
              <input
                className="input"
                value={manualAction.studentName}
                onChange={(event) =>
                  setManualAction((prev) => ({ ...prev, studentName: event.target.value }))
                }
              />
            </label>
            <label>
              Bursary
              <input
                className="input"
                value={manualAction.bursaryName}
                onChange={(event) =>
                  setManualAction((prev) => ({ ...prev, bursaryName: event.target.value }))
                }
              />
            </label>
          </div>
          <button className="btn btn-accent" type="submit">
            Add hours + create invoice
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Unallocated Paid Requests</h2>
        {unallocatedPaid.length === 0 ? <p className="muted-text">None.</p> : null}
        {unallocatedPaid.map((request) => (
          <article className="card subtle" key={request.uniqueId}>
            <p>{request.uniqueId} - {request.studentEmail}</p>
            <p>Total: R {Number(request.totalAmount || 0).toFixed(2)}</p>
            <button className="btn btn-ghost" type="button" onClick={() => swapTutorOut(request.uniqueId, "No tutor assigned yet")}>Flag swap process</button>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Allocated Paid Requests</h2>
        {allocatedPaid.length === 0 ? <p className="muted-text">None.</p> : null}
        {allocatedPaid.map((request) => (
          <article className="card subtle" key={request.uniqueId}>
            <p>{request.uniqueId} - {request.studentEmail}</p>
            <p>Tutors assigned: {request.tutorsAssignedList}</p>
            <p>Hours list: {request.hoursListText || "-"}</p>
            <button className="btn btn-outline" type="button" onClick={() => swapTutorOut(request.uniqueId, "Admin swap request")}>Swap tutors out</button>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Refunded / Credited / Added Hours Students</h2>
        <div className="grid three">
          <div>
            <h3>Refunded</h3>
            {refundedStudents.map((request) => (
              <p key={request.uniqueId}>{request.studentEmail} - R {Number(request.refundAmount || 0)}</p>
            ))}
          </div>
          <div>
            <h3>Credited Hours</h3>
            {creditedHoursStudents.map((request) => (
              <p key={request.uniqueId}>{request.studentEmail} - R {Number(request.credited || 0)}</p>
            ))}
          </div>
          <div>
            <h3>Added Hours</h3>
            {addedHoursStudents.map((request) => (
              <p key={request.uniqueId}>{request.studentEmail} - {request.hoursListText}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Tutor Payroll (Paystack)</h2>
        {orders.length === 0 ? <p className="muted-text">No session orders found.</p> : null}
        {orders.map((order) => (
          <article className="card subtle" key={order.uniqueId}>
            <p>{order.uniqueId} | Tutor: {order.tutorEmail || "-"}</p>
            <p>Student: {order.studentEmail || "-"}</p>
            <p>Tutor earning: R {Number(order.tutorEarning || 0).toFixed(2)}</p>
            {order.tutorEmail ? (
              <button className="btn btn-accent" type="button" onClick={() => payTutor(order)}>
                Pay tutor via Paystack
              </button>
            ) : null}
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Operational Notifications</h2>
        {notifications.length === 0 ? <p className="muted-text">No notifications available.</p> : null}
        {notifications.map((note) => (
          <article className="card subtle" key={note.id}>
            <p><strong>{note.title}</strong> ({note.priority})</p>
            <p>{note.description}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
