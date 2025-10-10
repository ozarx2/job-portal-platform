import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OnboardingDashboard = ({ userId }) => {
  const [onboardingData, setOnboardingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('documentVerification');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    if (userId) {
      fetchOnboardingData();
    }
  }, [userId]);

  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const response = await axios.get(`${API_BASE_URL}/onboarding/candidate/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOnboardingData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      
      if (error.response?.status === 404) {
        setOnboardingData([]);
        setError('No onboarding process has been started yet. Contact HR to begin your onboarding.');
      } else {
        setError('Failed to load onboarding data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (documentType, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleDocumentUpload = async (onboardingId, documentType) => {
    const file = selectedFiles[documentType];
    if (!file) return;

    try {
      setUploadingFiles(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ozarx.in/api';
      
      const formData = new FormData();
      formData.append('documents', file);
      formData.append('documentType', documentType);

      await axios.post(`${API_BASE_URL}/onboarding/${onboardingId}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh onboarding data
      await fetchOnboardingData();
      
      // Clear selected file
      setSelectedFiles(prev => ({
        ...prev,
        [documentType]: null
      }));

    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'rejected':
      case 'failed':
        return '❌';
      default:
        return '⏸️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading onboarding data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (onboardingData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No Active Onboarding</div>
        <p className="text-gray-400">
          You don't have any active onboarding processes. Once you're selected for a position, 
          your onboarding process will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onboardingData.map((onboarding, index) => (
        <div key={onboarding._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {onboarding.jobId?.title} at {onboarding.companyId?.name}
              </h3>
              <p className="text-sm text-gray-600">
                Started: {new Date(onboarding.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(onboarding.status)}`}>
              {onboarding.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Step Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {Object.entries(onboarding.steps).map(([stepName, stepData]) => (
              <button
                key={stepName}
                onClick={() => setCurrentStep(stepName)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentStep === stepName
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{getStepStatusIcon(stepData.status)}</span>
                  <span className="hidden sm:block">
                    {stepName.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Current Step Content */}
          {currentStep === 'documentVerification' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Document Collection</h4>
                <p className="text-blue-800 text-sm">
                  Please upload the required documents to complete your verification process. 
                  All documents should be clear and readable. Documents marked as "(if any)" are optional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onboarding.steps.documentVerification?.requiredDocuments?.map((document, docIndex) => {
                  const submittedDoc = onboarding.steps.documentVerification?.submittedDocuments?.find(
                    doc => doc.type === document || doc.originalName?.toLowerCase().includes(document.toLowerCase().split(' ')[0])
                  );
                  const isSubmitted = !!submittedDoc;
                  
                  return (
                    <div key={docIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{document}</h5>
                        <span className="text-sm text-gray-500">
                          {isSubmitted ? '✅ Uploaded' : '⏳ Pending'}
                        </span>
                      </div>
                      
                      {isSubmitted && (
                        <div className="mb-3 p-2 bg-green-50 rounded-md">
                          <p className="text-sm text-green-700">
                            <strong>Uploaded:</strong> {submittedDoc.originalName}
                          </p>
                          <p className="text-xs text-green-600">
                            Uploaded on: {new Date(submittedDoc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
                            alert('File size must be less than 10MB');
                            return;
                          }
                          handleFileSelect(document, file);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500">
                        Accepted formats: PDF, JPG, PNG, DOC, DOCX • Max size: 10MB
                      </p>
                      
                      {selectedFiles[document] && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Selected: {selectedFiles[document].name}
                          </span>
                          <button
                            onClick={() => handleDocumentUpload(onboarding._id, document)}
                            disabled={uploadingFiles}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {uploadingFiles ? 'Uploading...' : 'Upload Document'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-2">📝 Document Requirements</h5>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• <strong>Aadhar Card:</strong> Clear front and back scan</li>
                  <li>• <strong>PAN Card:</strong> Clear scan of the card</li>
                  <li>• <strong>Marksheet:</strong> All academic marksheets</li>
                  <li>• <strong>Certificates:</strong> Degree/diploma certificates</li>
                  <li>• <strong>Experience Certificate:</strong> From previous employers (if applicable)</li>
                  <li>• <strong>Payslip:</strong> Recent payslips (if applicable)</li>
                  <li>• <strong>Bank Passbook:</strong> First page with account details</li>
                  <li>• <strong>Photo:</strong> Recent passport-size photograph</li>
                  <li>• <strong>Accepted formats:</strong> PDF, JPG, PNG, DOC, DOCX</li>
                  <li>• <strong>Maximum file size:</strong> 10MB per document</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 'backgroundCheck' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">🔍 Background Verification</h4>
                <p className="text-yellow-800 text-sm">
                  This step is handled by our HR team. You will be contacted if additional information is required.
                </p>
                <div className="mt-2 text-sm text-yellow-700">
                  Status: <span className="font-medium">{onboarding.steps.backgroundCheck?.status || 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'hrPaperwork' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">📄 HR Paperwork</h4>
                <p className="text-purple-800 text-sm">
                  Complete the required HR documents. These will be provided by your HR representative.
                </p>
                <div className="mt-3 space-y-2">
                  {onboarding.steps.hrPaperwork?.documents?.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-purple-700">• {doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">Need Help?</h6>
            <div className="text-sm text-gray-600">
              <p>Assigned HR: {onboarding.assignedHR?.name || 'TBA'}</p>
              <p>Manager: {onboarding.assignedManager?.name || 'TBA'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnboardingDashboard;
