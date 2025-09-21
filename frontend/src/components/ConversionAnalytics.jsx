import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, LinearProgress, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const ConversionAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    conversionFunnel: [],
    agentPerformance: [],
    jobAssignments: [],
    overallStats: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api.ozarx.in/api/reports/conversion-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const getConversionRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600 font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Leads
              </Typography>
              <Typography variant="h4" color="primary">
                {analytics.overallStats?.totalLeads || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Converted Users
              </Typography>
              <Typography variant="h4" color="success.main">
                {analytics.overallStats?.convertedUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4" color="info.main">
                {analytics.overallStats?.conversionRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Active Jobs
              </Typography>
              <Typography variant="h4" color="warning.main">
                {analytics.overallStats?.activeJobs || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Conversion Funnel */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Conversion Funnel
          </Typography>
          <div className="space-y-4">
            {analytics.conversionFunnel?.map((stage, index) => {
              const previousStage = index > 0 ? analytics.conversionFunnel[index - 1] : null;
              const conversionRate = getConversionRate(stage.count, previousStage?.count);
              
              return (
                <div key={stage.status} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Chip 
                        label={stage.status} 
                        color={index === analytics.conversionFunnel.length - 1 ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {stage.count} leads
                      </Typography>
                    </div>
                    <Typography variant="body2" fontWeight="bold">
                      {conversionRate}% conversion
                    </Typography>
                  </div>
                  <LinearProgress 
                    variant="determinate" 
                    value={conversionRate} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Agent Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Agent Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agentName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leadsConverted" fill="#3b82f6" name="Leads Converted" />
                  <Bar dataKey="usersCreated" fill="#10b981" name="Users Created" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Assignment Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💼 Job Assignment Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.jobAssignments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="assignments"
                  >
                    {analytics.jobAssignments?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Agent Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Agent Performance Details
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Agent</th>
                  <th className="text-right py-2">Total Leads</th>
                  <th className="text-right py-2">Contacted</th>
                  <th className="text-right py-2">Shortlisted</th>
                  <th className="text-right py-2">Converted</th>
                  <th className="text-right py-2">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.agentPerformance?.map((agent, index) => (
                  <tr key={agent.agentId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 font-medium">{agent.agentName}</td>
                    <td className="py-2 text-right">{agent.totalLeads}</td>
                    <td className="py-2 text-right">{agent.leadsContacted}</td>
                    <td className="py-2 text-right">{agent.leadsShortlisted}</td>
                    <td className="py-2 text-right">{agent.leadsConverted}</td>
                    <td className="py-2 text-right font-bold text-green-600">
                      {agent.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionAnalytics;
