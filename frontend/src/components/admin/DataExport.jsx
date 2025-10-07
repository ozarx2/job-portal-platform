import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DataExport = () => {
  const [exportType, setExportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const exportTypes = [
    {
      id: 'summary',
      name: 'Summary Report',
      description: 'Overall statistics and key metrics',
      icon: '📊'
    },
    {
      id: 'applications',
      name: 'Applications Data',
      description: 'All application records with details',
      icon: '📋'
    },
    {
      id: 'agent-performance',
      name: 'Agent Performance',
      description: 'Agent performance metrics and analytics',
      icon: '👥'
    },
    {
      id: 'conversion-funnel',
      name: 'Conversion Funnel',
      description: 'Lead progression and conversion data',
      icon: '🎯'
    },
    {
      id: 'user-activity',
      name: 'User Activity',
      description: 'User engagement and activity logs',
      icon: '👤'
    }
  ];

  const formats = [
    { id: 'csv', name: 'CSV', icon: '📄', description: 'Excel compatible' },
    { id: 'json', name: 'JSON', icon: '🔧', description: 'Developer friendly' },
    { id: 'pdf', name: 'PDF', icon: '📑', description: 'Professional report' },
    { id: 'excel', name: 'Excel', icon: '📊', description: 'Advanced formatting' }
  ];

  const handleExport = async () => {
    try {
      setLoading(true);
      setExportStatus('Preparing export...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Determine the API endpoint based on export type
      let endpoint = '';
      let filename = '';
      
      switch (exportType) {
        case 'summary':
          endpoint = '/reports/summary';
          filename = `summary-report-${new Date().toISOString().split('T')[0]}`;
          break;
        case 'agent-performance':
          endpoint = '/reports/agent-performance';
          filename = `agent-performance-${new Date().toISOString().split('T')[0]}`;
          break;
        case 'applications':
          endpoint = '/applications';
          filename = `applications-${new Date().toISOString().split('T')[0]}`;
          break;
        default:
          endpoint = '/reports/summary';
          filename = `export-${exportType}-${new Date().toISOString().split('T')[0]}`;
      }

      // Add date range parameters if specified
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const url = `${API_BASE_URL}${endpoint}${params.toString() ? '?' + params.toString() : ''}`;
      
      setExportStatus('Fetching data...');
      
      // Fetch data from backend
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setExportStatus('Processing data...');

      // Process data based on format
      let exportData;
      let mimeType;
      let fileExtension;

      switch (format) {
        case 'csv':
          exportData = convertToCSV(response.data, exportType);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'json':
          exportData = JSON.stringify(response.data, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'pdf':
          // Generate real PDF using jsPDF
          await generatePDF(response.data, exportType, filename);
          setExportStatus('PDF export completed successfully!');
          setTimeout(() => {
            setExportStatus('');
            setLoading(false);
          }, 3000);
          return;
        case 'excel':
          // For Excel, we'll create a CSV (Excel can open CSV files)
          exportData = convertToCSV(response.data, exportType);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          setExportStatus('Excel export created as CSV file');
          break;
        default:
          exportData = JSON.stringify(response.data, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
      }

      setExportStatus('Downloading file...');

      // Create and download the file
      const blob = new Blob([exportData], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filename}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setExportStatus('Export completed successfully!');
      
      setTimeout(() => {
        setExportStatus('');
        setLoading(false);
      }, 3000);

    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data, type) => {
    if (type === 'summary') {
      const headers = ['Metric', 'Value', 'Description'];
      const rows = [
        ['New Recruits', data.newRecruits || 0, 'Total new recruits in period'],
        ['Daily Applications', data.dailyApplications?.length || 0, 'Number of days with application data'],
        ['Total Leads', data.totalLeads || 0, 'Total leads generated in period'],
        ['Total Application Status Types', Object.keys(data.statusCounts || {}).length, 'Number of different application statuses'],
        ['Total Lead Status Types', Object.keys(data.leadStatusCounts || {}).length, 'Number of different lead statuses']
      ];
      
      // Add application status breakdown
      Object.entries(data.statusCounts || {}).forEach(([status, count]) => {
        rows.push([`Application Status: ${status}`, count, `Applications with ${status} status`]);
      });
      
      // Add lead status breakdown
      Object.entries(data.leadStatusCounts || {}).forEach(([status, count]) => {
        rows.push([`Lead Status: ${status}`, count, `Leads with ${status} status`]);
      });
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }
    
    if (type === 'agent-performance' && data.success) {
      const headers = ['Agent Name', 'Email', 'Total Leads', 'Conversion Rate', 'Response Rate', 'Recent Leads'];
      const rows = data.data.agents.map(agent => [
        agent.agentName,
        agent.agentEmail,
        agent.totalLeads,
        `${agent.conversionRate}%`,
        `${agent.responseRate}%`,
        agent.recentLeads
      ]);
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }
    
    // Default CSV conversion
    return JSON.stringify(data, null, 2);
  };

  // Helper function to convert data to text
  const convertToText = (data, type) => {
    let text = `EXPORT REPORT - ${type.toUpperCase()}\n`;
    text += `Generated on: ${new Date().toLocaleString()}\n`;
    text += `==========================================\n\n`;
    
    if (type === 'summary') {
      text += `SUMMARY STATISTICS\n`;
      text += `------------------\n`;
      text += `New Recruits: ${data.newRecruits || 0}\n`;
      text += `Daily Applications: ${data.dailyApplications?.length || 0} days\n`;
      text += `Total Leads: ${data.totalLeads || 0}\n`;
      text += `Application Status Distribution:\n`;
      Object.entries(data.statusCounts || {}).forEach(([status, count]) => {
        text += `  ${status}: ${count}\n`;
      });
      text += `Lead Status Distribution:\n`;
      Object.entries(data.leadStatusCounts || {}).forEach(([status, count]) => {
        text += `  ${status}: ${count}\n`;
      });
    }
    
    if (type === 'agent-performance' && data.success) {
      text += `AGENT PERFORMANCE REPORT\n`;
      text += `------------------------\n`;
      data.data.agents.forEach(agent => {
        text += `Agent: ${agent.agentName}\n`;
        text += `Email: ${agent.agentEmail}\n`;
        text += `Total Leads: ${agent.totalLeads}\n`;
        text += `Conversion Rate: ${agent.conversionRate}%\n`;
        text += `Response Rate: ${agent.responseRate}%\n`;
        text += `Recent Leads: ${agent.recentLeads}\n\n`;
      });
    }
    
    return text;
  };

  // Generate PDF using jsPDF
  const generatePDF = async (data, type, filename) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${type.toUpperCase()} REPORT`, 20, 30);
    
    // Add date and time
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
    
    // Add date range if specified
    if (dateRange.startDate && dateRange.endDate) {
      doc.text(`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`, 20, 55);
    }
    
    let yPosition = 70;
    
    if (type === 'summary') {
      // Summary report
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY STATISTICS', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const summaryData = [
        ['Metric', 'Value'],
        ['New Recruits', data.newRecruits || 0],
        ['Daily Applications', data.dailyApplications?.length || 0],
        ['Total Leads', data.totalLeads || 0],
        ['Total Application Status Types', Object.keys(data.statusCounts || {}).length],
        ['Total Lead Status Types', Object.keys(data.leadStatusCounts || {}).length]
      ];
      
      // Add application status breakdown
      Object.entries(data.statusCounts || {}).forEach(([status, count]) => {
        summaryData.push([`Application Status: ${status}`, count]);
      });
      
      // Add lead status breakdown
      Object.entries(data.leadStatusCounts || {}).forEach(([status, count]) => {
        summaryData.push([`Lead Status: ${status}`, count]);
      });
      
      // Create table
      autoTable(doc, {
        startY: yPosition,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 }
      });
    }
    
    if (type === 'agent-performance' && data.success) {
      // Agent performance report
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AGENT PERFORMANCE REPORT', 20, yPosition);
      yPosition += 15;
      
      // Team stats
      if (data.data.teamStats) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TEAM OVERVIEW', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Leads: ${data.data.teamStats.totalLeads}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Average Conversion Rate: ${data.data.teamStats.avgConversionRate}%`, 20, yPosition);
        yPosition += 7;
        doc.text(`Average Response Rate: ${data.data.teamStats.avgResponseRate}%`, 20, yPosition);
        yPosition += 15;
      }
      
      // Agent performance table
      const agentData = data.data.agents.map(agent => [
        agent.agentName,
        agent.agentEmail,
        agent.totalLeads,
        `${agent.conversionRate}%`,
        `${agent.responseRate}%`,
        agent.recentLeads
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Agent Name', 'Email', 'Total Leads', 'Conversion Rate', 'Response Rate', 'Recent Leads']],
        body: agentData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 }
      });
    }
    
    if (type === 'applications') {
      // Applications report
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('APPLICATIONS REPORT', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (Array.isArray(data)) {
        doc.text(`Total Applications: ${data.length}`, 20, yPosition);
        yPosition += 10;
        
        // Sample applications (first 10)
        const sampleData = data.slice(0, 10).map(app => [
          app._id?.toString().substring(0, 8) || 'N/A',
          app.jobTitle || 'N/A',
          app.applicantName || 'N/A',
          app.status || 'N/A',
          new Date(app.createdAt).toLocaleDateString()
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['ID', 'Job Title', 'Applicant', 'Status', 'Applied Date']],
          body: sampleData,
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        });
      } else {
        doc.text('Applications data format not recognized', 20, yPosition);
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('Generated by Ozarx HR System', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          📤 Data Export Center
        </h2>
        <p className="mt-2 text-gray-600">Export your data in various formats for analysis and reporting</p>
      </div>

      {/* Export Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Type</h3>
            <div className="space-y-3">
              {exportTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    exportType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    setDateRange({
                      startDate: lastMonth.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                >
                  Last Month
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setDateRange({
                      startDate: lastWeek.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                >
                  Last Week
                </button>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="space-y-3">
              {formats.map((fmt) => (
                <div
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    format === fmt.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{fmt.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{fmt.name}</div>
                      <div className="text-xs text-gray-600">{fmt.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={handleExport}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Exporting...
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">📤</span>
                Export Data
              </div>
            )}
          </button>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            exportStatus.includes('failed') || exportStatus.includes('error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {exportStatus}
          </div>
        )}
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Exports</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Export Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Summary Report</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">CSV</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-01 to 2024-01-31</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900">Download</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Agent Performance</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PDF</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-15 to 2024-01-31</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Processing
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-gray-400 cursor-not-allowed">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Export Tips</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>CSV format is recommended for data analysis in Excel or Google Sheets</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>PDF format is ideal for sharing reports with stakeholders</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>JSON format is best for developers and API integrations</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Large date ranges may take longer to process</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataExport;
