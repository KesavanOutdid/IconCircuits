# Razorpay Payment Integration

## Overview
This document describes the Razorpay payment integration implemented in the IconCircuits backend for order processing.

## Configuration

### Environment Variables
Add these variables to your `.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### Dependencies
```json
{
  "razorpay": "^2.9.6"
}
```

## Implementation Details

### 1. Create Order with Razorpay Payment

**Endpoint:** `POST /api/website/orders`

**Request Body:**
```json
{
  "cartItems": [...],
  "shippingAddress": {...},
  "cartSummary": {
    "totalValue": 1000
  },
  "userProfile": {...},
  "paymentType": "razorpay"
}
```

**Process:**
1. Creates order document in database
2. Initializes Razorpay instance with credentials
3. Creates Razorpay order with:
   - Amount in paise (totalValue × 100)
   - Currency: INR
   - Receipt: Internal order ID
   - Payment capture: 1 (auto-capture)
4. Generates signature for verification
5. Updates order with Razorpay order ID

**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "orderId": "uuid-order-id",
    "razorpayOrder": {
      "id": "order_razorpay_id",
      "amount": 100000,
      "currency": "INR"
    }
  }
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/website/orders/verify-payment`

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

**Process:**
1. Finds order by razorpay_order_id
2. Generates expected signature using:
   ```javascript
   crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
     .update(razorpay_order_id + '|' + razorpay_payment_id)
     .digest('hex')
   ```
3. Compares signatures
4. Updates order with:
   - razorpayPaymentId
   - razorpaySignature
   - paymentStatus: 'completed'
   - orderStatus: 'confirmed'

**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "Payment verified successfully",
  "data": {
    "orderId": "uuid-order-id"
  }
}
```

### 3. COD (Cash on Delivery) Alternative

**Request Body:**
```json
{
  "paymentType": "cod"
}
```

For COD orders:
- paymentStatus: 'completed'
- orderStatus: 'created'
- No Razorpay integration needed

## Database Schema

### Order Document Structure
```javascript
{
  orderId: "uuid",
  userId: "user-uuid",
  userEmail: "user@example.com",
  cartItems: [...],
  shippingAddress: {...},
  cartSummary: {...},
  paymentType: "razorpay" | "cod",
  paymentStatus: "pending" | "completed",
  orderStatus: "created" | "confirmed" | "cancelled",
  razorpayOrderId: "order_xxx",
  razorpayPaymentId: "pay_xxx",
  razorpaySignature: "signature_xxx",
  razorpaySignatureGenerated: "generated_signature",
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Missing Credentials
```json
{
  "success": false,
  "message": "Razorpay credentials not configured",
  "error": "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET"
}
```

### Razorpay API Error
```json
{
  "success": false,
  "message": "Failed to create Razorpay order",
  "error": "error_message",
  "details": {
    "statusCode": 400,
    "description": "error_description"
  }
}
```

### Payment Verification Failed
```json
{
  "success": false,
  "message": "Payment verification failed"
}
```

## Frontend Integration

### Step 1: Create Order
```javascript
const response = await fetch('/api/website/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cartItems,
    shippingAddress,
    cartSummary,
    userProfile,
    paymentType: 'razorpay'
  })
});

const { data } = await response.json();
const { orderId, razorpayOrder } = data;
```

### Step 2: Open Razorpay Checkout
```javascript
const options = {
  key: 'RAZORPAY_KEY_ID',
  amount: razorpayOrder.amount,
  currency: razorpayOrder.currency,
  order_id: razorpayOrder.id,
  name: 'IconCircuits',
  handler: async function(response) {
    await verifyPayment(response);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### Step 3: Verify Payment
```javascript
async function verifyPayment(response) {
  const result = await fetch('/api/website/orders/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    })
  });
  
  const data = await result.json();
  if (data.success) {
    // Payment successful
  }
}
```

## Security Considerations

1. **Signature Verification:** Always verify Razorpay signature on the backend
2. **Environment Variables:** Never expose RAZORPAY_KEY_SECRET to frontend
3. **HTTPS:** Use HTTPS in production for secure communication
4. **Webhook Integration:** Consider implementing Razorpay webhooks for payment status updates

## File Locations

- **Controller:** `Backend/controllers/website/orderControllers.js`
- **Routes:** `Backend/routes/website/ordersRoutes.js`
- **Documentation:** `Backend/RAZORPAY_IMPLEMENTATION.md`

## Testing

### Test Credentials
Razorpay provides test credentials for development:
- Test Key ID: Available in Razorpay dashboard
- Test Key Secret: Available in Razorpay dashboard

### Test Card Details
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

## Additional Features

### Cancel Order
**Endpoint:** `POST /api/website/orders/cancel`

```json
{
  "orderId": "uuid",
  "reason": "User cancelled"
}
```

### Get Orders
**Endpoint:** `GET /api/website/orders`

Returns all orders for the authenticated user.

### Get Order by ID
**Endpoint:** `GET /api/website/orders/:orderId`

Returns specific order details.
