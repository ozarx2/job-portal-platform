import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar
} from 'recharts';
import AgentPerformanceAnalytics from './AgentPerformanceAnalytics';
import AdvancedAnalytics from './AdvancedAnalytics';
import DataExport from './DataExport';
import RealTimeDashboard from './RealTimeDashboard';

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    newRecruits: 0,
    dailyApplications: [],
    statusCounts: {},
    range: {},
    summaryStats: {}
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to view reports.');
      }

      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const url = `${API_BASE_URL}/reports/summary${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const dailyData = data.dailyApplications?.map(d => ({ date: d._id, count: d.count })) || [];
  const pieData = Object.entries(data.statusCounts || {}).map(([name, value]) => ({ name, value }));

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'real-time', name: 'Real-Time', icon: '⚡' },
    { id: 'agent-performance', name: 'Agent Performance', icon: '👥' },
    { id: 'advanced-analytics', name: 'Advanced Analytics', icon: '🔬' },
    { id: 'data-export', name: 'Data Export', icon: '📤' },
    { id: 'applications', name: 'Applications', icon: '📋' },
    { id: 'conversion', name: 'Conversion', icon: '🎯' },
    { id: 'trends', name: 'Trends', icon: '📈' }
  ];

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      red: 'bg-red-50 border-red-200 text-red-600'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {change && (
              <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  const ConversionFunnel = () => {
    const funnelData = [
      { stage: 'Applied', count: data.statusCounts?.Applied || 0, percentage: 100 },
      { stage: 'Shortlisted', count: data.statusCounts?.Shortlisted || 0, percentage: 75 },
      { stage: 'Interviewed', count: data.statusCounts?.Interviewed || 0, percentage: 50 },
      { stage: 'Hired', count: data.statusCounts?.Hired || 0, percentage: 25 }
    ];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {funnelData.map((item, index) => (
            <div key={item.stage} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-white text-xs font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <span className="text-blue-600 mr-2">📊</span>
          <span className="text-sm font-medium text-blue-900">Export Data</span>
        </button>
        <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <span className="text-green-600 mr-2">📈</span>
          <span className="text-sm font-medium text-green-900">Generate Report</span>
        </button>
        <button className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
          <span className="text-purple-600 mr-2">⚙️</span>
          <span className="text-sm font-medium text-purple-900">Settings</span>
        </button>
        <button className="flex items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
          <span className="text-orange-600 mr-2">🔄</span>
          <span className="text-sm font-medium text-orange-900">Refresh</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-red-600 font-semibold mb-2 text-lg">Error Loading Reports</div>
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchReports}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📊 Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
            
            {/* Date Range Filter */}
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchReports}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="New Recruits"
                value={data.newRecruits}
                change="+12% from last month"
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Applications"
                value={Object.values(data.statusCounts || {}).reduce((a, b) => a + b, 0)}
                change="+8% from last month"
                icon="📋"
                color="green"
              />
              <StatCard
                title="Total Leads"
                value={data.totalLeads || 0}
                change="+18% from last month"
                icon="🎯"
                color="purple"
              />
              <StatCard
                title="Interviewed"
                value={data.statusCounts?.Interviewed || 0}
                change="+25% from last month"
                icon="🎯"
                color="orange"
              />
              <StatCard
                title="Hired"
                value={data.statusCounts?.Hired || 0}
                change="+15% from last month"
                icon="✅"
                color="purple"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Daily Applications Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Applications Trend</h3>
                <div className="h-80">
                  {dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyData}>
                        <defs>
                          <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorApplications)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Status Distribution</h3>
                <div className="h-80">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Status Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
                <div className="h-80">
                  {(() => {
                    const leadPieData = Object.entries(data.leadStatusCounts || {}).map(([name, value]) => ({ name, value }));
                    return leadPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leadPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {leadPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 text-lg">
                        No lead data available
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ConversionFunnel />
              </div>
              <QuickActions />
            </div>
          </div>
        )}

        {activeTab === 'real-time' && <RealTimeDashboard />}

        {activeTab === 'agent-performance' && <AgentPerformanceAnalytics />}

        {activeTab === 'advanced-analytics' && <AdvancedAnalytics />}

        {activeTab === 'data-export' && <DataExport />}

        {activeTab === 'applications' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Applications"
                  value={Object.values(data.statusCounts || {}).reduce((a, b) => a + b, 0)}
                  icon="📄"
                  color="blue"
                />
                <StatCard
                  title="Pending Review"
                  value={data.statusCounts?.Applied || 0}
                  icon="⏳"
                  color="orange"
                />
                <StatCard
                  title="Success Rate"
                  value={Math.round(((data.statusCounts?.Hired || 0) / Math.max(1, Object.values(data.statusCounts || {}).reduce((a, b) => a + b, 0))) * 100)}
                  icon="🎯"
                  color="green"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversion' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Analytics</h2>
              <ConversionFunnel />
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Trend Analysis</h2>
              <div className="h-96">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No trend data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
