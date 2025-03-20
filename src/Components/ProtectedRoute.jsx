import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const userRole = sessionStorage.getItem("userRole");
  console.log("Current User Role:", userRole);
  console.log("Allowed Roles:", allowedRoles);

  if (!userRole) {
    console.log("No role found. Redirecting to /login");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log("Unauthorized access! Redirecting to /unauthorized");
    return <Navigate to="/unauthorized" />;
  }

  console.log("Access granted! Rendering component...");
  return <Outlet />;  // ✅ This allows nested routes to render properly
};

export default ProtectedRoute;
