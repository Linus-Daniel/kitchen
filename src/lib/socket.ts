import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/api/socket'
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins their personal room for notifications
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their notification room`);
    });

    // Vendor joins their personal room for notifications
    socket.on('join-vendor-room', (vendorId: string) => {
      socket.join(`vendor-${vendorId}`);
      console.log(`Vendor ${vendorId} joined their notification room`);
    });

    // Admin joins admin room
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Notification event emitters
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

export const emitToVendor = (vendorId: string, event: string, data: any) => {
  if (io) {
    io.to(`vendor-${vendorId}`).emit(event, data);
  }
};

export const emitToAdmin = (event: string, data: any) => {
  if (io) {
    io.to('admin-room').emit(event, data);
  }
};

// Specific notification events
export const emitNewOrderNotification = (vendorId: string, orderData: any) => {
  emitToVendor(vendorId, 'new-order', {
    type: 'order_placed',
    title: 'New Order Received',
    message: `New order #${orderData._id} received`,
    data: orderData,
    timestamp: new Date().toISOString()
  });
};

export const emitOrderStatusUpdate = (userId: string, orderData: any, newStatus: string) => {
  emitToUser(userId, 'order-update', {
    type: `order_${newStatus}`,
    title: 'Order Status Updated',
    message: `Your order #${orderData._id} is now ${newStatus}`,
    data: { orderId: orderData._id, newStatus },
    timestamp: new Date().toISOString()
  });
};

export const emitPaymentConfirmation = (userId: string, orderData: any, paymentData: any) => {
  emitToUser(userId, 'payment-confirmed', {
    type: 'payment_received',
    title: 'Payment Confirmed',
    message: `Payment confirmed for order #${orderData._id}`,
    data: { orderId: orderData._id, paymentData },
    timestamp: new Date().toISOString()
  });
};

export const emitNotificationUpdate = (userId: string, recipientModel: 'User' | 'Vendor', unreadCount: number) => {
  const event = 'notification-count-update';
  const data = { unreadCount, timestamp: new Date().toISOString() };
  
  if (recipientModel === 'User') {
    emitToUser(userId, event, data);
  } else {
    emitToVendor(userId, event, data);
  }
};