import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ImportLeads from "../components/ImportLeads";
import LeadsTable from "../components/LeadsTable";

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [report, setReport] = useState({});
  const [file, setFile] = useState(null);
  const [agentName, setAgentName] = useState("Agent");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://backend-ie0pgclfa-shamseers-projects-613ceea2.vercel.app/api";

  const token = localStorage.getItem("token");

  // Decode token to get agent name
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if name exists in token, if not show a message
        if (decoded.name) {
          setAgentName(decoded.name);
        } else {
          console.warn("Name not found in token. User may need to re-login.");
          setAgentName("Agent ");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        setAgentName("Agent");
      }
    }
  }, [token]);

  // Axios instance with auth headers
  const axiosAuth = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // Fetch applications
  useEffect(() => {
    if (activeTab === "view") {
      axiosAuth
        .get("/applications") // ✅ backend has /api/applications
        .then((res) => setApplications(res.data))
        .catch((err) => console.error("Error fetching applications:", err));
    }
  }, [activeTab]);

  // Fetch leads - removed since LeadsTable handles its own fetching
  const fetchLeads = async () => {
    // This function is kept for compatibility with ImportLeads component
    // The actual leads fetching is now handled by LeadsTable component
  };

  // Fetch report
  useEffect(() => {
    if (activeTab === "reports") {
      axiosAuth
        .get("/crm/agent/report/me")
        .then((res) => setReport(res.data))
        .catch((err) => console.error("Error fetching reports:", err));
    }
  }, [activeTab]);

  // Upload leads (Excel/CSV)
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosAuth.post("/crm/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Leads uploaded successfully");
      setFile(null);
      setActiveTab("crm"); // Refresh CRM tab
    } catch (err) {
      console.error("Error uploading leads:", err);
      alert("Error uploading leads");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Agent Dashboard</h1>
              <p className="text-gray-600">Manage your applications, leads, and track your performance</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {agentName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Welcome back,</p>
                  <p className="text-lg font-bold text-gray-900">{agentName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Enhanced Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "applications"
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Applications
              </div>
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "view"
                  ? "bg-green-600 text-white shadow-md transform scale-105"
                  : "text-green-700 hover:bg-green-50 hover:text-green-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Candidates
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "reports"
                  ? "bg-orange-600 text-white shadow-md transform scale-105"
                  : "text-orange-700 hover:bg-orange-50 hover:text-orange-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </div>
            </button>
            <button
              onClick={() => setActiveTab("crm")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "crm"
                  ? "bg-purple-600 text-white shadow-md transform scale-105"
                  : "text-purple-700 hover:bg-purple-50 hover:text-purple-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                CRM
              </div>
            </button>
          </div>
        </div>
       {/* CRM Tab */}
       {activeTab === "crm" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Lead Management</h2>
                <p className="text-gray-600">Import, manage, and track your leads with pagination</p>
                <p className="text-sm text-purple-600 font-medium mt-1">Agent: {agentName}</p>
              </div>
            </div>
            
            {/* Import Leads Section */}
            <div className="mb-6">
              <ImportLeads onImportSuccess={fetchLeads} />
            </div>

            {/* Leads Table with Pagination */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <LeadsTable />
            </div>
          </div>
        </div>
      )}
      {/* Applications Form */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Submit Application</h2>
                <p className="text-gray-600">Create and submit new job applications</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">Application Form Coming Soon</p>
              <p className="text-blue-600 text-sm mt-1">This section will contain the application submission form.</p>
            </div>
          </div>
        </div>
      )}

      {/* View Candidates */}
      {activeTab === "view" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Submitted Candidates</h2>
                <p className="text-gray-600">View and manage candidate applications</p>
              </div>
            </div>
            
            {applications.length > 0 ? (
              <div className="grid gap-4">
                {applications.map((app, index) => (
                  <div key={app._id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{app.candidate?.name || 'N/A'}</h3>
                            <p className="text-sm text-gray-600">{app.candidate?.phone || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">ID: {app._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Candidates Found</h3>
                <p className="text-gray-600">No candidate applications have been submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Performance Reports</h2>
                <p className="text-gray-600">Track your leads, conversions, and earnings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Leads Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Leads</p>
                    <p className="text-2xl font-bold text-blue-800">{report.totalLeads || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Shortlisted Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-yellow-800">{report.shortlisted || 0}</p>
                  </div>
                  <div className="p-2 bg-yellow-200 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Conversions Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Conversions</p>
                    <p className="text-2xl font-bold text-green-800">{report.conversions || 0}</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Calls Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Calls</p>
                    <p className="text-2xl font-bold text-purple-800">{report.calls || 0}</p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800">Total Earnings</h3>
                  <p className="text-sm text-emerald-600">Based on calls made (₹1 per call)</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-800">₹{(report.calls || 0) * 1}</p>
                  <p className="text-sm text-emerald-600">This month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      </div>
    </div>
  );
}
