import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import StatCard from "../../components/ui/StatCard";
import { api } from "../../services/api";

function safeArray(data) {
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    speciality: "",
    availability: "",
    bio: "",
    rate: 250,
  });
  const [jobs, setJobs] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [hoursRows, setHoursRows] = useState([]);
  const [courseForm, setCourseForm] = useState({
    moduleCode: "",
    moduleName: "",
    instituteName: "",
  });
  const [lessonForm, setLessonForm] = useState({
    requestUniqueId: "",
    orderId: "",
    courseName: "",
    lessonHours: 1,
    lessonLocation: "online",
    studentName: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const email = user?.email || "";

  const loadDashboard = useCallback(async () => {
    if (!email) {
      return;
    }

    try {
      const [fullProfile, notifications, ordersResult, lessonsResult, hoursResult] = await Promise.all([
        api.getUserByEmail(email),
        api.getTutorJobNotifications({ limit: 200 }),
        api.getTutorSessionOrders({ limit: 200 }),
        api.getStudentLessons({ limit: 200 }),
        api.getTutorStudentHours({ limit: 200 }),
      ]);

      const parsedSlug = fullProfile?.slug ? JSON.parse(fullProfile.slug) : {};
      setProfile({
        speciality: parsedSlug.speciality || "",
        availability: parsedSlug.availability || "",
        bio: parsedSlug.bio || "",
        rate: parsedSlug.rate || 250,
      });

      setJobs(safeArray(notifications));

      const orders = safeArray(ordersResult).filter(
        (row) => row.tutorEmail?.toLowerCase() === email.toLowerCase(),
      );
      setAssignedOrders(orders);

      const lessonRows = safeArray(lessonsResult).filter((row) => {
        const directMatch = row.tutorUniqueId === user?.uniqueId;
        const tutorNameMatch = row.tutorName?.toLowerCase().includes(email.split("@")[0]?.toLowerCase());
        return directMatch || tutorNameMatch;
      });
      setLessons(lessonRows);

      const tutorHours = safeArray(hoursResult).filter((row) => row.tutorId === user?.uniqueId);
      setHoursRows(tutorHours);
    } catch (err) {
      setError(err.message || "Failed to load tutor dashboard.");
    }
  }, [email, user?.uniqueId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const paymentRemaining = useMemo(
    () =>
      assignedOrders.reduce(
        (sum, row) => sum + Number(row.tutorEarning || 0) - Number(row.tutorRateDiscountAmount || 0),
        0,
      ),
    [assignedOrders],
  );

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.updateUserProfile(email, {
        slug: JSON.stringify(profile),
      });
      setMessage("Tutor profile updated.");
    } catch (err) {
      setError(err.message || "Profile update failed.");
    }
  };

  const applyForJob = async (job) => {
    try {
      const targetId = job.requestUniqueId || job.request?.uniqueId;
      if (!targetId) {
        throw new Error("No request linked to this job notification.");
      }

      const request = await api.getTutorRequests({ search: targetId, limit: 1 });
      const row = safeArray(request)[0];
      if (!row) {
        throw new Error("Request not found for this job notification.");
      }

      const existing = row.tutorsAssignedList || "";
      const next = existing ? `${existing},${user.uniqueId}` : user.uniqueId;

      await api.patchTutorRequest(row.uniqueId, {
        tutorsAssignedList: next,
        tutorsNotifiedNum: Number(row.tutorsNotifiedNum || 0) + 1,
      });

      setMessage(`Applied for request ${row.uniqueId}.`);
      loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to apply for job.");
    }
  };

  const addTutorCourse = async (event) => {
    event.preventDefault();
    try {
      await api.createCourse({
        uniqueId: api.uniqueId("CRS"),
        moduleCode: courseForm.moduleCode,
        moduleName: courseForm.moduleName,
        instituteName: courseForm.instituteName,
        creator: email,
        subjectName: courseForm.moduleName,
      });
      setMessage("Tutor course added for search visibility.");
      setCourseForm({ moduleCode: "", moduleName: "", instituteName: "" });
    } catch (err) {
      setError(err.message || "Failed to add course.");
    }
  };

  const logLesson = async (event) => {
    event.preventDefault();
    try {
      await api.createStudentLesson({
        uniqueId: api.uniqueId("LSN"),
        requestUniqueId: lessonForm.requestUniqueId,
        orderId: lessonForm.orderId,
        courseName: lessonForm.courseName,
        lessonDate: new Date().toISOString(),
        lessonHours: Number(lessonForm.lessonHours || 1),
        lessonLocation: lessonForm.lessonLocation,
        studentName: lessonForm.studentName,
        tutorUniqueId: user.uniqueId,
        tutorName: email,
        tutorRatePerHour: profile.rate,
        paymentStatus: "pending_student_approval",
      });
      setMessage("Lesson logged successfully.");
      setLessonForm({
        requestUniqueId: "",
        orderId: "",
        courseName: "",
        lessonHours: 1,
        lessonLocation: "online",
        studentName: "",
      });
      loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to log lesson.");
    }
  };

  return (
    <section className="page-wrap">
      <h1>Tutor Dashboard</h1>
      <p>Manage applications, jobs, profile, students, and lesson/payment tracking.</p>

      <div className="card-grid three">
        <StatCard label="Job notifications" value={jobs.length} />
        <StatCard label="Allocated students" value={assignedOrders.length} />
        <StatCard label="Projected tutor earnings" value={`R ${paymentRemaining.toFixed(2)}`} />
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}

      <section className="card">
        <h2>Custom Profile Updating</h2>
        <form className="form" onSubmit={updateProfile}>
          <div className="grid two">
            <label>
              Speciality
              <input
                className="input"
                value={profile.speciality}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, speciality: event.target.value }))
                }
              />
            </label>
            <label>
              Availability
              <input
                className="input"
                value={profile.availability}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, availability: event.target.value }))
                }
                placeholder="Weekdays, evenings, weekends"
              />
            </label>
            <label>
              Rate (R/hr)
              <input
                className="input"
                type="number"
                min="0"
                value={profile.rate}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, rate: Number(event.target.value || 0) }))
                }
              />
            </label>
          </div>
          <label>
            Bio
            <textarea
              className="input"
              rows="3"
              value={profile.bio}
              onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
            />
          </label>
          <button className="btn btn-accent" type="submit">
            Save profile
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Tutor Jobs and Applying</h2>
        {jobs.length === 0 ? <p className="muted-text">No tutor job notifications yet.</p> : null}
        <div className="card-grid two">
          {jobs.map((job) => (
            <article className="card subtle" key={job.uniqueId}>
              <p>Notification: {job.uniqueId}</p>
              <p>Request: {job.requestUniqueId || "-"}</p>
              <p>Match score list: {job.matchScoreList || "Pending"}</p>
              <button type="button" className="btn btn-outline" onClick={() => applyForJob(job)}>
                Apply for this job
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Add Courses You Tutor</h2>
        <form className="inline-form" onSubmit={addTutorCourse}>
          <input
            className="input"
            placeholder="Module code"
            value={courseForm.moduleCode}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, moduleCode: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Module name"
            value={courseForm.moduleName}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, moduleName: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Institute"
            value={courseForm.instituteName}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, instituteName: event.target.value }))
            }
          />
          <button className="btn btn-accent" type="submit">
            Add course
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Assigned Students + Hours</h2>
        {assignedOrders.length === 0 ? <p className="muted-text">No allocated students yet.</p> : null}
        {assignedOrders.map((order) => (
          <article className="card subtle" key={order.uniqueId}>
            <p>
              <strong>{order.studentName || order.studentEmail}</strong> | {order.course || "Course"}
            </p>
            <p>Hours remaining: {Number(order.hoursRemaining || 0).toFixed(1)}</p>
            <p>Rate: R {Number(order.tutorRatePerHour || 0).toFixed(2)}</p>
            <p>Payment remaining: R {Number(order.tutorEarning || 0).toFixed(2)}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Log Completed Lessons</h2>
        <form className="form" onSubmit={logLesson}>
          <div className="grid two">
            <label>
              Request ID
              <input
                className="input"
                value={lessonForm.requestUniqueId}
                onChange={(event) =>
                  setLessonForm((prev) => ({ ...prev, requestUniqueId: event.target.value }))
                }
              />
            </label>
            <label>
              Order ID
              <input
                className="input"
                value={lessonForm.orderId}
                onChange={(event) =>
                  setLessonForm((prev) => ({ ...prev, orderId: event.target.value }))
                }
              />
            </label>
            <label>
              Student name
              <input
                className="input"
                value={lessonForm.studentName}
                onChange={(event) =>
                  setLessonForm((prev) => ({ ...prev, studentName: event.target.value }))
                }
              />
            </label>
            <label>
              Course name
              <input
                className="input"
                value={lessonForm.courseName}
                onChange={(event) =>
                  setLessonForm((prev) => ({ ...prev, courseName: event.target.value }))
                }
              />
            </label>
            <label>
              Lesson hours
              <input
                className="input"
                type="number"
                step="0.5"
                min="0.5"
                value={lessonForm.lessonHours}
                onChange={(event) =>
                  setLessonForm((prev) => ({ ...prev, lessonHours: Number(event.target.value || 1) }))
                }
              />
            </label>
            <label>
              Location
              <input
                className="input"
                value={lessonForm.lessonLocation}
                onChange={(event) =>
                  setLessonForm((prev) => ({ ...prev, lessonLocation: event.target.value }))
                }
              />
            </label>
          </div>
          <button className="btn btn-accent" type="submit">
            Log lesson
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Logged Lessons</h2>
        {lessons.length === 0 ? <p className="muted-text">No logged lessons yet.</p> : null}
        {lessons.map((lesson) => (
          <article className="card subtle" key={lesson.uniqueId}>
            <p>
              {lesson.courseName || "Course"} | {lesson.studentName || "Student"}
            </p>
            <p>Hours: {Number(lesson.lessonHours || 0).toFixed(1)}</p>
            <p>Reviewed by student: {lesson.studentReviewed ? "Yes" : "No"}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Tracking Hours with Students</h2>
        {hoursRows.length === 0 ? <p className="muted-text">No tutor hour logs found in current data.</p> : null}
        {hoursRows.map((row) => (
          <article className="card subtle" key={row.uniqueId}>
            <p>Request: {row.requestId}</p>
            <p>Student: {row.studentEmail || row.studentName || "-"}</p>
            <p>Hours used: {Number(row.hoursUsed || 0).toFixed(1)}</p>
            <p>Hours remaining: {Number(row.hoursRemaining || 0).toFixed(1)}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
