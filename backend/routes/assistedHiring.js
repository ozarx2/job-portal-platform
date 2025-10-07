const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const AssistedHiringService = require('../models/AssistedHiringService');
const Job = require('../models/Job');
const User = require('../models/User');
const SERVICE_PACKAGES = require('../config/servicePackages');
const paymentService = require('../services/paymentService');
const razorpayService = require('../services/razorpayService');

/**
 * GET /api/assisted-hiring/config-status - Get payment configuration status
 */
router.get('/config-status', verifyToken, async (req, res) => {
  try {
    const stripeConfig = paymentService.getConfigStatus();
    const razorpayConfig = razorpayService.getConfigStatus();
    
    res.json({
      success: true,
      configStatus: {
        stripe: stripeConfig,
        razorpay: razorpayConfig,
        configured: stripeConfig.configured || razorpayConfig.configured
      },
      message: (stripeConfig.configured || razorpayConfig.configured)
        ? 'Payment service is properly configured' 
        : 'Payment service is in demo mode - Payment keys not configured'
    });
  } catch (error) {
    console.error('❌ Error checking config status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking configuration status'
    });
  }
});

/**
 * GET /api/assisted-hiring/packages - Get available service packages
 */
router.get('/packages', verifyToken, async (req, res) => {
  try {
    const stripeConfig = paymentService.getConfigStatus();
    const razorpayConfig = razorpayService.getConfigStatus();
    const isConfigured = stripeConfig.configured || razorpayConfig.configured;
    
    res.json({
      success: true,
      packages: SERVICE_PACKAGES,
      configStatus: {
        stripe: stripeConfig,
        razorpay: razorpayConfig,
        configured: isConfigured
      },
      demoMode: !isConfigured
    });
  } catch (error) {
    console.error('❌ Error fetching service packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service packages'
    });
  }
});

/**
 * POST /api/assisted-hiring/request - Request assisted hiring service
 */
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { jobId, servicePackage } = req.body;
    
    console.log('🔍 Assisted Hiring Request - Request body:', req.body);
    console.log('🔍 Assisted Hiring Request - Job ID:', jobId);
    console.log('🔍 Assisted Hiring Request - Service Package:', servicePackage);
    console.log('🔍 Assisted Hiring Request - User ID:', req.user.id);

    // Validate input
    if (!jobId || !servicePackage) {
      console.log('❌ Validation failed - missing jobId or servicePackage');
      return res.status(400).json({
        success: false,
        message: 'Job ID and service package are required'
      });
    }

    // Check if service package exists
    if (!SERVICE_PACKAGES[servicePackage]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service package'
      });
    }

    // Verify job exists and belongs to employer
    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only request services for your own jobs'
      });
    }

    // Check if service already exists for this job
    const existingService = await AssistedHiringService.findOne({
      job: jobId,
      employer: req.user.id,
      status: { $in: ['requested', 'in_progress'] }
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active service request for this job'
      });
    }

    // Create service request
    const packageInfo = SERVICE_PACKAGES[servicePackage];
    const serviceData = {
      employer: req.user.id,
      job: jobId,
      servicePackage,
      serviceName: packageInfo.name,
      description: packageInfo.description,
      price: packageInfo.price,
      features: packageInfo.features,
      deliverables: packageInfo.deliverables.map(deliverable => ({
        ...deliverable,
        status: 'pending'
      })),
      timeline: {
        startDate: new Date(),
        estimatedCompletion: new Date(Date.now() + packageInfo.timeline.estimatedDays * 24 * 60 * 60 * 1000)
      }
    };

    const assistedHiringService = new AssistedHiringService(serviceData);
    await assistedHiringService.save();

    res.status(201).json({
      success: true,
      data: assistedHiringService,
      message: 'Service request created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating service request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service request'
    });
  }
});

/**
 * POST /api/assisted-hiring/:id/payment-intent - Create payment intent
 */
router.post('/:id/payment-intent', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service
    const service = await AssistedHiringService.findById(serviceId)
      .populate('employer', 'name email')
      .populate('job', 'title company');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.employer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment is already completed
    if (service.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Create payment intent
    const paymentResult = await paymentService.createPaymentIntent(service);
    
    if (!paymentResult.success) {
      // Check if it's a configuration error
      if (paymentResult.configStatus && !paymentResult.configStatus.configured) {
        return res.status(503).json({
          success: false,
          message: 'Payment service is not configured',
          error: paymentResult.error,
          configStatus: paymentResult.configStatus,
          demoMode: true
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error creating payment intent',
        error: paymentResult.error
      });
    }

    // Update service with payment intent ID
    service.paymentId = paymentResult.paymentIntentId;
    await service.save();

    res.json({
      success: true,
      clientSecret: paymentResult.clientSecret,
      amount: service.price.amount,
      currency: service.price.currency
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
});

/**
 * POST /api/assisted-hiring/:id/confirm-payment - Confirm payment (Stripe)
 */
router.post('/:id/confirm-payment', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { paymentIntentId } = req.body;

    // Find the service
    const service = await AssistedHiringService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if we're in demo mode (no Stripe configured)
    if (!paymentService.isConfigured()) {
      // Demo mode - simulate successful payment
      console.log('🎭 Demo mode: Simulating payment confirmation');
      service.paymentStatus = 'paid';
      service.status = 'in_progress';
      service.paymentId = paymentIntentId || 'demo_payment_' + Date.now();
      await service.save();

      return res.json({
        success: true,
        message: 'Payment confirmed successfully (Demo Mode)',
        data: service,
        demoMode: true
      });
    }

    // Confirm payment with Stripe
    const paymentResult = await paymentService.confirmPayment(paymentIntentId);
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment confirmation failed',
        error: paymentResult.error
      });
    }

    // Update service status
    service.paymentStatus = 'paid';
    service.status = 'in_progress';
    service.paymentId = paymentIntentId;
    await service.save();

    // TODO: Assign to an available agent
    // For now, we'll just mark it as ready for assignment

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: service
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    });
  }
});

/**
 * POST /api/assisted-hiring/:id/create-razorpay-order - Create Razorpay order
 */
router.post('/:id/create-razorpay-order', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service
    const service = await AssistedHiringService.findById(serviceId)
      .populate('employer', 'name email')
      .populate('job', 'title company');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.employer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment is already completed
    if (service.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Create Razorpay order
    const orderResult = await razorpayService.createOrder(service);
    
    if (!orderResult.success) {
      // Check if it's a configuration error
      if (orderResult.configStatus && !orderResult.configStatus.configured) {
        return res.status(503).json({
          success: false,
          message: 'Razorpay is not configured',
          error: orderResult.error,
          configStatus: orderResult.configStatus,
          demoMode: true
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error creating Razorpay order',
        error: orderResult.error
      });
    }

    // Update service with order ID
    service.paymentId = orderResult.orderId;
    service.paymentMethod = 'razorpay';
    await service.save();

    res.json({
      success: true,
      orderId: orderResult.orderId,
      amount: service.price.amount,
      currency: service.price.currency,
      keyId: orderResult.keyId,
      receipt: orderResult.receipt
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Razorpay order'
    });
  }
});

/**
 * POST /api/assisted-hiring/:id/verify-razorpay-payment - Verify Razorpay payment
 */
router.post('/:id/verify-razorpay-payment', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { orderId, paymentId, signature } = req.body;

    // Find the service
    const service = await AssistedHiringService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if we're in demo mode (no Razorpay configured)
    if (!razorpayService.isConfigured()) {
      // Demo mode - simulate successful payment
      console.log('🎭 Demo mode: Simulating Razorpay payment verification');
      service.paymentStatus = 'paid';
      service.status = 'in_progress';
      service.paymentId = paymentId || 'demo_razorpay_payment_' + Date.now();
      service.paymentMethod = 'razorpay';
      await service.save();

      return res.json({
        success: true,
        message: 'Payment verified successfully (Demo Mode)',
        data: service,
        demoMode: true
      });
    }

    // Verify payment signature
    const isValidSignature = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPaymentDetails(paymentId);
    
    if (!paymentDetails.success || paymentDetails.payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: paymentDetails.error || 'Payment not captured'
      });
    }

    // Update service status
    service.paymentStatus = 'paid';
    service.status = 'in_progress';
    service.paymentId = paymentId;
    service.paymentMethod = 'razorpay';
    await service.save();

    // TODO: Assign to an available agent
    // For now, we'll just mark it as ready for assignment

    res.json({
      success: true,
      message: 'Payment verified and confirmed successfully',
      data: service,
      paymentDetails: paymentDetails.payment
    });

  } catch (error) {
    console.error('❌ Error verifying Razorpay payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
});

/**
 * GET /api/assisted-hiring/my-services - Get employer's services
 */
router.get('/my-services', verifyToken, async (req, res) => {
  try {
    const services = await AssistedHiringService.find({ employer: req.user.id })
      .populate('job', 'title company location')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('❌ Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

/**
 * GET /api/assisted-hiring/:id - Get specific service details
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await AssistedHiringService.findById(serviceId)
      .populate('employer', 'name email')
      .populate('job', 'title company location description')
      .populate('assignedAgent', 'name email phone')
      .populate('notes.addedBy', 'name email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user has access (employer or assigned agent)
    const hasAccess = service.employer._id.toString() === req.user.id || 
                     (service.assignedAgent && service.assignedAgent._id.toString() === req.user.id) ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error('❌ Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service'
    });
  }
});

/**
 * PUT /api/assisted-hiring/:id/update-status - Update service status (admin/agent only)
 */
router.put('/:id/update-status', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { status, notes } = req.body;

    // Check if user is admin or agent
    if (!['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and agents can update service status'
      });
    }

    const service = await AssistedHiringService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update status
    service.status = status;
    
    if (notes) {
      service.notes.push({
        text: notes,
        addedBy: req.user.id
      });
    }

    await service.save();

    res.json({
      success: true,
      message: 'Service status updated successfully',
      data: service
    });

  } catch (error) {
    console.error('❌ Error updating service status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service status'
    });
  }
});

/**
 * PUT /api/assisted-hiring/:id/cancel - Cancel service request (user can cancel their own)
 */
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { reason } = req.body;

    const service = await AssistedHiringService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own service requests'
      });
    }

    // Check if service can be cancelled
    if (service.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed service'
      });
    }

    // Cancel the service
    service.status = 'cancelled';
    service.notes.push({
      text: reason || 'Service cancelled by user',
      addedBy: req.user.id
    });
    
    await service.save();

    res.json({
      success: true,
      message: 'Service request cancelled successfully',
      data: service
    });

  } catch (error) {
    console.error('❌ Error cancelling service:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling service request'
    });
  }
});

/**
 * POST /api/assisted-hiring/:id/add-note - Add note to service
 */
router.post('/:id/add-note', verifyToken, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { note } = req.body;

    const service = await AssistedHiringService.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user has access
    const hasAccess = service.employer.toString() === req.user.id || 
                     (service.assignedAgent && service.assignedAgent.toString() === req.user.id) ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    service.notes.push({
      text: note,
      addedBy: req.user.id
    });

    await service.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: service
    });

  } catch (error) {
    console.error('❌ Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note'
    });
  }
});

/**
 * GET /api/assisted-hiring/admin/all - Get all services (admin only)
 */
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const services = await AssistedHiringService.find()
      .populate('employer', 'name email')
      .populate('job', 'title company location')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('❌ Error fetching all services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

/**
 * POST /api/assisted-hiring/webhook/razorpay - Razorpay webhook handler
 */
router.post('/webhook/razorpay', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const payload = req.body;

    // Verify webhook signature
    const verificationResult = razorpayService.verifyWebhookSignature(payload, signature);
    
    if (!verificationResult.success) {
      console.error('❌ Razorpay webhook signature verification failed:', verificationResult.error);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = verificationResult.payload;
    console.log('📨 Razorpay webhook received:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      default:
        console.log('ℹ️ Unhandled Razorpay event:', event.event);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing Razorpay webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper function to handle payment captured event
async function handlePaymentCaptured(payment) {
  try {
    console.log('💰 Payment captured:', payment.id);
    
    // Find service by payment ID or order ID
    const service = await AssistedHiringService.findOne({
      $or: [
        { paymentId: payment.id },
        { paymentId: payment.order_id }
      ]
    });

    if (service && service.paymentStatus !== 'paid') {
      service.paymentStatus = 'paid';
      service.status = 'in_progress';
      service.paymentMethod = 'razorpay';
      await service.save();
      
      console.log('✅ Service payment status updated:', service._id);
      
      // TODO: Assign to an available agent
      // TODO: Send notification to employer
    }
  } catch (error) {
    console.error('❌ Error handling payment captured:', error);
  }
}

// Helper function to handle payment failed event
async function handlePaymentFailed(payment) {
  try {
    console.log('❌ Payment failed:', payment.id);
    
    // Find service by payment ID or order ID
    const service = await AssistedHiringService.findOne({
      $or: [
        { paymentId: payment.id },
        { paymentId: payment.order_id }
      ]
    });

    if (service) {
      service.paymentStatus = 'failed';
      await service.save();
      
      console.log('❌ Service payment status updated to failed:', service._id);
      
      // TODO: Send notification to employer about payment failure
    }
  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
}

// Helper function to handle order paid event
async function handleOrderPaid(order) {
  try {
    console.log('💳 Order paid:', order.id);
    
    // Find service by order ID
    const service = await AssistedHiringService.findOne({
      paymentId: order.id
    });

    if (service && service.paymentStatus !== 'paid') {
      service.paymentStatus = 'paid';
      service.status = 'in_progress';
      service.paymentMethod = 'razorpay';
      await service.save();
      
      console.log('✅ Service order payment status updated:', service._id);
      
      // TODO: Assign to an available agent
      // TODO: Send notification to employer
    }
  } catch (error) {
    console.error('❌ Error handling order paid:', error);
  }
}

module.exports = router;
