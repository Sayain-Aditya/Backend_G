const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductByBarcode
} = require('../controllers/productController');

const router = express.Router();

// Public routes
router.get('/get', getProducts);
router.get('/search', require('../controllers/productController').searchProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProductById);

// Protected routes
router.post('/add', protect, addProduct);
router.put('/update/:id', protect, updateProduct);
router.delete('/delete/:id', protect, deleteProduct);

module.exports = router;