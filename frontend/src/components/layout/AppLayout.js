import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

function navClassName({ isActive }) {
  return isActive ? "nav-link active" : "nav-link";
}

export default function AppLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.userType || "";

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="123tutors home">
            <span className="brand-circle">123</span>
            <span className="brand-text">tutors</span>
          </Link>

          <nav className="nav">
            <NavLink to="/" className={navClassName} end>
              Home
            </NavLink>
            <NavLink to="/request" className={navClassName}>
              Request Tutor
            </NavLink>
            <NavLink to="/signup/student-parent" className={navClassName}>
              Student Signup
            </NavLink>
            <NavLink to="/signup/tutor" className={navClassName}>
              Tutor Signup
            </NavLink>
            {role === "student" ? (
              <NavLink to="/dashboard/student" className={navClassName}>
                Student Dashboard
              </NavLink>
            ) : null}
            {role === "tutor" ? (
              <NavLink to="/dashboard/tutor" className={navClassName}>
                Tutor Dashboard
              </NavLink>
            ) : null}
            {(role === "admin" || role === "bursary_admin") ? (
              <>
                <NavLink to="/dashboard/admin" className={navClassName}>
                  Admin Dashboard
                </NavLink>
                <NavLink to="/dashboard/analytics" className={navClassName}>
                  Analytics
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="topbar-actions">
            {isAuthenticated ? (
              <>
                <span className="user-pill">{user?.email}</span>
                <button type="button" className="btn btn-outline" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-accent">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
}
