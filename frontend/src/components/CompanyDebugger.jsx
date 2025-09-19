import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompanyDebugger = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState([]);

  const testEndpoints = [
    'https://api.ozarx.in/api/companies',
    'https://api.ozarx.in/api/company',
    'https://api.ozarx.in/api/employers',
    'https://api.ozarx.in/api/jobs' // To extract companies from jobs
  ];

  const testAllEndpoints = async () => {
    setLoading(true);
    setTestResults([]);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await axios.get(endpoint, { headers });
        results.push({
          endpoint,
          status: 'success',
          data: response.data,
          count: Array.isArray(response.data) ? response.data.length : 'Not an array'
        });
        console.log(`Success for ${endpoint}:`, response.data);
      } catch (err) {
        results.push({
          endpoint,
          status: 'error',
          error: err.message,
          statusCode: err.response?.status
        });
        console.log(`Error for ${endpoint}:`, err.message);
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const createTestCompanies = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const testCompanies = [
      { name: 'Tech Solutions Inc', description: 'Technology company' },
      { name: 'Finance Corp', description: 'Financial services' },
      { name: 'Healthcare Ltd', description: 'Healthcare provider' },
      { name: 'Education Group', description: 'Educational services' },
      { name: 'Manufacturing Co', description: 'Manufacturing company' }
    ];

    const results = [];
    for (const company of testCompanies) {
      try {
        // Try different possible endpoints for creating companies
        const endpoints = [
          'https://api.ozarx.in/api/companies',
          'https://api.ozarx.in/api/company',
          'https://api.ozarx.in/api/employers'
        ];

        let success = false;
        for (const endpoint of endpoints) {
          try {
            const response = await axios.post(endpoint, company, { headers });
            results.push({ company: company.name, endpoint, status: 'success', data: response.data });
            success = true;
            break;
          } catch (err) {
            console.log(`Failed to create company at ${endpoint}:`, err.message);
          }
        }

        if (!success) {
          results.push({ company: company.name, status: 'failed', error: 'All endpoints failed' });
        }
      } catch (err) {
        results.push({ company: company.name, status: 'error', error: err.message });
      }
    }

    console.log('Company creation results:', results);
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Company API Debugger</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={testAllEndpoints}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test All Endpoints'}
          </button>
          
          <button
            onClick={createTestCompanies}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test Companies'}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="p-3 border rounded text-sm">
                <div className="font-medium">{result.endpoint}</div>
                <div className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {result.status}
                </div>
                {result.data && (
                  <div className="text-gray-600">
                    Data: {JSON.stringify(result.data).substring(0, 200)}...
                  </div>
                )}
                {result.error && (
                  <div className="text-red-600">Error: {result.error}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDebugger;
