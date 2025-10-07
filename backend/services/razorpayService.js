const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found in environment variables');
    console.warn('📝 Please add your Razorpay keys to the .env file');
    console.warn('🔗 Get your keys from: https://dashboard.razorpay.com/app/keys');
  }
  
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
  });
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
  razorpay = null;
}

class RazorpayService {
  /**
   * Check if Razorpay is properly configured
   */
  isConfigured() {
    return razorpay !== null && 
           process.env.RAZORPAY_KEY_ID && 
           process.env.RAZORPAY_KEY_SECRET &&
           process.env.RAZORPAY_KEY_ID !== 'rzp_test_demo_key' &&
           process.env.RAZORPAY_KEY_SECRET !== 'demo_secret';
  }

  /**
   * Get configuration status
   */
  getConfigStatus() {
    return {
      configured: this.isConfigured(),
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      hasWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
      razorpayInitialized: razorpay !== null
    };
  }

  /**
   * Create a Razorpay order for assisted hiring service
   */
  async createOrder(serviceData) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Razorpay is not properly configured. Please check your environment variables.',
          configStatus: this.getConfigStatus()
        };
      }

      const orderOptions = {
        amount: serviceData.price.amount * 100, // Convert to paise
        currency: serviceData.price.currency,
        receipt: `assisted_hiring_${serviceData._id}`,
        notes: {
          serviceId: serviceData._id.toString(),
          employerId: serviceData.employer.toString(),
          jobId: serviceData.job.toString(),
          servicePackage: serviceData.servicePackage,
          serviceName: serviceData.serviceName
        }
      };

      const order = await razorpay.orders.create(orderOptions);

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  async getPaymentDetails(paymentId) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Razorpay is not properly configured'
        };
      }

      const payment = await razorpay.payments.fetch(paymentId);
      
      return {
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          order_id: payment.order_id,
          created_at: payment.created_at
        }
      };
    } catch (error) {
      console.error('❌ Error fetching payment details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentId, amount = null) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Razorpay is not properly configured'
        };
      }

      const refundOptions = {
        amount: amount ? amount * 100 : undefined // Convert to paise if amount specified
      };

      const refund = await razorpay.payments.refund(paymentId, refundOptions);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      };
    } catch (error) {
      console.error('❌ Error creating refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not configured');
        return { success: false, error: 'Webhook secret not configured' };
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");

      if (signature === expectedSignature) {
        return {
          success: true,
          payload: JSON.parse(payload)
        };
      } else {
        return {
          success: false,
          error: 'Invalid webhook signature'
        };
      }
    } catch (error) {
      console.error('❌ Error verifying webhook signature:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a customer for future payments
   */
  async createCustomer(customerData) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Razorpay is not properly configured'
        };
      }

      const customer = await razorpay.customers.create({
        name: customerData.name,
        email: customerData.email,
        contact: customerData.phone,
        notes: {
          userId: customerData.userId,
          role: customerData.role
        }
      });

      return {
        success: true,
        customerId: customer.id
      };
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Razorpay is not properly configured'
        };
      }

      const order = await razorpay.orders.fetch(orderId);
      
      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          receipt: order.receipt,
          notes: order.notes,
          created_at: order.created_at
        }
      };
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all payments for an order
   */
  async getOrderPayments(orderId) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Razorpay is not properly configured'
        };
      }

      const payments = await razorpay.orders.fetchPayments(orderId);
      
      return {
        success: true,
        payments: payments.items.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          created_at: payment.created_at
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching order payments:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new RazorpayService();
