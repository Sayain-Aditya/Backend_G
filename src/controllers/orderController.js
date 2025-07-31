const Order = require('../models/order');
const User = require('../models/user');
const { sendInvoiceEmail } = require('../services/emailService');

exports.getAllOrders = async (req, res) => {
  try {
    // Only allow admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your orders', error: error.message });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;

    if (!address || !address.fullName || !address.street || !address.city) {
      return res.status(400).json({ message: "Incomplete address details." });
    }

    const order = new Order({
      user: req.user.id,
      items,
      total,
      address,
      paymentMethod: paymentMethod || 'COD',
    });

    const savedOrder = await order.save();
    
    // Populate order with product details for email
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.product', 'name price')
      .populate('user', 'email');
    
    // Send invoice email
    console.log('Order saved, attempting to send email...');
    console.log('User email:', populatedOrder.user?.email);
    
    if (populatedOrder.user?.email) {
      try {
        await sendInvoiceEmail(populatedOrder, populatedOrder.user.email);
        console.log('Email service called successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    } else {
      console.log('No user email found, skipping email');
    }
    
    res.status(201).json({ message: "Order placed", order: savedOrder });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    await order.save();

    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
