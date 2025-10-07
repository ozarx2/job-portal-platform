// Initialize Stripe with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables');
    console.warn('📝 Please add your Stripe secret key to the .env file');
    console.warn('🔗 Get your keys from: https://dashboard.stripe.com/test/apikeys');
  }
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
  stripe = null;
}

class PaymentService {
  /**
   * Check if Stripe is properly configured
   */
  isConfigured() {
    return stripe !== null && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_demo_key';
  }

  /**
   * Get configuration status
   */
  getConfigStatus() {
    return {
      configured: this.isConfigured(),
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeInitialized: stripe !== null
    };
  }

  /**
   * Create a payment intent for assisted hiring service
   */
  async createPaymentIntent(serviceData) {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Stripe is not properly configured. Please check your environment variables.',
          configStatus: this.getConfigStatus()
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: serviceData.price.amount * 100, // Convert to cents
        currency: serviceData.price.currency.toLowerCase(),
        metadata: {
          serviceId: serviceData._id,
          employerId: serviceData.employer,
          jobId: serviceData.job,
          servicePackage: serviceData.servicePackage
        },
        description: `Assisted Hiring Service - ${serviceData.serviceName}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm payment and update service status
   */
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          status: 'paid',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        };
      } else {
        return {
          success: false,
          status: paymentIntent.status,
          error: 'Payment not completed'
        };
      }
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? amount * 100 : undefined // If no amount specified, full refund
      });

      return {
        success: true,
        refundId: refund.id,
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
   * Get payment method details
   */
  async getPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      console.error('❌ Error retrieving payment method:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a customer for recurring payments (future use)
   */
  async createCustomer(customerData) {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: {
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
   * Validate webhook signature (for production)
   */
  validateWebhookSignature(payload, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return {
        success: true,
        event
      };
    } catch (error) {
      console.error('❌ Webhook signature validation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();
