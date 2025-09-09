import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RoleRedirect() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" replace />;

  let to = '/admin-dashboard';
  if (role === 'candidate') to = '/candidate-dashboard';
  else if (role === 'employer') to = '/employer-dashboard';
  else if (role === 'agent') to = '/agent-dashboard';

  return <Navigate to={to} replace />;
}
















