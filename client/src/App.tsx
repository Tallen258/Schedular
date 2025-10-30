import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Simple error boundary (render-level)
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch {
    return <div role="alert" className="p-4 text-red-700 bg-red-100 rounded">
      Something went wrong rendering this view.
    </div>;
  }
}


// ---- 10 view stubs ----
function Home() { return <h1>Home</h1>; }
function Dashboard() { return <h1>Dashboard (Upcoming + Free Slots)</h1>; }
function CalendarView() { return <h1>Calendar</h1>; }
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
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/events/new" element={<CreateEvent />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/compare" element={<CompareSchedules />} />
              <Route path="/image-review" element={<ImageReview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="*" element={<div className="p-4">Not Found</div>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
    </>
  );
}
