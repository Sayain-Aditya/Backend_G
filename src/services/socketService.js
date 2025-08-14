const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join delivery room for specific order
    socket.on('join-delivery-room', (orderId) => {
      socket.join(`delivery-${orderId}`);
      console.log(`Client ${socket.id} joined delivery room for order ${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Emit driver location update to specific order room
const emitDriverLocationUpdate = (orderId, location) => {
  if (io) {
    io.to(`delivery-${orderId}`).emit('driver-location-update', {
      orderId,
      location,
      timestamp: new Date()
    });
  }
};

module.exports = {
  initializeSocket,
  emitDriverLocationUpdate
};