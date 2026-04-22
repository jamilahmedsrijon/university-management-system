import { Navigate, useLocation } from "react-router-dom";
import {
  clearAuthStorage,
  getDefaultRouteForRole,
  getStoredRole,
  getStoredToken,
} from "../axios";

function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = getStoredToken();
  const userRole = getStoredRole();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!userRole) {
    clearAuthStorage();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && role !== userRole) {
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
  }

  return children;
}

export default ProtectedRoute;
