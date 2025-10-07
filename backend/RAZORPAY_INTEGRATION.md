# Razorpay Integration for Assisted Hiring

This document describes the Razorpay payment integration for the assisted hiring service.

## Overview

The system now supports both Stripe and Razorpay payment methods for assisted hiring services. Users can choose between the two payment gateways when making payments for recruitment services.

## Features

- ✅ **Dual Payment Support**: Both Stripe and Razorpay integration
- ✅ **Order Creation**: Create Razorpay orders for assisted hiring services
- ✅ **Payment Verification**: Server-side payment signature verification
- ✅ **Webhook Support**: Automatic payment status updates via webhooks
- ✅ **Demo Mode**: Works without configuration for testing
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Security**: Payment signature verification and webhook validation

## API Endpoints

### 1. Configuration Status
```
GET /api/assisted-hiring/config-status
```
Returns the configuration status for both Stripe and Razorpay.

### 2. Service Packages
```
GET /api/assisted-hiring/packages
```
Returns available service packages with payment configuration status.

### 3. Create Razorpay Order
```
POST /api/assisted-hiring/:id/create-razorpay-order
```
Creates a Razorpay order for the specified service.

**Response:**
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 999,
  "currency": "INR",
  "keyId": "rzp_test_xyz",
  "receipt": "assisted_hiring_123"
}
```

### 4. Verify Razorpay Payment
```
POST /api/assisted-hiring/:id/verify-razorpay-payment
```
Verifies the payment signature and updates service status.

**Request Body:**
```json
{
  "orderId": "order_xyz123",
  "paymentId": "pay_xyz123",
  "signature": "signature_hash"
}
```

### 5. Razorpay Webhook
```
POST /api/assisted-hiring/webhook/razorpay
```
Handles Razorpay webhook events for automatic payment status updates.

**Supported Events:**
- `payment.captured`
- `payment.failed`
- `order.paid`

## Environment Configuration

Add the following variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Service Packages

The system supports three service packages with INR pricing:

### Basic Package - ₹999
- Job posting optimization
- Initial candidate screening (up to 50 candidates)
- Interview scheduling
- Basic background checks
- Email support
- 7-day timeline

### Premium Package - ₹2,299
- Advanced job posting
- Comprehensive candidate screening (up to 100 candidates)
- Video interview coordination
- Advanced background checks
- Priority support
- Market analysis
- 14-day timeline

### Enterprise Package - ₹4,499
- Executive job posting
- Executive search (up to 200 candidates)
- Multi-round interview coordination
- Executive background checks
- Dedicated recruitment manager
- Talent pipeline development
- Negotiation support
- Onboarding support
- 21-day timeline

## Frontend Integration

### 1. Create Razorpay Order
```javascript
const response = await apiService.post(`/assisted-hiring/${serviceId}/create-razorpay-order`);
const { orderId, amount, currency, keyId } = response.data;
```

### 2. Initialize Razorpay Checkout
```javascript
const options = {
  key: keyId,
  amount: amount * 100, // Convert to paise
  currency: currency,
  name: "Ozarx HR",
  description: "Assisted Hiring Service",
  order_id: orderId,
  handler: async function (response) {
    // Handle successful payment
    await verifyPayment(response);
  },
  prefill: {
    name: user.name,
    email: user.email,
    contact: user.phone
  },
  theme: {
    color: "#3399cc"
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

### 3. Verify Payment
```javascript
const verifyPayment = async (response) => {
  const verificationData = {
    orderId: response.razorpay_order_id,
    paymentId: response.razorpay_payment_id,
    signature: response.razorpay_signature
  };
  
  const result = await apiService.post(
    `/assisted-hiring/${serviceId}/verify-razorpay-payment`,
    verificationData
  );
  
  if (result.data.success) {
    // Payment verified successfully
    console.log('Payment verified:', result.data.message);
  }
};
```

## Webhook Setup

1. **Login to Razorpay Dashboard**
2. **Go to Settings > Webhooks**
3. **Create New Webhook**
4. **Set URL**: `https://yourdomain.com/api/assisted-hiring/webhook/razorpay`
5. **Select Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
6. **Copy Webhook Secret** to your `.env` file

## Testing

### Demo Mode
The system works in demo mode without Razorpay configuration:
- Orders are created with demo data
- Payment verification simulates success
- All functionality works for testing

### Production Testing
1. Use Razorpay test keys
2. Test with small amounts
3. Verify webhook events
4. Check payment status updates

## Security Features

1. **Signature Verification**: All payments are verified using Razorpay signatures
2. **Webhook Validation**: Webhook signatures are validated before processing
3. **Order Validation**: Orders are validated against service data
4. **User Authorization**: Only service owners can create/verify payments
5. **Idempotency**: Duplicate payments are prevented

## Error Handling

The system handles various error scenarios:
- Invalid payment signatures
- Failed payments
- Webhook verification failures
- Missing configuration
- Network timeouts
- Duplicate payments

## Monitoring

Monitor the following for production:
- Payment success rates
- Webhook delivery status
- Failed payment attempts
- Service status updates
- Error logs

## Support

For issues with Razorpay integration:
1. Check Razorpay dashboard for payment status
2. Verify webhook delivery
3. Check server logs for errors
4. Validate configuration settings

## Migration from Stripe

The system supports both payment methods:
- Existing Stripe integrations continue to work
- New services can use either payment method
- Configuration status shows both providers
- Demo mode works for both when not configured
