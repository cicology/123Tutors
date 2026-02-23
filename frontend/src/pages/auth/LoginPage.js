import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import Seo from "../../components/seo/Seo";

const roleRoutes = {
  user: "/dashboard/student",
  student: "/dashboard/student",
  tutor: "/dashboard/tutor",
  admin: "/dashboard/admin",
  bursary_admin: "/dashboard/admin",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    userType: "user",
  });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await login({ email: form.email, userType: form.userType });
      const route = roleRoutes[response?.user?.userType] || "/";
      navigate(route);
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  };

  return (
    <section className="page-wrap narrow">
      <Seo
        title="Login"
        description="Login to the 123Tutors platform as student, tutor, bursary admin, or system admin."
      />
      <h1>Login</h1>
      <p>Login with your registered email and role.</p>

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
          Role
          <select
            className="input"
            value={form.userType}
            onChange={(event) => setForm((prev) => ({ ...prev, userType: event.target.value }))}
          >
            <option value="user">Student / Parent</option>
            <option value="tutor">Tutor</option>
            <option value="bursary_admin">Bursary Admin</option>
            <option value="admin">System Admin</option>
          </select>
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn btn-accent" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="muted-text">
          Need an account? <Link to="/signup/student-parent">Student signup</Link> or{" "}
          <Link to="/signup/tutor">Tutor signup</Link>.
        </p>
      </form>
    </section>
  );
}
