import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/home";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./components/EventDetail";
import CompareSchedules from "./pages/CompareSchedule";
import ImageReview from "./pages/ScheduleCompare";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import AIChat from "./pages/AIChat";
import Notifications from "./pages/Notifications";
import NavBar from "./components/NavBar";
import { AgenticActionProvider } from "./contexts/AgenticActionContext";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch {
    return (
      <div role="alert" className="p-4 text-custom-red-700 bg-custom-red-50 rounded">
        Something went wrong rendering this view.
      </div>
    );
  }
}

function AuthCallback() {
  return <div className="p-4">Finishing sign-in…</div>;
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <ErrorBoundary>
        <AgenticActionProvider>
          <Suspense fallback={<div className="p-4">Loading…</div>}>
            <NavBar />
            <div className="main-content">
              <Routes>
                {/* Redirect root to /home */}
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />

              {/* OIDC callback route (must match your redirect_uri path) */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* If your post_logout_redirect_uri is /account, funnel it to /home */}
              <Route path="/account" element={<Navigate to="/home" replace />} />

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/compare" element={<CompareSchedules />} />
              <Route path="/image-review" element={<ImageReview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/chat/:conversationId" element={<AIChat />} />
              <Route path="/notifications" element={<Notifications />} />

              <Route path="*" element={<div className="p-4">Not Found</div>} />
            </Routes>
          </div>
        </Suspense>
        </AgenticActionProvider>
      </ErrorBoundary>
    </>
  );
}
