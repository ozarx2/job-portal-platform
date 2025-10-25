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
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    performanceMetrics: {},
    trends: [],
    comparisons: {},
    insights: []
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('conversion');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [timeRange, selectedMetric]);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Simulate advanced analytics data (you can replace with actual API calls)
      const mockData = {
        performanceMetrics: {
          conversionRate: 12.5,
          responseTime: 2.3,
          satisfactionScore: 4.2,
          retentionRate: 85.7
        },
        trends: [
          { month: 'Jan', applications: 120, hired: 15, conversion: 12.5 },
          { month: 'Feb', applications: 135, hired: 18, conversion: 13.3 },
          { month: 'Mar', applications: 148, hired: 22, conversion: 14.9 },
          { month: 'Apr', applications: 162, hired: 25, conversion: 15.4 },
          { month: 'May', applications: 175, hired: 28, conversion: 16.0 },
          { month: 'Jun', applications: 189, hired: 32, conversion: 16.9 }
        ],
        comparisons: {
          industryAverage: 8.5,
          lastYear: 10.2,
          competitors: 9.8
        },
        insights: [
          { type: 'success', message: 'Conversion rate increased by 23% this month' },
          { type: 'warning', message: 'Response time needs improvement' },
          { type: 'info', message: 'New candidates show higher engagement rates' }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

  const InsightCard = ({ insight, index }) => {
    const typeClasses = {
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };

    const icons = {
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️',
      error: '❌'
    };

    return (
      <div className={`p-4 rounded-lg border ${typeClasses[insight.type]} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
        <div className="flex items-center">
          <span className="text-lg mr-3">{icons[insight.type]}</span>
          <p className="font-medium">{insight.message}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📊 Advanced Analytics
          </h2>
          <p className="mt-1 text-gray-600">Deep insights and performance intelligence</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="conversion">Conversion Rate</option>
            <option value="response">Response Time</option>
            <option value="satisfaction">Satisfaction</option>
            <option value="retention">Retention</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversion Rate"
          value={`${data.performanceMetrics.conversionRate}%`}
          change="+23%"
          icon="🎯"
          color="blue"
          trend="up"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${data.performanceMetrics.responseTime}h`}
          change="-15%"
          icon="⚡"
          color="green"
          trend="up"
        />
        <MetricCard
          title="Satisfaction Score"
          value={`${data.performanceMetrics.satisfactionScore}/5`}
          change="+8%"
          icon="😊"
          color="orange"
          trend="up"
        />
        <MetricCard
          title="Retention Rate"
          value={`${data.performanceMetrics.retentionRate}%`}
          change="+5%"
          icon="🔄"
          color="purple"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="applications" fill="#3b82f6" name="Applications" />
                <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#22c55e" strokeWidth={3} name="Conversion %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={[
                { name: 'Your Rate', value: data.performanceMetrics.conversionRate, fill: '#3b82f6' },
                { name: 'Industry Avg', value: data.comparisons.industryAverage, fill: '#22c55e' },
                { name: 'Last Year', value: data.comparisons.lastYear, fill: '#f59e0b' },
                { name: 'Competitors', value: data.comparisons.competitors, fill: '#ef4444' }
              ]}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                <Tooltip />
                <Legend />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} />
          ))}
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Efficiency Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Efficiency Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Time to Hire</span>
              <span className="text-lg font-bold text-gray-900">12.5 days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Cost per Hire</span>
              <span className="text-lg font-bold text-gray-900">$2,340</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Quality Score</span>
              <span className="text-lg font-bold text-gray-900">8.7/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Predictive Analytics</h3>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-sm text-gray-600">Success Probability</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Next Month Forecast</span>
                <span className="font-semibold">+18% growth</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Risk Level</span>
                <span className="font-semibold text-green-600">Low</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Optimal Hiring Time</span>
                <span className="font-semibold">Q2 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Heatmap */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Heatmap</h3>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className={`h-6 rounded ${
                  i % 7 < 2 ? 'bg-green-200' :
                  i % 7 < 4 ? 'bg-yellow-200' :
                  i % 7 < 6 ? 'bg-orange-200' : 'bg-red-200'
                }`}
                title={`Day ${i + 1}`}
              ></div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;






