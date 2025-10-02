import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import ModernAdminDashboard from '../components/admin/ModernAdminDashboard';

export default function AdminDashboard() {
  return <ModernAdminDashboard />;
}
