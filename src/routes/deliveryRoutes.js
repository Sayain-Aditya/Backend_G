const express = require('express');
const { emitDriverLocationUpdate } = require('../services/socketService');
const Order = require('../models/order');
const router = express.Router();

// Update driver location (for delivery partners)
router.put('/update-location/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng, driverName, driverPhone, estimatedDeliveryTime } = req.body;

    // Update order with new driver location
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'deliveryTracking.driverLocation.lat': lat,
          'deliveryTracking.driverLocation.lng': lng,
          'deliveryTracking.driverName': driverName,
          'deliveryTracking.driverPhone': driverPhone,
          'deliveryTracking.estimatedDeliveryTime': estimatedDeliveryTime,
          'deliveryTracking.lastUpdated': new Date()
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit real-time update to connected clients
    emitDriverLocationUpdate(orderId, { lat, lng });

    res.json({ message: 'Location updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update location', error: error.message });
  }
});

// Simulate driver movement (for testing)
router.post('/simulate-movement/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Simulate driver moving from point A to B
    const startLat = 28.6139;
    const startLng = 77.2090;
    const endLat = 28.7041;
    const endLng = 77.1025;
    
    let step = 0;
    const totalSteps = 20;
    
    const interval = setInterval(() => {
      const progress = step / totalSteps;
      const currentLat = startLat + (endLat - startLat) * progress;
      const currentLng = startLng + (endLng - startLng) * progress;
      
      // Emit location update
      emitDriverLocationUpdate(orderId, { 
        lat: currentLat, 
        lng: currentLng 
      });
      
      step++;
      if (step > totalSteps) {
        clearInterval(interval);
      }
    }, 2000); // Update every 2 seconds
    
    res.json({ message: 'Simulation started' });
  } catch (error) {
    res.status(500).json({ message: 'Simulation failed', error: error.message });
  }
});

module.exports = router;