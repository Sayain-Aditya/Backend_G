const express = require('express');
const { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts } = require('../controllers/productController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();


// Product search route
router.get('/search', searchProducts);

// Add a new product
router.post('/add', addProduct);
// Get all products
router.get('/get', getAllProducts);
// Get a product by ID
router.get('/get/:id', getProductById);
// Update a product by ID
router.put('/update/:id', updateProduct);
// Delete a product by ID
router.delete('/delete/:id', deleteProduct);

module.exports = router;