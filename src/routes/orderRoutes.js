const express = require('express');

const { placeOrder, getAllOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private

// Place a new order
router.post('/', protect, placeOrder);

// Get all orders (admin only)
router.get('/', protect, getAllOrders);

// Get logged-in user's order history
router.get('/my', protect, getMyOrders);
// Update order status (admin only)
router.put('/update/:id/status', protect,updateOrderStatus);

module.exports = router;
