import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useApp } from '../contexts/AppContext';

const AssistedHiringServices = () => {
  const { setMessage, setMessageType } = useApp();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiService.getMyServices();
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setMessage('Failed to load services');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPackageIcon = (packageType) => {
    switch (packageType) {
      case 'basic': return '🛠️';
      case 'premium': return '⭐';
      case 'enterprise': return '👑';
      default: return '📦';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = async (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No Assisted Hiring Services Yet
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't requested any assisted hiring services yet. 
            Click the "Assisted Hiring" button on any of your job postings to get started.
          </p>
          <div className="text-sm text-gray-500">
            Our professional recruitment team can help you find the perfect candidates faster.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          🎯 My Assisted Hiring Services
        </h3>
        <div className="text-sm text-gray-500">
          {services.length} service{services.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{getPackageIcon(service.servicePackage)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      {service.serviceName}
                    </h4>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(service.status)}`}>
                      {service.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusColor(service.paymentStatus)}`}>
                      {service.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 mb-2">
                    For: <span className="font-semibold">{service.job?.title}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    Created: {formatDate(service.createdAt)}
                    {service.assignedAgent && (
                      <span className="ml-4">
                        Agent: <span className="font-semibold">{service.assignedAgent.name}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500">💰</span>
                      <span className="font-semibold">${service.price.amount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-500">📅</span>
                      <span>Est. {formatDate(service.timeline?.estimatedCompletion)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-purple-500">📋</span>
                      <span>{service.deliverables?.length || 0} deliverables</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(service)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {service.deliverables?.filter(d => d.status === 'completed').length || 0} / {service.deliverables?.length || 0} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((service.deliverables?.filter(d => d.status === 'completed').length || 0) / (service.deliverables?.length || 1)) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Details Modal */}
      {showDetails && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedService.serviceName}
                  </h3>
                  <p className="text-gray-600">For: {selectedService.job?.title}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Service Information */}
                <div className="space-y-6">
                  <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Service Details</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Package:</span>
                        <div className="font-semibold">{selectedService.serviceName}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Price:</span>
                        <div className="font-semibold">${selectedService.price.amount} {selectedService.price.currency}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <div className="font-semibold">{selectedService.status}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Payment:</span>
                        <div className="font-semibold">{selectedService.paymentStatus}</div>
                      </div>
                      {selectedService.assignedAgent && (
                        <div>
                          <span className="text-sm text-gray-500">Assigned Agent:</span>
                          <div className="font-semibold">{selectedService.assignedAgent.name}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Timeline</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Start Date:</span>
                        <div className="font-semibold">{formatDate(selectedService.timeline?.startDate)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Estimated Completion:</span>
                        <div className="font-semibold">{formatDate(selectedService.timeline?.estimatedCompletion)}</div>
                      </div>
                      {selectedService.timeline?.actualCompletion && (
                        <div>
                          <span className="text-sm text-gray-500">Actual Completion:</span>
                          <div className="font-semibold">{formatDate(selectedService.timeline.actualCompletion)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="space-y-6">
                  <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Deliverables</h4>
                    <div className="space-y-3">
                      {selectedService.deliverables?.map((deliverable, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-4 h-4 rounded-full mt-1 ${
                            deliverable.status === 'completed' ? 'bg-green-500' :
                            deliverable.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{deliverable.name}</div>
                            <div className="text-sm text-gray-600">{deliverable.description}</div>
                            {deliverable.dueDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                Due: {formatDate(deliverable.dueDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Notes */}
                  {selectedService.notes && selectedService.notes.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Recent Updates</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {selectedService.notes.slice(-3).map((note, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-gray-600">{note.text}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(note.addedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistedHiringServices;


