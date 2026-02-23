import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
