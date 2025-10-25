import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const RealTimeDashboard = () => {
  const [isLive, setIsLive] = useState(true);
  const [data, setData] = useState({
    currentUsers: 0,
    activeSessions: 0,
    newApplications: 0,
    systemHealth: 0,
    realTimeMetrics: [],
    topPages: [],
    errorRate: 0
  });

  useEffect(() => {
    let interval;
    if (isLive) {
      // Simulate real-time data updates
      interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          currentUsers: Math.floor(Math.random() * 1000) + 500,
          activeSessions: Math.floor(Math.random() * 200) + 50,
          newApplications: Math.floor(Math.random() * 50) + 10,
          systemHealth: Math.floor(Math.random() * 20) + 80,
          errorRate: Math.random() * 2,
          realTimeMetrics: generateRealTimeMetrics(),
          topPages: generateTopPages()
        }));
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  const generateRealTimeMetrics = () => {
    const now = new Date();
    const metrics = [];
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      metrics.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        users: Math.floor(Math.random() * 100) + 200,
        applications: Math.floor(Math.random() * 20) + 5,
        conversions: Math.floor(Math.random() * 10) + 2
      });
    }
    return metrics;
  };

  const generateTopPages = () => [
    { name: 'Home Page', visitors: 1250, percentage: 35 },
    { name: 'Job Listings', visitors: 980, percentage: 28 },
    { name: 'Application Form', visitors: 650, percentage: 18 },
    { name: 'Company Profiles', visitors: 420, percentage: 12 },
    { name: 'About Us', visitors: 250, percentage: 7 }
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const MetricCard = ({ title, value, change, icon, color = 'blue', trend = 'up' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      red: 'bg-red-50 border-red-200 text-red-600'
    };

    const trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️';
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className={`text-sm font-medium ${trendColor}`}>
            {trendIcon} {change}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ⚡ Real-Time Dashboard
          </h2>
          <p className="mt-1 text-gray-600">Live monitoring and instant insights</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isLive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLive ? '⏸️ Pause' : '▶️ Resume'}
          </button>
        </div>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Users"
          value={data.currentUsers.toLocaleString()}
          change="+12%"
          icon="👥"
          color="blue"
          trend="up"
        />
        <MetricCard
          title="Active Sessions"
          value={data.activeSessions}
          change="+8%"
          icon="🔗"
          color="green"
          trend="up"
        />
        <MetricCard
          title="New Applications"
          value={data.newApplications}
          change="+25%"
          icon="📋"
          color="orange"
          trend="up"
        />
        <MetricCard
          title="System Health"
          value={`${data.systemHealth}%`}
          change="+2%"
          icon="💚"
          color="green"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-Time Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Real-Time Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.realTimeMetrics}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  name="Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorApplications)" 
                  name="Applications"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Pages (Last Hour)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topPages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="visitors"
                >
                  {data.topPages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Server Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Server Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">API Server</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Email Service</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">File Storage</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-yellow-600">Warning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory</span>
                <span>68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disk Space</span>
                <span>32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Error Rate</span>
                <span>{data.errorRate.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${data.errorRate * 50}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>New user registration</span>
              <span className="ml-auto text-gray-500">2s ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>Job application submitted</span>
              <span className="ml-auto text-gray-500">15s ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <span>Agent logged in</span>
              <span className="ml-auto text-gray-500">1m ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span>Report generated</span>
              <span className="ml-auto text-gray-500">3m ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span>System backup completed</span>
              <span className="ml-auto text-gray-500">5m ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center">
          <div className="text-yellow-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800">System Alert</h3>
            <p className="text-yellow-700 mt-1">
              File storage usage is at 85%. Consider cleaning up old files or upgrading storage capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;






