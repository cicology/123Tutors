import {
  AdminDashboardPage,
  AnalyticsPage,
  StudentDashboardPage,
  TutorDashboardPage,
} from "../../pages";

export const DASHBOARD_ROUTES = [
  {
    path: "/dashboard/student",
    allowedRoles: ["user", "student"],
    component: StudentDashboardPage,
  },
  {
    path: "/dashboard/tutor",
    allowedRoles: ["tutor"],
    component: TutorDashboardPage,
  },
  {
    path: "/dashboard/admin",
    allowedRoles: ["admin", "bursary_admin"],
    component: AdminDashboardPage,
  },
  {
    path: "/dashboard/analytics",
    allowedRoles: ["admin", "bursary_admin"],
    component: AnalyticsPage,
  },
];
