import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeatureGate from "@/components/FeatureGate";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import SkinAssessment from "./pages/SkinAssessment";
import Profile from "./pages/Profile";
import DailyGutLog from "./pages/DailyGutLog";
import FoodTracker from "./pages/FoodTracker";
import GutProgress from "./pages/GutProgress";
import GutHealthReport from "./pages/GutHealthReport";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
              <Route path="/skin-assessment" element={<ProtectedRoute><SkinAssessment /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/daily-log" element={
                <ProtectedRoute>
                  <FeatureGate feature="daily_tracking">
                    <DailyGutLog />
                  </FeatureGate>
                </ProtectedRoute>
              } />
              <Route path="/food-tracker" element={
                <ProtectedRoute>
                  <FeatureGate feature="trigger_detection">
                    <FoodTracker />
                  </FeatureGate>
                </ProtectedRoute>
              } />
              <Route path="/gut-progress" element={
                <ProtectedRoute>
                  <FeatureGate feature="progress_analytics">
                    <GutProgress />
                  </FeatureGate>
                </ProtectedRoute>
              } />
              <Route path="/gut-report" element={
                <ProtectedRoute>
                  <FeatureGate feature="gut_report">
                    <GutHealthReport />
                  </FeatureGate>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
