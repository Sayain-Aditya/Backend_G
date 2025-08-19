const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getRecipeSuggestions
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get the user's cart
router.get('/get', protect, getCart);
// Route to add an item to the cart
router.post('/add', protect, addToCart);
// Route to update an item in the cart
router.put('/update/:itemId', protect, updateCartItem);
// Route to remove an item from the cart
router.delete('/remove/:itemId', protect, removeFromCart);
// Route to clear the entire cart
router.delete('/clear', protect, clearCart);
// Route to get recipe suggestions based on cart items
router.get('/recipes', protect, getRecipeSuggestions);

module.exports = router;