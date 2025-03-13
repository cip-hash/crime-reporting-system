import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = sessionStorage.getItem("userRole");

  if (!userRole) {
    // User not logged in, redirect to login
    return <Navigate to="/login" />;
  }

  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
