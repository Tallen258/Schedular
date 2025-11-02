import { useAuth } from "react-oidc-context";

export default function Home() {
  const auth = useAuth();

  const handleLogin = () => {
    void auth?.signinRedirect?.();
  };

  const handleLogout = () => {
    void auth?.signoutRedirect?.();
  };

  // No loading/error branches — minimal auth toggle only
  if (!auth || !auth.isAuthenticated) {
    return (
      <main className="min-h-screen p-6">
        <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-rose-700 text-xs font-medium">
            <span>Welcome</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Plan your week with ease</h1>
          <p className="mt-2 text-slate-600">
            Sign in to see your dashboard, upcoming events, and smart suggestions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleLogin} className="px-4 py-2 rounded-xl border shadow-sm hover:shadow transition">
              Login
            </button>
          </div>
        </section>
      </main>
    );
  }

  const profile = auth.user?.profile ?? ({} as Record<string, unknown>);
  const email = (profile as any).email ?? (profile as any).preferred_username ?? "(no email claim)";
  const displayName = (profile as any).name ?? email;
  const sub = (profile as any).sub ?? "—";

  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-2xl border bg-rose-50/70 p-6">
          <div className="text-sm text-slate-600">Signed in as</div>
          <h1 className="text-2xl font-semibold mt-1">{displayName}</h1>
          <p className="text-slate-700 text-sm mt-1">Email/Username: {email}</p>
          <p className="text-slate-500 text-xs mt-1">Sub: {String(sub)}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={handleLogout} className="px-4 py-2 rounded-xl border shadow-sm hover:shadow transition">
              Logout
            </button>
          </div>
        </header>

        {/* Debug details are omitted for now */}
      </section>
    </main>
  );
}
