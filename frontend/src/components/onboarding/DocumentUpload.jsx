import React, { useState } from 'react';
import OnboardingService from '../../services/onboardingService';

const DocumentUpload = ({ onboardingId, requiredDocuments, onSubmit }) => {
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (documentType, file) => {
    setFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(files).length === 0) {
      setError('Please select at least one document to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const documentArray = Object.entries(files).map(([type, file]) => file);
      const response = await OnboardingService.uploadDocuments(onboardingId, documentArray, 'onboarding');
      
      setSuccess('Documents uploaded successfully!');
      setFiles({});
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      setError(error.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Required Documents</h3>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {requiredDocuments.map((docType, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {docType}
            </label>
            
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(docType, e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
              />
              
              {files[docType] && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{getFileIcon(files[docType].name)}</span>
                  <span>{files[docType].name}</span>
                  <span className="text-gray-400">
                    ({(files[docType].size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Ensure documents are clear and readable</li>
            <li>• All fields are required</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={uploading || Object.keys(files).length === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              uploading || Object.keys(files).length === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;












