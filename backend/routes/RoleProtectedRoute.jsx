import { Navigate } from 'react-router-dom';

export default function RoleProtectedRoute({ role, children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" />;
  if (userRole !== role) return <Navigate to="/unauthorized" />;

  return children;
}
