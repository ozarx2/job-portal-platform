import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import ReportsDashboard from '../components/admin/ReportsDashboard';

export default function Reports() {
  return (
    <AdminLayout title="Reports">
      <ReportsDashboard />
    </AdminLayout>
  );
}