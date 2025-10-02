import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useApp } from '../contexts/AppContext';

const AssistedHiringService = ({ job, onClose }) => {
  const { setMessage, setMessageType } = useApp();
  const [packages, setPackages] = useState({});
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select package, 2: Payment, 3: Confirmation
  const [serviceRequest, setServiceRequest] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetchServicePackages();
  }, []);

  const fetchServicePackages = async () => {
    try {
      const response = await apiService.getServicePackages();
      if (response.data.success) {
        setPackages(response.data.packages);
        setDemoMode(response.data.demoMode || false);
      }
    } catch (error) {
      console.error('Error fetching service packages:', error);
      setMessage('Failed to load service packages');
      setMessageType('error');
    }
  };

  const handlePackageSelect = async () => {
    if (!selectedPackage) {
      setMessage('Please select a service package');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.requestAssistedHiring(job._id, selectedPackage);
      if (response.data.success) {
        setServiceRequest(response.data.data);
        setStep(2);
      } else {
        setMessage(response.data.message || 'Failed to create service request');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating service request:', error);
      setMessage(error.response?.data?.message || 'Failed to create service request');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!serviceRequest) return;

    setLoading(true);
    try {
      const response = await apiService.createPaymentIntent(serviceRequest._id);
      if (response.data.success) {
        setPaymentIntent(response.data);
        setStep(3);
      } else if (response.data.demoMode) {
        // Demo mode - skip payment and go to confirmation
        setPaymentIntent({ demoMode: true });
        setStep(3);
      } else {
        setMessage(response.data.message || 'Failed to create payment intent');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setMessage('Failed to initialize payment');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setLoading(true);
    try {
      const response = await apiService.confirmPayment(serviceRequest._id, paymentIntentId);
      if (response.data.success) {
        const successMessage = response.data.demoMode 
          ? 'Demo payment successful! Your assisted hiring service has been activated. (Demo Mode)'
          : 'Payment successful! Your assisted hiring service has been activated.';
        setMessage(successMessage);
        setMessageType('success');
        onClose();
      } else {
        setMessage('Payment confirmation failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setMessage('Payment confirmation failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getPackageColor = (packageType) => {
    switch (packageType) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'premium': return 'from-purple-500 to-purple-600';
      case 'enterprise': return 'from-gold-500 to-gold-600';
      default: return 'from-gray-500 to-gray-600';
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

  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white/20">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  🎯 Assisted Hiring Services
                </h2>
                <p className="text-lg text-gray-600 mt-2">
                  Professional recruitment assistance for "{job.title}"
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(packages).map(([packageType, packageData]) => (
                <div
                  key={packageType}
                  className={`relative bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    selectedPackage === packageType
                      ? 'border-indigo-500 shadow-xl'
                      : 'border-white/30 hover:border-indigo-300'
                  }`}
                >
                  {selectedPackage === packageType && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Selected
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">{getPackageIcon(packageType)}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {packageData.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{packageData.description}</p>
                    <div className="text-4xl font-black text-gray-900">
                      {packageData.price.currency === 'INR' ? '₹' : '$'}{packageData.price.amount}
                      <span className="text-lg text-gray-500 font-normal">/service</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPackage(packageType)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      selectedPackage === packageType
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPackage === packageType ? 'Selected' : 'Select Package'}
                  </button>

                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-900">What's Included:</h4>
                    {packageData.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm text-gray-600">{feature.name}</span>
                      </div>
                    ))}
                    {packageData.features.length > 4 && (
                      <div className="text-sm text-gray-500">
                        +{packageData.features.length - 4} more features
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Estimated completion: {packageData.timeline.estimatedDays} days
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePackageSelect}
                disabled={!selectedPackage || loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Creating Request...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const packageData = packages[selectedPackage];
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                💳 Payment Details
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Complete your payment to activate the service
              </p>
              {demoMode && (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-800 font-semibold">
                    🎭 Demo Mode: Stripe keys not configured
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    This is a demonstration. No real payment will be processed.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getPackageIcon(selectedPackage)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{packageData.name}</h3>
                    <p className="text-gray-600">{job.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900">
                    {packageData.price.currency === 'INR' ? '₹' : '$'}{packageData.price.amount}
                  </div>
                  <div className="text-gray-500">One-time payment</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Features:</h4>
                  <ul className="space-y-2">
                    {packageData.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm text-gray-600">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Deliverables:</h4>
                  <ul className="space-y-2">
                    {packageData.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">📋</span>
                        <span className="text-sm text-gray-600">{deliverable.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 && paymentIntent) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">💳</div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {paymentIntent.demoMode ? 'Demo Payment' : 'Secure Payment'}
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                {paymentIntent.demoMode 
                  ? 'Complete your demo payment (No real money will be charged)'
                  : 'Complete your payment using Stripe'
                }
              </p>
              {paymentIntent.demoMode && (
                <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-blue-800 font-semibold">
                    🎭 Demo Mode Active
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    This is a demonstration. Click the button below to simulate payment completion.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 mb-6">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {paymentIntent.currency === 'INR' ? '₹' : '$'}{paymentIntent.amount} {paymentIntent.currency.toUpperCase()}
              </div>
              <div className="text-gray-600">
                {packages[selectedPackage]?.name} for "{job.title}"
              </div>
            </div>

            <div className="mb-6">
              <div id="stripe-payment-element" className="mb-4">
                {/* Stripe Payment Element will be mounted here */}
                <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
                  <div className="text-lg mb-2">🔒 Secure Payment</div>
                  <div className="text-sm">
                    Stripe payment integration would be loaded here in production
                  </div>
                  <div className="text-xs mt-2">
                    For demo purposes, payment will be simulated
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => handlePaymentSuccess('pi_demo_payment_intent_id')}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Processing Payment...' : (paymentIntent.demoMode ? 'Complete Demo Payment' : 'Complete Payment')}
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-4">
                <span>🔒 SSL Secured</span>
                <span>💳 Stripe Powered</span>
                <span>🛡️ PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AssistedHiringService;
