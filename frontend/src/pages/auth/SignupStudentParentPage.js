import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import Seo from "../../components/seo/Seo";
import { api } from "../../services/api";

export default function SignupStudentParentPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    role: "student",
    email: "",
    bursaryName: "",
  });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register({
        email: form.email,
        userType: "user",
        uniqueId: api.uniqueId(form.role === "parent" ? "UP_PARENT" : "UP_STUDENT"),
        bursaryName: form.bursaryName || undefined,
      });
      navigate("/dashboard/student");
    } catch (err) {
      setError(err.message || "Failed to sign up.");
    }
  };

  return (
    <section className="page-wrap narrow">
      <Seo
        title="Student Signup"
        description="Create a student or parent account on 123Tutors to request tutors and manage lessons."
      />
      <h1>Student / Parent Signup</h1>
      <p>Create a student account to request tutors and manage bookings.</p>

      <form className="form card" onSubmit={onSubmit}>
        <label>
          I am a
          <select
            className="input"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </label>

        <label>
          Email
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value.trim() }))}
          />
        </label>

        <label>
          Bursary (optional)
          <input
            className="input"
            value={form.bursaryName}
            onChange={(event) => setForm((prev) => ({ ...prev, bursaryName: event.target.value }))}
            placeholder="e.g. Mastercard Foundation"
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn btn-accent" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </section>
  );
}
