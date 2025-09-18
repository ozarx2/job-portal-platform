import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminLayout from '../components/admin/AdminLayout';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ newRecruits: 0, dailyApplications: [], statusCounts: {}, range: {} });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://35.192.180.25/api';

  
  

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
    </div>
    </AdminLayout>
  );
}


