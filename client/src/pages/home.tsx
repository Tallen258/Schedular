import { useAuth } from "react-oidc-context";

export default function Home() {
  const auth = useAuth();

  const handleLogin = () => {
    void auth?.signinRedirect?.();
  };

  const handleLogout = () => {
    void auth?.signoutRedirect?.();
  };

  if (!auth || !auth.isAuthenticated) {
    return (
      <main className="min-h-screen p-6 bg-itin-sand-50">
        <section className="mx-auto max-w-3xl card p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-itin-sand-200 px-3 py-1 text-itin-sand-800 text-xs font-medium">
            <span>Welcome</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-itin-sand-900">Plan your week with ease</h1>
          <p className="mt-2 text-itin-sand-700">
            Sign in to see your dashboard, upcoming events, and smart suggestions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleLogin} className="btn-primary">
              Login
            </button>
          </div>
        </section>
      </main>
    );
  }

  const profile = auth.user?.profile ?? ({} as Record<string, unknown>);
  const email = (profile as Record<string, unknown>).email as string ?? (profile as Record<string, unknown>).preferred_username as string ?? "(no email claim)";
  const displayName = (profile as Record<string, unknown>).name as string ?? email;
  const sub = (profile as Record<string, unknown>).sub as string ?? "—";

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl space-y-6">
        <header className="card p-6">
          <div className="text-sm text-itin-sand-600">Signed in as</div>
          <h1 className="text-2xl font-semibold mt-1 text-itin-sand-900">{displayName}</h1>
          <p className="text-itin-sand-700 text-sm mt-1">Email/Username: {email}</p>
          <p className="text-itin-sand-500 text-xs mt-1">Sub: {String(sub)}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </header>
      </section>
    </main>
  );
}
