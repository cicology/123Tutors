import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import PageHeader from "./components/ui/PageHeader";
import Seo from "./components/seo/Seo";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import SignupBursaryPage from "./pages/auth/SignupBursaryPage";
import SignupStudentParentPage from "./pages/auth/SignupStudentParentPage";
import SignupTutorPage from "./pages/auth/SignupTutorPage";
import StudentDashboardPage from "./pages/dashboard/StudentDashboardPage";
import TutorDashboardPage from "./pages/dashboard/TutorDashboardPage";
import AdminDashboardPage from "./pages/dashboard/AdminDashboardPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import HomePage from "./pages/public/HomePage";
import RequestPage from "./pages/public/RequestPage";

function NotFound() {
  return (
    <section className="page-wrap">
      <Seo title="Page Not Found" noIndex />
      <PageHeader
        title="Page not found"
        description="The route you requested does not exist."
      />
    </section>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/student-parent" element={<SignupStudentParentPage />} />
        <Route path="/signup/tutor" element={<SignupTutorPage />} />
        <Route path="/signup/bursary" element={<SignupBursaryPage />} />

        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={["user", "student"]}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tutor"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "bursary_admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin", "bursary_admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/dashboard/student" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
