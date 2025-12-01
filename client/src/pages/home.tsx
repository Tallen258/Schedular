import { useAuth } from "react-oidc-context";

export default function Home() {
  const auth = useAuth();

  const handleLogin = () => {
    console.log("Sign In button clicked on home page");
    console.log("Auth object:", auth);
    if (auth && auth.signinRedirect) {
      auth.signinRedirect().catch((err) => {
        console.error("Sign in redirect error:", err);
      });
    } else {
      console.error("Auth or signinRedirect not available");
    }
  };

  const handleLogout = () => {
    void auth?.signoutRedirect?.();
  };

  if (!auth || !auth.isAuthenticated) {
    return (
      <main className="min-h-screen p-6 bg-itin-sand-50">
        <section className="mx-auto max-w-4xl">
          <div className="card p-8 md:p-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-itin-sand-200 px-4 py-1.5 text-itin-sand-800 text-sm font-medium">
              <span>Welcome to Schedular</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-itin-sand-900 mb-4">
              Plan your week with ease
            </h1>
            <p className="text-lg text-itin-sand-700 mb-8 max-w-2xl mx-auto">
              AI-powered calendar management with smart scheduling, conflict detection, and schedule comparison.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-12">
              <button onClick={handleLogin} className="btn-primary text-lg px-8 py-3">
                Sign In
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-itin-sand-100 rounded-lg">
                <div className="text-2xl mb-3"></div>
                <h3 className="font-semibold text-itin-sand-900 mb-2">AI Assistant</h3>
                <p className="text-sm text-itin-sand-700">
                  Chat with AI to create events, find free time, and get smart suggestions.
                </p>
              </div>
              <div className="p-6 bg-itin-sand-100 rounded-lg">
                <div className="text-2xl mb-3"></div>
                <h3 className="font-semibold text-itin-sand-900 mb-2">Smart Calendar</h3>
                <p className="text-sm text-itin-sand-700">
                  Sync with Google Calendar, detect conflicts, and manage your schedule.
                </p>
              </div>
              <div className="p-6 bg-itin-sand-100 rounded-lg">
                <div className="text-2xl mb-3"></div>
                <h3 className="font-semibold text-itin-sand-900 mb-2">Compare Schedules</h3>
                <p className="text-sm text-itin-sand-700">
                  Upload schedule images and find the best meeting times with others.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const profile = auth.user?.profile ?? ({} as Record<string, unknown>);
  const email = (profile as Record<string, unknown>).email as string ?? (profile as Record<string, unknown>).preferred_username as string ?? "(no email)";
  const displayName = (profile as Record<string, unknown>).name as string ?? email;

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="card p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-itin-sand-900">Welcome back, {displayName}</h1>
              <p className="text-itin-sand-600 mt-1">{email}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold text-itin-sand-900 mb-4">About Schedular</h2>
          <div className="space-y-4 text-itin-sand-700">
            <p>
              Schedular is your AI-powered calendar assistant designed to help you manage your time more effectively. 
              Whether you're coordinating meetings, planning your week, or trying to find free time, Schedular has you covered.
            </p>
            <p>
              Use the navigation above to explore features like the AI Chat for conversational scheduling, 
              the Calendar view to see your events, and the Compare feature to find the best meeting times with others.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
