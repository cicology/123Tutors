import {
  HomePage,
  LoginPage,
  RequestPage,
  SignupBursaryPage,
  SignupStudentParentPage,
  SignupTutorPage,
} from "../../pages";

export const PUBLIC_ROUTES = [
  { path: "/", component: HomePage },
  { path: "/request", component: RequestPage },
  { path: "/login", component: LoginPage },
  { path: "/signup/student-parent", component: SignupStudentParentPage },
  { path: "/signup/tutor", component: SignupTutorPage },
  { path: "/signup/bursary", component: SignupBursaryPage },
  { path: "/dashboard", redirectTo: "/dashboard/student" },
];
