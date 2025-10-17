import Notification from "@/models/Notification";
import { emailService } from "@/lib/email";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { 
  emitToUser, 
  emitToVendor, 
  emitNewOrderNotification, 
  emitOrderStatusUpdate, 
  emitPaymentConfirmation,
  emitNotificationUpdate 
} from "@/lib/socket";

export interface NotificationData {
  recipient: string;
  recipientModel: 'User' | 'Vendor';
  type: string;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
}

class NotificationService {
  // Create a notification in the database
  async createNotification(notificationData: NotificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Emit real-time notification
      try {
        if (notificationData.recipientModel === 'User') {
          emitToUser(notificationData.recipient, 'new-notification', {
            id: notification._id,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data,
            actionUrl: notificationData.actionUrl,
            createdAt: notification.createdAt,
            isRead: false
          });
        } else {
          emitToVendor(notificationData.recipient, 'new-notification', {
            id: notification._id,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data,
            actionUrl: notificationData.actionUrl,
            createdAt: notification.createdAt,
            isRead: false
          });
        }

        // Update unread count
        const unreadCount = await this.getUnreadCount(notificationData.recipient, notificationData.recipientModel);
        emitNotificationUpdate(notificationData.recipient, notificationData.recipientModel, unreadCount);
      } catch (socketError) {
        console.error('Error sending real-time notification:', socketError);
        // Don't fail notification creation if socket fails
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send order placed notifications
  async sendOrderPlacedNotifications(order: any) {
    const notifications = [];

    // Notification to customer
    const customerNotification = await this.createNotification({
      recipient: order.user,
      recipientModel: 'User',
      type: 'order_placed',
      title: 'Order Placed Successfully',
      message: `Your order #${order._id} has been placed and payment confirmed. We'll notify you when it's being prepared.`,
      data: { orderId: order._id, orderTotal: order.totalPrice },
      actionUrl: `/account/orders/${order._id}`
    });
    notifications.push(customerNotification);

    // Notifications to vendors (for each unique vendor in the order)
    const vendorIds = [...new Set(order.vendorOrders.map((vendorOrder: any) => vendorOrder.vendor._id || vendorOrder.vendor))];
    
    for (const vendorId of vendorIds) {
      const vendorIdString = String(vendorId);
      const vendorOrder = order.vendorOrders.find((vo: any) => (vo.vendor._id || vo.vendor).toString() === vendorIdString);
      const vendorItems = vendorOrder?.items || [];
      const vendorNotification = await this.createNotification({
        recipient: vendorIdString,
        recipientModel: 'Vendor',
        type: 'order_placed',
        title: 'New Order Received',
        message: `New order #${order._id} received with ${vendorItems.length} item(s). Please confirm and prepare the order.`,
        data: { 
          orderId: order._id, 
          itemCount: vendorItems.length,
          orderTotal: vendorItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        },
        actionUrl: `/vendor/orders/${order._id}`
      });
      notifications.push(vendorNotification);

      // Send specific order notification
      try {
        emitNewOrderNotification(vendorIdString, order);
      } catch (socketError) {
        console.error('Error sending new order socket event:', socketError);
      }
    }

    return notifications;
  }

  // Send order status update notifications
  async sendOrderStatusNotification(order: any, newStatus: string, updatedBy?: any) {
    const statusMessages: { [key: string]: { customer: string, vendor: string } } = {
      'confirmed': {
        customer: `Your order #${order._id} has been confirmed and is being prepared.`,
        vendor: `Order #${order._id} has been confirmed. Please start preparation.`
      },
      'preparing': {
        customer: `Your order #${order._id} is being prepared. We'll notify you when it's ready.`,
        vendor: `Order #${order._id} is now marked as being prepared.`
      },
      'ready': {
        customer: `Your order #${order._id} is ready for pickup/delivery!`,
        vendor: `Order #${order._id} has been marked as ready.`
      },
      'out-for-delivery': {
        customer: `Your order #${order._id} is on its way to you!`,
        vendor: `Order #${order._id} is out for delivery.`
      },
      'delivered': {
        customer: `Your order #${order._id} has been delivered. Enjoy your meal!`,
        vendor: `Order #${order._id} has been successfully delivered.`
      },
      'cancelled': {
        customer: `Your order #${order._id} has been cancelled.`,
        vendor: `Order #${order._id} has been cancelled.`
      }
    };

    const messages = statusMessages[newStatus.toLowerCase()];
    if (!messages) return [];

    const notifications = [];

    // Notification to customer
    const customerNotification = await this.createNotification({
      recipient: order.user,
      recipientModel: 'User',
      type: `order_${newStatus.toLowerCase()}`,
      title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: messages.customer,
      data: { orderId: order._id, newStatus },
      actionUrl: `/account/orders/${order._id}`
    });
    notifications.push(customerNotification);

    // Send real-time order status update
    try {
      emitOrderStatusUpdate(order.user.toString(), order, newStatus);
    } catch (socketError) {
      console.error('Error sending order status update socket event:', socketError);
    }

    // If status update is not from vendor, notify vendors too
    if (updatedBy?.role !== 'vendor') {
      const vendorIds = [...new Set(order.vendorOrders.map((vendorOrder: any) => vendorOrder.vendor._id || vendorOrder.vendor))];
      
      for (const vendorId of vendorIds) {
        const vendorIdString = String(vendorId);
        const vendorNotification = await this.createNotification({
          recipient: vendorIdString,
          recipientModel: 'Vendor',
          type: `order_${newStatus.toLowerCase()}`,
          title: `Order Status Updated`,
          message: messages.vendor,
          data: { orderId: order._id, newStatus },
          actionUrl: `/vendor/orders/${order._id}`
        });
        notifications.push(vendorNotification);
      }
    }

    return notifications;
  }

  // Send payment received notification
  async sendPaymentReceivedNotification(order: any, paymentDetails: any) {
    const notifications = [];

    // Notification to customer
    const customerNotification = await this.createNotification({
      recipient: order.user,
      recipientModel: 'User',
      type: 'payment_received',
      title: 'Payment Confirmed',
      message: `Your payment of ₦${(paymentDetails.amount / 100).toFixed(2)} for order #${order._id} has been confirmed.`,
      data: { 
        orderId: order._id, 
        paymentId: paymentDetails.paymentId,
        amount: paymentDetails.amount / 100
      },
      actionUrl: `/account/orders/${order._id}`
    });
    notifications.push(customerNotification);

    // Send real-time payment confirmation
    try {
      emitPaymentConfirmation(order.user.toString(), order, paymentDetails);
    } catch (socketError) {
      console.error('Error sending payment confirmation socket event:', socketError);
    }

    // Notifications to vendors
    const vendorIds = [...new Set(order.vendorOrders.map((vendorOrder: any) => vendorOrder.vendor._id || vendorOrder.vendor))];
    
    for (const vendorId of vendorIds) {
      const vendorIdString = String(vendorId);
      const vendorOrder = order.vendorOrders.find((vo: any) => (vo.vendor._id || vo.vendor).toString() === vendorIdString);
      const vendorItems = vendorOrder?.items || [];
      const vendorTotal = vendorOrder?.subtotal || 0;
      
      const vendorNotification = await this.createNotification({
        recipient: vendorIdString,
        recipientModel: 'Vendor',
        type: 'payment_received',
        title: 'Payment Received for Order',
        message: `Payment confirmed for order #${order._id}. Your portion: ₦${vendorTotal.toFixed(2)}. Please start preparing the order.`,
        data: { 
          orderId: order._id,
          vendorTotal,
          itemCount: vendorItems.length
        },
        actionUrl: `/vendor/orders/${order._id}`
      });
      notifications.push(vendorNotification);
    }

    return notifications;
  }

  // Send email notifications along with in-app notifications
  async sendEmailNotification(recipientId: string, recipientModel: 'User' | 'Vendor', notificationType: string, order?: any, extraData?: any) {
    try {
      let recipient;
      
      if (recipientModel === 'User') {
        recipient = await User.findById(recipientId).select('email name');
      } else {
        recipient = await Vendor.findById(recipientId).select('email name');
      }

      if (!recipient?.email) return;

      switch (notificationType) {
        case 'order_placed':
          if (recipientModel === 'User') {
            await emailService.sendOrderConfirmation(recipient.email, order);
          } else {
            await emailService.sendVendorOrderNotification(recipient.email, order);
          }
          break;

        case 'payment_received':
          if (recipientModel === 'User') {
            await emailService.sendPaymentConfirmation(recipient.email, order, extraData);
          }
          break;

        case 'order_confirmed':
        case 'order_preparing':
        case 'order_ready':
        case 'order_delivered':
        case 'order_cancelled':
          if (recipientModel === 'User') {
            await emailService.sendOrderStatusUpdate(recipient.email, order, notificationType.replace('order_', ''));
          }
          break;

        default:
          console.log(`No email template for notification type: ${notificationType}`);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw error for email failures
    }
  }

  // Get unread notification count for a user/vendor
  async getUnreadCount(recipientId: string, recipientModel: 'User' | 'Vendor') {
    try {
      const count = await Notification.countDocuments({
        recipient: recipientId,
        recipientModel,
        isRead: false
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get notifications for a user/vendor
  async getNotifications(recipientId: string, recipientModel: 'User' | 'Vendor', limit = 20, skip = 0) {
    try {
      const notifications = await Notification.find({
        recipient: recipientId,
        recipientModel
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
      
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, recipientId: string) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: recipientId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(recipientId: string, recipientModel: 'User' | 'Vendor') {
    try {
      await Notification.updateMany(
        { recipient: recipientId, recipientModel, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();