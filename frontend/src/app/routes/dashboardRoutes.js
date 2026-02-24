import {
  AdminDashboardPage,
  AnalyticsPage,
  BursaryDashboardPage,
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
    allowedRoles: ["admin"],
    component: AdminDashboardPage,
  },
  {
    path: "/dashboard/bursary",
    allowedRoles: ["bursary_admin"],
    component: BursaryDashboardPage,
  },
  {
    path: "/dashboard/analytics",
    allowedRoles: ["admin", "bursary_admin"],
    component: AnalyticsPage,
  },
];
