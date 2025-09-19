import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminLayout from '../components/admin/AdminLayout';

// Shortlisted Candidates Table Component
const ShortlistedCandidatesTable = () => {
  const [shortlistedLeads, setShortlistedLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShortlistedLeads();
  }, []);

  const fetchShortlistedLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching shortlisted leads...');
      const response = await axios.get('https://api.ozarx.in/api/crm/leads?status=Shortlisted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Shortlisted leads response:', response.data);
      if (response.data.success) {
        setShortlistedLeads(response.data.data);
        console.log('Shortlisted leads set:', response.data.data);
      } else {
        // Try fetching all leads and filter client-side
        const allLeadsResponse = await axios.get('https://api.ozarx.in/api/crm/leads', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (allLeadsResponse.data.success) {
          const shortlisted = allLeadsResponse.data.data.filter(lead => lead.status === 'Shortlisted');
          setShortlistedLeads(shortlisted);
          console.log('Filtered shortlisted leads:', shortlisted);
        }
      }
    } catch (err) {
      console.error('Error fetching shortlisted leads:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading shortlisted candidates...</div>;
  }

  return (
    <div>
      {/* Debug Information */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <div>Shortlisted leads count: {shortlistedLeads.length}</div>
        {shortlistedLeads.length > 0 && (
          <div className="mt-2">
            <div>Sample lead data:</div>
            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(shortlistedLeads[0], null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table id="shortlisted-table" className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Shortlisted</th>
            </tr>
          </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shortlistedLeads.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {lead.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {lead.location || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lead.companyName ? (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {lead.companyName}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Not assigned</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lead.jobTitle ? (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {lead.jobTitle}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Not assigned</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {lead.agent?.name || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {shortlistedLeads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No shortlisted candidates found.
        </div>
      )}
    </div>
  );
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ newRecruits: 0, dailyApplications: [], statusCounts: {}, range: {} });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';

  
  

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view reports.');
      }
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const url = `${API_BASE_URL}/reports/summary${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const dailyData = useMemo(() => (data.dailyApplications || []).map(d => ({ date: d._id, count: d.count })), [data]);
  const pieData = useMemo(() => {
    const entries = Object.entries(data.statusCounts || {});
    return entries.map(([name, value]) => ({ name, value }));
  }, [data]);

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading reports...</div>;
  if (error) return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;

  return (
    <AdminLayout title="Reports">
      <div className="space-y-8">
        <nav className="flex flex-wrap gap-2 mb-2">
          <a href="#filters" className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Filters</a>
          <a href="#daily" className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Daily Applications</a>
          <a href="#pipeline" className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Pipeline</a>
          <a href="#shortlisted" className="px-3 py-2 rounded bg-purple-600 text-white text-sm">Shortlisted</a>
          <a href="#top" className="px-3 py-2 rounded bg-gray-700 text-white text-sm">Back to top</a>
        </nav>

      <div id="filters" className="flex items-end gap-3">
        <div>
          <label className="block text-sm text-gray-600">Start date</label>
          <input type="date" className="border rounded p-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">End date</label>
          <input type="date" className="border rounded p-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={fetchReports}>Apply</button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-white shadow">
          <div className="text-sm text-gray-500">New recruits</div>
          <div className="text-2xl font-semibold">{data.newRecruits}</div>
        </div>
        <div className="p-4 rounded bg-white shadow">
          <div className="text-sm text-gray-500">Interviewed</div>
          <div className="text-2xl font-semibold">{data.statusCounts?.Interviewed || 0}</div>
        </div>
        <div className="p-4 rounded bg-white shadow">
          <div className="text-sm text-gray-500">Hired</div>
          <div className="text-2xl font-semibold">{data.statusCounts?.Hired || 0}</div>
        </div>
      </section>

      <section id="daily">
        <h2 className="text-xl font-semibold mb-2">Daily applications</h2>
        <div className="w-full h-72 bg-white rounded shadow p-2">
          {dailyData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No data</div>
          )}
        </div>
      </section>

      <section id="pipeline">
        <h2 className="text-xl font-semibold mb-2">Pipeline status</h2>
        <div className="w-full h-72 bg-white rounded shadow p-2">
          {pieData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No data</div>
          )}
        </div>
      </section>

      {/* Shortlisted Candidates with Company/Job Assignment */}
      <section id="shortlisted">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Shortlisted Candidates</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const table = document.querySelector('#shortlisted-table');
                if (table) {
                  const component = table.__reactInternalInstance || table._reactInternalFiber;
                  // Force re-render by updating state
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Refresh Shortlisted
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Refresh All Data
            </button>
          </div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <ShortlistedCandidatesTable />
        </div>
      </section>
    </div>
    </AdminLayout>
  );
}


