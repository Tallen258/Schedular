import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/home";
import Calendar from "./pages/Calendar";
import NavBar from "./components/NavBar";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch {
    return (
      <div role="alert" className="p-4 text-red-700 bg-red-100 rounded">
        Something went wrong rendering this view.
      </div>
    );
  }
}

function AuthCallback() {
  // With react-oidc-context, the provider's onSigninCallback normally handles finishing the sign-in.
  // This page just shows a friendly spinner while that happens.
  return <div className="p-4">Finishing sign-in…</div>;
}

// ---- 10 view stubs ----
function Dashboard() { return <h1>Dashboard (Upcoming + Free Slots)</h1>; }
function CreateEvent() { return <h1>Create Event</h1>; }
function EventDetail() { return <h1>Event Detail</h1>; }
function CompareSchedules() { return <h1>Compare Schedules (Upload)</h1>; }
function ImageReview() { return <h1>Image Review (OCR Verify)</h1>; }
function Settings() { return <h1>Default Settings</h1>; }
function Help() { return <h1>Help</h1>; }
function AIChat() { return <h1>AI Chat</h1>; }
// ------------------------

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <ErrorBoundary>
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
              <Route path="/events/new" element={<CreateEvent />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/compare" element={<CompareSchedules />} />
              <Route path="/image-review" element={<ImageReview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/chat" element={<AIChat />} />

              <Route path="*" element={<div className="p-4">Not Found</div>} />
            </Routes>
          </div>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
