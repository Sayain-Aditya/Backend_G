const express = require('express');
const { sendInvoiceEmail } = require('../services/emailService');
const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Mock order data for testing
    const mockOrder = {
      _id: 'TEST123',
      total: 500,
      paymentMethod: 'COD',
      createdAt: new Date(),
      address: {
        fullName: 'Test User',
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zip: '12345',
        phone: '1234567890'
      },
      items: [
        {
          product: { name: 'Test Product', price: 100 },
          quantity: 2
        }
      ]
    };
    
    await sendInvoiceEmail(mockOrder, email);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;