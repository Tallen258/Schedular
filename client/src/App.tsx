import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/home";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./components/event/EventDetail";
import CompareSchedules from "./pages/CompareSchedule";
import ImageReview from "./pages/ScheduleCompare";
import Settings from "./pages/Settings";
import Spinner from "./components/Spinner";
import Help from "./pages/Help";
import AIChat from "./pages/AIChat";
import Notifications from "./pages/Notifications";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AgenticActionProvider } from "./context/AgenticActionContext";

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
          <Suspense fallback={<div className="p-4 flex justify-center"><Spinner /></div>}>
            <NavBar />
            <div className="main-content">
              <Routes>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route path="/account" element={<Navigate to="/home" replace />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                <Route path="/event/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
                <Route path="/compare" element={<ProtectedRoute><CompareSchedules /></ProtectedRoute>} />
                <Route path="/image-review" element={<ProtectedRoute><ImageReview /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/help" element={<Help />} />
                <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                <Route path="/chat/:conversationId" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                <Route path="*" element={<div className="p-4">Not Found</div>} />
              </Routes>
            </div>
          </Suspense>
        </AgenticActionProvider>
      </ErrorBoundary>
    </>
  );
}
