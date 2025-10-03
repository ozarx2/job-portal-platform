import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiDebugger() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Primary API (api.ozarx.in)', url: 'https://api.ozarx.in/api/health' },
    { name: 'Jobs Endpoint (Primary)', url: 'https://api.ozarx.in/api/jobs?page=1&limit=5' },
    { name: 'Companies Endpoint (Primary)', url: 'https://api.ozarx.in/api/companies' }
  ];

  const testEndpoint = async (endpoint) => {
    try {
      const startTime = Date.now();
      const response = await axios.get(endpoint.url, { timeout: 10000 });
      const endTime = Date.now();
      
      return {
        status: 'success',
        statusCode: response.status,
        responseTime: `${endTime - startTime}ms`,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        status: 'error',
        statusCode: error.response?.status || 'No Response',
        responseTime: null,
        data: null,
        error: error.message
      };
    }
  };

  const runTests = async () => {
    setLoading(true);
    const testResults = {};
    
    for (const endpoint of testEndpoints) {
      console.log(`Testing ${endpoint.name}...`);
      const result = await testEndpoint(endpoint);
      testResults[endpoint.name] = result;
    }
    
    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Endpoint Debugger</h2>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="border rounded p-4">
            <h3 className="font-semibold text-lg mb-2">{name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Status: </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <div>
                <span className="font-medium">Status Code: </span>
                <span className="font-mono">{result.statusCode}</span>
              </div>
              {result.responseTime && (
                <div>
                  <span className="font-medium">Response Time: </span>
                  <span className="font-mono">{result.responseTime}</span>
                </div>
              )}
              {result.error && (
                <div className="col-span-2">
                  <span className="font-medium">Error: </span>
                  <span className="text-red-600">{result.error}</span>
                </div>
              )}
            </div>
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Response Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
