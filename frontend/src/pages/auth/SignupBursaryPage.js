import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import Seo from "../../components/seo/Seo";
import { api } from "../../services/api";

export default function SignupBursaryPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
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
        userType: "bursary_admin",
        uniqueId: api.uniqueId("UP_BURSARY"),
        bursaryName: form.bursaryName,
      });
      navigate("/dashboard/admin");
    } catch (err) {
      setError(err.message || "Failed to sign up bursary admin.");
    }
  };

  return (
    <section className="page-wrap narrow">
      <Seo
        title="Bursary Admin Signup"
        description="Create bursary admin access for student funding operations and tutor request management."
      />
      <h1>Add Bursary Admin</h1>
      <p>Create bursary admin access for client operations.</p>

      <form className="form card" onSubmit={onSubmit}>
        <label>
          Bursary admin email
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value.trim() }))}
          />
        </label>

        <label>
          Bursary name
          <input
            className="input"
            required
            value={form.bursaryName}
            onChange={(event) => setForm((prev) => ({ ...prev, bursaryName: event.target.value }))}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn btn-accent" type="submit" disabled={loading}>
          {loading ? "Creating bursary admin..." : "Create bursary admin"}
        </button>
      </form>
    </section>
  );
}
