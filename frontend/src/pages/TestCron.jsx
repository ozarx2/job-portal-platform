import React from 'react';
import CronManagement from '../components/admin/CronManagement';

const TestCron = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Cron Job Management Test</h1>
        <CronManagement />
      </div>
    </div>
  );
};

export default TestCron;








