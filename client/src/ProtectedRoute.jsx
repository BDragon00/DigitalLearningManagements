import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser, getToken, isTokenExpired } from "./api";

/**
 * Wraps a route to require authentication, and optionally restrict by role.
 * Also watches the token's expiry while the route is mounted and
 * automatically signs the user out once it expires.
 *
 * Usage:
 *   <Route path="/admin" element={
 *     <ProtectedRoute allowedRoles={["Admin"]}>
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   } />
 */
function ProtectedRoute({ children, allowedRoles }) {
    const navigate = useNavigate();
    const token = getToken();
    const user = getStoredUser();

    useEffect(() => {
        const interval = setInterval(() => {
            if (isTokenExpired()) {
                clearSession();
                navigate("/login?expired=1", { replace: true });
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [navigate]);

    // Not signed in -> back to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Token already expired -> back to login with the expired flag
    if (isTokenExpired()) {
        clearSession();
        return <Navigate to="/login?expired=1" replace />;
    }

    // Role restriction set and user isn't in it -> back to login
    if (allowedRoles && !allowedRoles.includes(user.RoleName)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;