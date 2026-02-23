import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import Seo from "../../components/seo/Seo";
import { api } from "../../services/api";

export default function SignupTutorPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    bursaryName: "",
    speciality: "",
    experienceYears: 0,
  });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register({
        email: form.email,
        userType: "tutor",
        uniqueId: api.uniqueId("UP_TUTOR"),
      });

      await api.updateUserProfile(form.email, {
        slug: JSON.stringify({
          speciality: form.speciality,
          experienceYears: Number(form.experienceYears || 0),
        }),
        bursaryName: form.bursaryName || null,
      });

      navigate("/dashboard/tutor");
    } catch (err) {
      setError(err.message || "Failed to sign up tutor.");
    }
  };

  return (
    <section className="page-wrap narrow">
      <Seo
        title="Tutor Signup"
        description="Join 123Tutors as a tutor, manage courses, receive job matches, and log lessons."
      />
      <h1>Tutor Signup</h1>
      <p>Register as a tutor and start receiving matched job notifications.</p>

      <form className="form card" onSubmit={onSubmit}>
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
          Speciality
          <input
            className="input"
            value={form.speciality}
            onChange={(event) => setForm((prev) => ({ ...prev, speciality: event.target.value }))}
            placeholder="e.g. Mathematics, Engineering"
          />
        </label>

        <label>
          Years of experience
          <input
            className="input"
            type="number"
            min="0"
            value={form.experienceYears}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, experienceYears: Number(event.target.value || 0) }))
            }
          />
        </label>

        <label>
          Preferred bursary clients (optional)
          <input
            className="input"
            value={form.bursaryName}
            onChange={(event) => setForm((prev) => ({ ...prev, bursaryName: event.target.value }))}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn btn-accent" type="submit" disabled={loading}>
          {loading ? "Creating tutor profile..." : "Create tutor account"}
        </button>
      </form>
    </section>
  );
}
