import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

/**
 * Role-aware protected route.
 * - Unauthenticated → /login or /volunteer/login
 * - Wrong role → redirect to that role's dashboard
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: userRole, loading } = useAuth();

  if (loading) return <Loading />;

  if (!isAuthenticated) {
    const loginPath =
      role === 'admin' ? '/admin/login' : role === 'volunteer' ? '/volunteer/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (role && userRole !== role) {
    const dashboardPath =
      userRole === 'admin'
        ? '/admin/dashboard'
        : userRole === 'volunteer'
          ? '/volunteer/dashboard'
          : '/student/dashboard';
    return (
      <Navigate to={dashboardPath} replace />
    );
  }

  return children;
}
