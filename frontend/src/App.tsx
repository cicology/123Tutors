import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BecomeTutor from "./pages/BecomeTutor";
import FindTutor from "./pages/FindTutor";
import Marketplace from "./pages/Marketplace";
import SignIn from "./pages/SignIn";
import TutorSignIn from "./pages/TutorSignIn";
import StudentSignIn from "./pages/StudentSignIn";
import BursarySignup from "./pages/BursarySignup";
import TutorDashboard from "./pages/TutorDashboard";
import TutorSettings from "./pages/TutorSettings";
import TutorCourses from "./pages/TutorCourses";
import TutorStudents from "./pages/TutorStudents";
import TutorLessons from "./pages/TutorLessons";
import TutorReviews from "./pages/TutorReviews";
import TutorChats from "./pages/TutorChats";
import TutorAnalytics from "./pages/TutorAnalytics";
import TutorPayments from "./pages/TutorPayments";
import TutorReferrals from "./pages/TutorReferrals";
import TutorAcceptedRequests from "./pages/TutorAcceptedRequests";
import StudentDashboard from "./pages/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/become-tutor" element={<BecomeTutor />} />
          <Route path="/find-tutor" element={<FindTutor />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/tutor-signin" element={<TutorSignIn />} />
          <Route path="/student-signin" element={<StudentSignIn />} />
          <Route path="/bursary-signup" element={<BursarySignup />} />
          <Route path="/tutor-dashboard" element={<TutorDashboard />} />
          <Route path="/tutor-settings" element={<TutorSettings />} />
          <Route path="/tutor-courses" element={<TutorCourses />} />
          <Route path="/tutor-students" element={<TutorStudents />} />
          <Route path="/tutor-lessons" element={<TutorLessons />} />
          <Route path="/tutor-reviews" element={<TutorReviews />} />
          <Route path="/tutor-chats" element={<TutorChats />} />
          <Route path="/tutor-analytics" element={<TutorAnalytics />} />
          <Route path="/tutor-payments" element={<TutorPayments />} />
          <Route path="/tutor-referrals" element={<TutorReferrals />} />
          <Route path="/tutor-accepted-requests" element={<TutorAcceptedRequests />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
