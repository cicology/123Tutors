import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Briefcase, Clock3, Home, UserRound, Users } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";
import Seo from "../../components/seo/Seo";
import { useAuth } from "../../features/auth/AuthContext";
import { api } from "../../services/api";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "jobs", label: "Tutor Jobs", icon: Briefcase },
  { id: "students", label: "Students", icon: Users },
  { id: "lessons", label: "Lessons", icon: Clock3 },
  { id: "profile", label: "Profile", icon: UserRound },
];

function safeArray(data) {
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

function formatMoney(amount) {
  return `R ${Number(amount || 0).toFixed(2)}`;
}

function formatHours(value) {
  return Number(value || 0).toFixed(1);
}

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
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

  const displayName = email ? email.split("@")[0] : "Tutor";

  return (
    <>
      <Seo
        title="Tutor Dashboard"
        description="Manage tutor profile, jobs, students, and lesson logs on 123Tutors."
      />

      <DashboardShell
        portalLabel="Tutor Portal"
        title="Tutor Dashboard"
        description="Manage applications, students, and lesson tracking from one place."
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profileName={displayName}
        profileMeta={email || "tutor@123tutors.co.za"}
      >
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        {activeTab === "home" ? (
          <>
            <div className="card-grid three">
              <article className="card">
                <p className="stat-label">Job notifications</p>
                <p className="stat-value">{jobs.length}</p>
                <p className="stat-note">Smart matches waiting for your review</p>
              </article>
              <article className="card">
                <p className="stat-label">Allocated students</p>
                <p className="stat-value">{assignedOrders.length}</p>
                <p className="stat-note">Students currently assigned to you</p>
              </article>
              <article className="card">
                <p className="stat-label">Projected earnings</p>
                <p className="stat-value">{formatMoney(paymentRemaining)}</p>
                <p className="stat-note">Based on current assigned sessions</p>
              </article>
              <article className="card">
                <p className="stat-label">Lessons logged</p>
                <p className="stat-value">{lessons.length}</p>
                <p className="stat-note">Lesson entries captured in the platform</p>
              </article>
            </div>

            <div className="card-grid two">
              <section className="card">
                <h2>Recent Job Notifications</h2>
                {jobs.length === 0 ? <p className="muted-text">No tutor job notifications yet.</p> : null}
                {jobs.slice(0, 4).map((job) => (
                  <article className="card subtle" key={job.uniqueId}>
                    <p>
                      <strong>{job.requestUniqueId || "Request pending"}</strong>
                    </p>
                    <p>Notification ID: {job.uniqueId}</p>
                    <p>Match score list: {job.matchScoreList || "Pending"}</p>
                    <button type="button" className="btn btn-outline" onClick={() => applyForJob(job)}>
                      Apply for this job
                    </button>
                  </article>
                ))}
              </section>

              <section className="card">
                <h2>Assigned Students Snapshot</h2>
                {assignedOrders.length === 0 ? (
                  <p className="muted-text">No allocated students yet.</p>
                ) : (
                  assignedOrders.slice(0, 4).map((order) => (
                    <article className="card subtle" key={order.uniqueId}>
                      <p>
                        <strong>{order.studentName || order.studentEmail || "Student"}</strong>
                      </p>
                      <p>Course: {order.course || "-"}</p>
                      <p>Hours remaining: {formatHours(order.hoursRemaining)}h</p>
                      <p>Earnings: {formatMoney(order.tutorEarning)}</p>
                    </article>
                  ))
                )}
              </section>
            </div>
          </>
        ) : null}

        {activeTab === "jobs" ? (
          <>
            <section className="card">
              <h2>Tutor Jobs and Applications</h2>
              {jobs.length === 0 ? <p className="muted-text">No tutor job notifications yet.</p> : null}
              <div className="card-grid two">
                {jobs.map((job) => (
                  <article className="card subtle" key={job.uniqueId}>
                    <p>Notification: {job.uniqueId}</p>
                    <p>Request: {job.requestUniqueId || "-"}</p>
                    <p>Match score list: {job.matchScoreList || "Pending"}</p>
                    <button type="button" className="btn btn-accent" onClick={() => applyForJob(job)}>
                      Apply for this job
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="card">
              <h2>
                <BookOpen size={16} /> Add Courses You Tutor
              </h2>
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
          </>
        ) : null}

        {activeTab === "students" ? (
          <>
            <section className="card">
              <h2>Assigned Students and Hours</h2>
              {assignedOrders.length === 0 ? <p className="muted-text">No allocated students yet.</p> : null}
              {assignedOrders.map((order) => (
                <article className="card subtle" key={order.uniqueId}>
                  <p>
                    <strong>{order.studentName || order.studentEmail}</strong> | {order.course || "Course"}
                  </p>
                  <p>Hours remaining: {formatHours(order.hoursRemaining)}h</p>
                  <p>Rate: {formatMoney(order.tutorRatePerHour)}</p>
                  <p>Payment remaining: {formatMoney(order.tutorEarning)}</p>
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
                  <p>Hours used: {formatHours(row.hoursUsed)}h</p>
                  <p>Hours remaining: {formatHours(row.hoursRemaining)}h</p>
                </article>
              ))}
            </section>
          </>
        ) : null}

        {activeTab === "lessons" ? (
          <>
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
                      onChange={(event) => setLessonForm((prev) => ({ ...prev, orderId: event.target.value }))}
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
                  <p>Hours: {formatHours(lesson.lessonHours)}h</p>
                  <p>Reviewed by student: {lesson.studentReviewed ? "Yes" : "No"}</p>
                </article>
              ))}
            </section>
          </>
        ) : null}

        {activeTab === "profile" ? (
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
        ) : null}
      </DashboardShell>
    </>
  );
}
