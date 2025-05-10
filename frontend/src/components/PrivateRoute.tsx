import { Navigate, Outlet } from "react-router-dom";
import { userStore } from "../store/userStore";

const PrivateRoute = () => {
  const user  = userStore();

  if (user.id === "") return <div>Loading...</div>; // Prevents incorrect redirects

  return user.id !== "" ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
