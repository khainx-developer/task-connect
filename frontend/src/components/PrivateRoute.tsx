import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Prevents incorrect redirects

  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
