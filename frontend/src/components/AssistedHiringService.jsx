import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useApp } from '../contexts/AppContext';

const AssistedHiringService = ({ job, onClose }) => {
  const { setMessage, setMessageType } = useApp();
  const [packages, setPackages] = useState({});
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [step, setStep] = useState(1); // 1: Select package, 2: Payment, 3: Confirmation
  const [serviceRequest, setServiceRequest] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'razorpay'
  const [demoMode, setDemoMode] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'

  useEffect(() => {
    fetchServicePackages();
  }, []);

  const fetchServicePackages = async () => {
    setLoadingPackages(true);
    setServerStatus('checking');
    try {
      console.log('🔄 Fetching service packages...');
      const response = await apiService.getServicePackages();
      console.log('📦 Service packages response:', response.data);
      
      if (response.data.success) {
        setPackages(response.data.packages);
        setDemoMode(response.data.demoMode || false);
        setServerStatus('online');
        console.log('✅ Packages loaded successfully:', Object.keys(response.data.packages));
      } else {
        console.error('❌ Failed to load packages:', response.data);
        setMessage('Failed to load service packages');
        setMessageType('error');
        setServerStatus('offline');
      }
    } catch (error) {
      console.error('❌ Error fetching service packages:', error);
      setServerStatus('offline');
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setMessage('Server is not responding. Please check if the backend server is running.');
      } else {
        setMessage('Failed to load service packages');
      }
      setMessageType('error');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handlePackageSelect = async () => {
    console.log('🚀 handlePackageSelect called, selectedPackage:', selectedPackage);
    console.log('🔍 Job object:', job);
    console.log('🔍 Job ID:', job?._id);
    
    if (!selectedPackage) {
      console.log('❌ No package selected');
      setMessage('Please select a service package');
      setMessageType('error');
      return;
    }

    if (!job?._id) {
      console.log('❌ No job ID available');
      setMessage('Job information is missing');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Creating service request for job:', job._id, 'package:', selectedPackage);
      const response = await apiService.requestAssistedHiring(job._id, selectedPackage);
      console.log('📦 Service request response:', response.data);
      
      if (response.data.success) {
        setServiceRequest(response.data.data);
        setStep(2);
        console.log('✅ Moving to step 2 (payment)');
      } else {
        console.log('❌ Service request failed:', response.data.message);
        setMessage(response.data.message || 'Failed to create service request');
        setMessageType('error');
      }
    } catch (error) {
      console.error('❌ Error creating service request:', error);
      
      // Handle different types of errors gracefully
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setMessage('Server is not responding. Please check if the backend server is running.');
        setMessageType('error');
      } else if (error.response?.status === 0 || !error.response) {
        setMessage('Cannot connect to server. Please ensure the backend server is running on port 5000.');
        setMessageType('error');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('already have an active service request')) {
        setMessage('You already have an active service request for this job. Please select a different job or wait for the current request to complete.');
        setMessageType('warning');
      } else {
        setMessage(error.response?.data?.message || 'Failed to create service request');
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!serviceRequest) return;

    setLoading(true);
    try {
      if (paymentMethod === 'razorpay') {
        // Handle Razorpay payment
        const response = await apiService.createRazorpayOrder(serviceRequest._id);
        if (response.data.success) {
          setRazorpayOrder(response.data);
          setStep(3);
        } else if (response.data.demoMode) {
          // Demo mode - skip payment and go to confirmation
          setRazorpayOrder({ demoMode: true, amount: serviceRequest.price.amount, currency: serviceRequest.price.currency });
          setStep(3);
        } else {
          setMessage(response.data.message || 'Failed to create Razorpay order');
          setMessageType('error');
        }
      } else {
        // Handle Stripe payment
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
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      
      // Handle different types of errors gracefully
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setMessage('Server is not responding. Please check if the backend server is running.');
        setMessageType('error');
      } else if (error.response?.status === 0 || !error.response) {
        setMessage('Cannot connect to server. Please ensure the backend server is running on port 5000.');
        setMessageType('error');
      } else if (error.response?.status === 503 && error.response?.data?.demoMode) {
        // Demo mode - proceed with demo payment
        console.log('🎭 Demo mode detected - proceeding with demo payment');
        if (paymentMethod === 'razorpay') {
          setRazorpayOrder({ demoMode: true, amount: serviceRequest.price.amount, currency: serviceRequest.price.currency });
        } else {
          setPaymentIntent({ demoMode: true });
        }
        setStep(3);
      } else {
        setMessage('Failed to initialize payment');
        setMessageType('error');
      }
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

  const handleRazorpayPaymentSuccess = async (paymentId, orderId, signature) => {
    setLoading(true);
    try {
      const response = await apiService.verifyRazorpayPayment(serviceRequest._id, orderId, paymentId, signature);
      if (response.data.success) {
        const successMessage = response.data.demoMode 
          ? 'Demo Razorpay payment successful! Your assisted hiring service has been activated. (Demo Mode)'
          : 'Razorpay payment successful! Your assisted hiring service has been activated.';
        setMessage(successMessage);
        setMessageType('success');
        onClose();
      } else {
        setMessage('Razorpay payment verification failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      setMessage('Payment verification failed');
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
                {/* Server Status Indicator */}
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${
                    serverStatus === 'online' ? 'bg-green-500' : 
                    serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className={`text-sm ${
                    serverStatus === 'online' ? 'text-green-600' : 
                    serverStatus === 'offline' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {serverStatus === 'online' ? 'Server Online' : 
                     serverStatus === 'offline' ? 'Server Offline' : 'Checking Server...'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingPackages ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading service packages...</p>
              </div>
            ) : Object.keys(packages).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Packages Available</h3>
                <p className="text-gray-600 mb-4">
                  {serverStatus === 'offline' 
                    ? 'Server is offline. Please ensure the backend server is running.' 
                    : 'Unable to load service packages. Please try again.'}
                </p>
                {serverStatus === 'offline' && (
                  <button
                    onClick={fetchServicePackages}
                    className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    🔄 Retry Connection
                  </button>
                )}
              </div>
            ) : (
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
                    onClick={() => {
                      console.log('🎯 Package selected:', packageType);
                      setSelectedPackage(packageType);
                    }}
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
            )}

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
                    🎭 Demo Mode: Payment keys not configured
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    This is a demonstration. No real payment will be processed.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === 'stripe'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💳</div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Stripe</div>
                      <div className="text-sm text-gray-600">International payments</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === 'razorpay'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏦</div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Razorpay</div>
                      <div className="text-sm text-gray-600">Indian payments</div>
                    </div>
                  </div>
                </button>
              </div>
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
                {loading ? 'Processing...' : `Proceed with ${paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'} Payment`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 && (paymentIntent || razorpayOrder)) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">💳</div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {(paymentIntent?.demoMode || razorpayOrder?.demoMode) ? 'Demo Payment' : 'Secure Payment'}
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                {(paymentIntent?.demoMode || razorpayOrder?.demoMode)
                  ? 'Complete your demo payment (No real money will be charged)'
                  : `Complete your payment using ${paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}`
                }
              </p>
              {(paymentIntent?.demoMode || razorpayOrder?.demoMode) && (
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
                {(paymentIntent?.currency || razorpayOrder?.currency || serviceRequest?.price?.currency) === 'INR' ? '₹' : '$'}
                {paymentIntent?.amount || razorpayOrder?.amount || serviceRequest?.price?.amount} 
                {(paymentIntent?.currency || razorpayOrder?.currency || serviceRequest?.price?.currency || 'USD').toUpperCase()}
              </div>
              <div className="text-gray-600">
                {packages[selectedPackage]?.name} for "{job.title}"
              </div>
            </div>

            <div className="mb-6">
              <div id="payment-element" className="mb-4">
                {/* Payment Element will be mounted here */}
                <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
                  <div className="text-lg mb-2">🔒 Secure Payment</div>
                  <div className="text-sm">
                    {paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'} payment integration would be loaded here in production
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
                onClick={() => {
                  if (paymentMethod === 'razorpay') {
                    handleRazorpayPaymentSuccess('razorpay_demo_payment_id', razorpayOrder?.orderId || 'demo_order_id', 'demo_signature');
                  } else {
                    handlePaymentSuccess('pi_demo_payment_intent_id');
                  }
                }}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Processing Payment...' : ((paymentIntent?.demoMode || razorpayOrder?.demoMode) ? 'Complete Demo Payment' : 'Complete Payment')}
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-4">
                <span>🔒 SSL Secured</span>
                <span>{paymentMethod === 'razorpay' ? '🏦 Razorpay Powered' : '💳 Stripe Powered'}</span>
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
