const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, async (req, res) => {
  try {
    const query = req.user.role === 'client' ? { client: req.user._id } : { freelancer: req.user._id };
    const transactions = await Payment.find(query)
      .populate('project', 'title')
      .sort('-createdAt');
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', notes } = req.body;
    
    const Razorpay = require('razorpay');
    const instance = new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET 
    });
    
    const order = await instance.orders.create({ 
      amount, 
      currency, 
      notes 
    });
    
    res.json({
      ...order,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, description } = req.body;
    
    // Real validation checking signature using crypto
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed (signature mismatch)' });
    }
    
    const platformFee = amount * 0.02; // 2% platform fee
    const netAmount = amount - platformFee;
    
    const payment = await Payment.create({
      client: req.user._id,
      amount,
      platformFee,
      netAmount,
      type: 'escrow_fund',
      status: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      description
    });
    
    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalSpent = (user.totalSpent || 0) + amount;
    await user.save();
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
