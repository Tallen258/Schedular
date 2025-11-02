// src/components/AuthButton.tsx
import { useAuth } from "react-oidc-context";

export default function AuthButton() {
  const auth = useAuth();

  if (auth.isLoading) return <span>Loading…</span>;
  if (auth.error) return <span>Error: {auth.error.message}</span>;

  return auth.isAuthenticated ? (
    <button onClick={() => void auth.removeUser()}>Log out</button>
  ) : (
    <button onClick={() => void auth.signinRedirect()}>Log in</button>
  );
}
