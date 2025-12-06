import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";
import Spinner from "./Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
