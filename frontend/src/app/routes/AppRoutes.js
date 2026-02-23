import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../features/auth/ProtectedRoute";
import { NotFoundPage } from "../../pages";
import { DASHBOARD_ROUTES } from "./dashboardRoutes";
import { PUBLIC_ROUTES } from "./publicRoutes";

function renderPublicRoute(route) {
  if (route.redirectTo) {
    return <Route key={route.path} path={route.path} element={<Navigate to={route.redirectTo} replace />} />;
  }

  const RouteComponent = route.component;
  return <Route key={route.path} path={route.path} element={<RouteComponent />} />;
}

function renderDashboardRoute(route) {
  const RouteComponent = route.component;
  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRoute allowedRoles={route.allowedRoles}>
          <RouteComponent />
        </ProtectedRoute>
      }
    />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {PUBLIC_ROUTES.map(renderPublicRoute)}
      {DASHBOARD_ROUTES.map(renderDashboardRoute)}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
