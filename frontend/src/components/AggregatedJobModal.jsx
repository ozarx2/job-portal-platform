import React from 'react';
import { X, ExternalLink, Building2, MapPin, DollarSign, Clock, Globe } from 'lucide-react';

const AggregatedJobModal = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getSourceColor = (source) => {
    const colors = {
      indeed: 'bg-blue-100 text-blue-800',
      linkedin: 'bg-blue-100 text-blue-800',
      glassdoor: 'bg-green-100 text-green-800',
      naukri: 'bg-orange-100 text-orange-800',
      monster: 'bg-purple-100 text-purple-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source) => {
    const icons = {
      indeed: '🔍',
      linkedin: '💼',
      glassdoor: '🏢',
      naukri: '🇮🇳',
      monster: '👹'
    };
    return icons[source] || '🌐';
  };

  const handleApplyClick = () => {
    if (job.sourceUrl) {
      // Open the original job posting in a new tab
      window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      // If no URL, show a message about applying on the source site
      alert(`To apply for this position, please visit ${job.source.toUpperCase()} and search for "${job.title}" at ${job.company}`);
    }
  };

  const getSearchUrl = (source, searchTerm, location) => {
    const encodedSearch = encodeURIComponent(searchTerm);
    const encodedLocation = encodeURIComponent(location || '');
    
    switch (source) {
      case 'indeed':
        return `https://www.indeed.com/jobs?q=${encodedSearch}&l=${encodedLocation}`;
      case 'linkedin':
        return `https://www.linkedin.com/jobs/search/?keywords=${encodedSearch}&location=${encodedLocation}`;
      case 'glassdoor':
        return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedSearch}&locT=C&locId=${encodedLocation}`;
      case 'naukri':
        return `https://www.naukri.com/${encodedSearch}-jobs-in-${encodedLocation}`;
      case 'monster':
        return `https://www.monster.com/jobs/search/?q=${encodedSearch}&where=${encodedLocation}`;
      default:
        return `https://www.google.com/search?q=${encodedSearch}+jobs+${encodedLocation}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(job.source)}`}>
              {getSourceIcon(job.source)} {job.source.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">External Job</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Job Title and Company */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center text-xl text-gray-700 mb-4">
              <Building2 className="w-5 h-5 mr-2" />
              {job.company}
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>

              {job.salary && (
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-green-600">{job.salary}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="font-medium">{formatDate(job.postedDate)}</p>
                </div>
              </div>

              {job.jobType && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium">{job.jobType}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to Apply</h3>
              <p className="text-blue-800 text-sm mb-3">
                This job is posted on {job.source.toUpperCase()}. Click the button below to search for similar positions on their platform.
              </p>
              <button
                onClick={() => {
                  const searchUrl = getSearchUrl(job.source, job.title, job.location);
                  window.open(searchUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Search on {job.source.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Job Description */}
          {job.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Important Note</h4>
            <p className="text-gray-700 text-sm">
              This job posting is aggregated from {job.source.toUpperCase()}. You will be redirected to their platform to complete your application. 
              Make sure you have an account on {job.source.toUpperCase()} before applying.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Job aggregated from <span className="font-medium">{job.source.toUpperCase()}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                const searchUrl = getSearchUrl(job.source, job.title, job.location);
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Search on {job.source.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AggregatedJobModal;
