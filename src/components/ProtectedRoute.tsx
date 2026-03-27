import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return <div className="card">Checking your session...</div>;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
