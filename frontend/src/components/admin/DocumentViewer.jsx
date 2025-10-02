import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DocumentViewer = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchUsersWithDocuments();
  }, []);

  const fetchUsersWithDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/admin/documents/users/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users with documents:', error);
      setMessage('Failed to fetch users with documents');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'aadharCard': return '🆔';
      case 'panCard': return '📄';
      case 'marksheet': return '📊';
      case 'certificates': return '🎓';
      case 'experienceCertificate': return '💼';
      case 'payslip': return '💰';
      case 'bankPassbook': return '🏦';
      case 'photo': return '📷';
      default: return '📁';
    }
  };

  const getDocumentLabel = (type) => {
    switch (type) {
      case 'aadharCard': return 'Aadhar Card';
      case 'panCard': return 'PAN Card';
      case 'marksheet': return 'Marksheet';
      case 'certificates': return 'Certificates';
      case 'experienceCertificate': return 'Experience Certificate';
      case 'payslip': return 'Payslip';
      case 'bankPassbook': return 'Bank Passbook';
      case 'photo': return 'Photo';
      default: return type;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadDocument = async (document) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/admin/documents/documents/download/${document.filename}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalName || document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setMessage('Failed to download document');
      setMessageType('error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h2>
        <p className="text-gray-600">View and manage candidate onboarding documents</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Candidates with Documents</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No candidates with documents found
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?._id === user._id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.onboardingCompleted ? 'completed' : 'pending')}`}>
                            {user.onboardingCompleted ? 'Completed' : 'Pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {Object.keys(user.documents || {}).filter(key => user.documents[key]?.filename).length} documents
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Documents Viewer */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedUser.onboardingCompleted ? 'completed' : 'pending')}`}>
                        {selectedUser.onboardingCompleted ? 'Onboarding Completed' : 'Onboarding Pending'}
                      </span>
                      {selectedUser.onboardingCompletedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed: {new Date(selectedUser.onboardingCompletedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Submitted Documents</h4>
                  
                  {Object.keys(selectedUser.documents || {}).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No documents submitted yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedUser.documents || {}).map(([type, document]) => (
                        document && document.filename ? (
                          <div key={type} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getDocumentIcon(type)}</span>
                                <div>
                                  <h5 className="font-medium text-gray-900">{getDocumentLabel(type)}</h5>
                                  <p className="text-sm text-gray-600">{document.originalName}</p>
                                  {document.uploadedAt && (
                                    <p className="text-xs text-gray-500">
                                      Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <button
                                  onClick={() => downloadDocument(document)}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  Download
                                </button>
                                <span className="text-xs text-gray-500">
                                  {document.size ? formatFileSize(document.size) : 'Unknown size'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={type} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl text-gray-400">{getDocumentIcon(type)}</span>
                              <div>
                                <h5 className="font-medium text-gray-500">{getDocumentLabel(type)}</h5>
                                <p className="text-sm text-gray-400">Not submitted</p>
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Candidate</h3>
                <p className="text-gray-600">Choose a candidate from the list to view their submitted documents</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
