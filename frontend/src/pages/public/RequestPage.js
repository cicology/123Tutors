import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CourseHoursEditor from "../../components/forms/CourseHoursEditor";
import LocationSearchInput from "../../components/forms/LocationSearchInput";
import Seo from "../../components/seo/Seo";
import { api } from "../../services/api";

function totalFromRows(rows) {
  return rows.reduce((sum, row) => sum + Number(row.hours || 0) * Number(row.rate || 0), 0);
}

function joinRows(rows, key) {
  return rows.map((row) => row[key]).filter(Boolean).join(", ");
}

function joinNumbers(rows, key) {
  return rows.map((row) => Number(row[key] || 0)).join(",");
}

export default function RequestPage() {
  const [form, setForm] = useState({
    studentFirstName: "",
    studentLastName: "",
    studentEmail: "",
    studentPhoneWhatsapp: "",
    bursaryName: "",
    instituteName: "",
    schoolName: "",
    instituteProgramme: "",
    instituteSpecialization: "",
    location: "",
    tutoringType: "online",
    learningType: "one-on-one",
    tutoringStartPeriod: "",
    extraTutoringRequirements: "",
  });
  const [rows, setRows] = useState([{ course: "", hours: 5, rate: 250 }]);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchedTutors, setMatchedTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tertiarySuggestions, setTertiarySuggestions] = useState([]);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSuggestions, setCourseSuggestions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalAmount = useMemo(() => totalFromRows(rows), [rows]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!form.instituteName || form.instituteName.length < 2) {
        setTertiarySuggestions([]);
        return;
      }
      try {
        const result = await api.getTertiaryNames({ search: form.instituteName, limit: 6 });
        setTertiarySuggestions(
          (Array.isArray(result?.data) ? result.data : [])
            .map((row) => row.tertiaryName)
            .filter(Boolean),
        );
      } catch {
        setTertiarySuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [form.instituteName]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!form.schoolName || form.schoolName.length < 2) {
        setSchoolSuggestions([]);
        return;
      }
      try {
        const result = await api.getSchoolNames({ search: form.schoolName, limit: 6 });
        setSchoolSuggestions(
          (Array.isArray(result?.data) ? result.data : [])
            .map((row) => row.schoolNames)
            .filter(Boolean),
        );
      } catch {
        setSchoolSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [form.schoolName]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!courseSearch || courseSearch.length < 2) {
        setCourseSuggestions([]);
        return;
      }
      try {
        const result = await api.getCourses({ search: courseSearch, limit: 8 });
        setCourseSuggestions(
          (Array.isArray(result?.data) ? result.data : [])
            .map((row) => row.moduleName || row.subjectName)
            .filter(Boolean),
        );
      } catch {
        setCourseSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [courseSearch]);

  const findTutors = async () => {
    setMatching(true);
    setError("");
    try {
      const result = await api.findTutors({
        specialization: form.instituteSpecialization,
        programme: form.instituteProgramme,
        university: form.instituteName,
        courses: joinRows(rows, "course"),
      });
      const tutors = Array.isArray(result?.tutors) ? result.tutors : [];
      setMatchedTutors(tutors);
      if (tutors.length > 0) {
        setSelectedTutor(tutors[0]);
      }
    } catch (err) {
      setError(err.message || "Tutor search failed.");
    } finally {
      setMatching(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        studentFirstName: form.studentFirstName,
        studentLastName: form.studentLastName,
        studentEmail: form.studentEmail,
        studentPhoneWhatsapp: form.studentPhoneWhatsapp,
        bursaryName: form.bursaryName,
        instituteName: form.instituteName,
        schoolName: form.schoolName,
        instituteProgramme: form.instituteProgramme,
        instituteSpecialization: form.instituteSpecialization,
        requestCourses: joinRows(rows, "course"),
        hoursListText: joinNumbers(rows, "hours"),
        hourlyRateListText: joinNumbers(rows, "rate"),
        coursesAllocatedNumber: rows.length,
        totalAmount,
        platformFee: totalAmount * 0.15,
        addressFull: form.location,
        tutoringType: form.tutoringType,
        learningType: form.learningType,
        tutoringStartPeriod: form.tutoringStartPeriod,
        extraTutoringRequirements: form.extraTutoringRequirements,
        paid: false,
        creator: "request_form",
        userType: "user",
      };

      let requestResponse;
      if (selectedTutor) {
        requestResponse = await api.submitRequestWithTutor({
          ...payload,
          selectedTutor,
        });
      } else {
        requestResponse = await api.createTutorRequest(payload);
      }

      // Auto-create invoice record so finance/admin can action immediately.
      const invoiceId = api.uniqueId("INV");
      await api.createInvoice({
        uniqueId: invoiceId,
        invoiceNumber: invoiceId,
        studentName: `${form.studentFirstName} ${form.studentLastName}`,
        studentEmail: form.studentEmail,
        bursaryName: form.bursaryName || null,
        amount: totalAmount,
        status: "pending",
        paymentMethod: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        requestUniqueId: requestResponse?.requestId || requestResponse?.uniqueId || null,
        autoSendEmail: true,
      });

      setMessage(
        "Request submitted. Tutor matching triggered and invoice queued for PDF/email processing.",
      );
    } catch (err) {
      setError(err.message || "Could not submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap">
      <Seo
        title="Request Tutor"
        description="Submit tutor requests, search matched tutors, and create invoiced tutoring bookings."
      />
      <div className="section-header">
        <h1>Request Tutor</h1>
        <p>
          Submit student requirements, search tutors, and create the tutoring request.
          Need bursary onboarding? <Link to="/signup/bursary">Add bursary admin</Link>.
        </p>
      </div>

      <form className="card form" onSubmit={onSubmit}>
        <div className="grid two">
          <label>
            Student first name
            <input
              className="input"
              required
              value={form.studentFirstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentFirstName: event.target.value }))
              }
            />
          </label>
          <label>
            Student last name
            <input
              className="input"
              required
              value={form.studentLastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentLastName: event.target.value }))
              }
            />
          </label>
          <label>
            Student email
            <input
              className="input"
              type="email"
              required
              value={form.studentEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, studentEmail: event.target.value }))}
            />
          </label>
          <label>
            Student phone / WhatsApp
            <input
              className="input"
              value={form.studentPhoneWhatsapp}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentPhoneWhatsapp: event.target.value }))
              }
            />
          </label>
          <label>
            Bursary name
            <input
              className="input"
              value={form.bursaryName}
              onChange={(event) => setForm((prev) => ({ ...prev, bursaryName: event.target.value }))}
              placeholder="Optional for private clients"
            />
          </label>
          <label>
            University / tertiary
            <input
              className="input"
              list="tertiary-options"
              value={form.instituteName}
              onChange={(event) => setForm((prev) => ({ ...prev, instituteName: event.target.value }))}
              placeholder="Search by tertiary name"
            />
            <datalist id="tertiary-options">
              {tertiarySuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label>
            School (if applicable)
            <input
              className="input"
              list="school-options"
              value={form.schoolName}
              onChange={(event) => setForm((prev) => ({ ...prev, schoolName: event.target.value }))}
              placeholder="Search by school name"
            />
            <datalist id="school-options">
              {schoolSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label>
            Programme
            <input
              className="input"
              value={form.instituteProgramme}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, instituteProgramme: event.target.value }))
              }
              placeholder="e.g. BCom, MBChB"
            />
          </label>
          <label>
            Specialization
            <input
              className="input"
              value={form.instituteSpecialization}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, instituteSpecialization: event.target.value }))
              }
              placeholder="e.g. Data Science"
            />
          </label>
          <label>
            Tutoring type
            <select
              className="input"
              value={form.tutoringType}
              onChange={(event) => setForm((prev) => ({ ...prev, tutoringType: event.target.value }))}
            >
              <option value="online">Online</option>
              <option value="in_person">In-person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <label>
            Learning format
            <select
              className="input"
              value={form.learningType}
              onChange={(event) => setForm((prev) => ({ ...prev, learningType: event.target.value }))}
            >
              <option value="one-on-one">One-on-one</option>
              <option value="group">Group</option>
            </select>
          </label>
          <label>
            Start period
            <input
              className="input"
              type="date"
              value={form.tutoringStartPeriod}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tutoringStartPeriod: event.target.value }))
              }
            />
          </label>
        </div>

        <label>
          Google Maps location search
          <LocationSearchInput
            value={form.location}
            onChange={(next) => setForm((prev) => ({ ...prev, location: next }))}
          />
        </label>

        <label>
          Additional requirements
          <textarea
            className="input"
            rows="3"
            value={form.extraTutoringRequirements}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, extraTutoringRequirements: event.target.value }))
            }
          />
        </label>

        <div>
          <h3>Courses and hours</h3>
          <div className="inline-form">
            <input
              className="input"
              placeholder="Search course/module"
              value={courseSearch}
              onChange={(event) => setCourseSearch(event.target.value)}
            />
          </div>
          {courseSuggestions.length ? (
            <div className="inline-form">
              {courseSuggestions.map((courseName) => (
                <button
                  key={courseName}
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setRows((prev) => [...prev, { course: courseName, hours: 5, rate: 250 }])
                  }
                >
                  + {courseName}
                </button>
              ))}
            </div>
          ) : null}
          <CourseHoursEditor value={rows} onChange={setRows} />
          <p className="muted-text">Estimated total amount: R {totalAmount.toFixed(2)}</p>
        </div>

        <div className="card subtle">
          <h3>Tutor search</h3>
          <p className="muted-text">
            Find tutors now so the request can include a preferred match.
          </p>
          <button type="button" className="btn btn-outline" onClick={findTutors} disabled={matching}>
            {matching ? "Searching tutors..." : "Search Tutors"}
          </button>

          {matchedTutors.length ? (
            <div className="card-grid two">
              {matchedTutors.map((tutor) => (
                <button
                  key={tutor.id}
                  type="button"
                  className={selectedTutor?.id === tutor.id ? "card tutor-card selected" : "card tutor-card"}
                  onClick={() => setSelectedTutor(tutor)}
                >
                  <h4>{tutor.name}</h4>
                  <p>{tutor.specialization}</p>
                  <p>Rate: R {tutor.hourlyRate || "-"} / hr</p>
                  <p>Rating: {tutor.rating || "-"}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}

        <div className="form-actions">
          <button className="btn btn-accent" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </section>
  );
}
