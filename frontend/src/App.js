import React from "react";
import AppLayout from "./components/layout/AppLayout";
import AppRoutes from "./app/routes/AppRoutes";

export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}
