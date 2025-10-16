import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@kitchenmode.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Order confirmation email
  async sendOrderConfirmation(userEmail: string, order: any): Promise<void> {
    const subject = `Order Confirmation - #${order._id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order</p>
          </div>
          
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.orderStatus}</p>
              <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryTime || '30-45 minutes'}</p>
            </div>

            <h3>Items Ordered:</h3>
            ${order.orderItems.map((item: any) => `
              <div class="item">
                <strong>${item.name}</strong> x ${item.quantity}
                <span style="float: right;">$${(item.price * item.quantity).toFixed(2)}</span>
                ${item.selectedOptions ? `<br><small>Options: ${item.selectedOptions.map((opt: any) => opt.name).join(', ')}</small>` : ''}
              </div>
            `).join('')}
            
            <div class="total">
              <p>Subtotal: $${order.itemsPrice.toFixed(2)}</p>
              <p>Tax: $${order.taxPrice.toFixed(2)}</p>
              <p>Delivery: $${order.shippingPrice.toFixed(2)}</p>
              <p style="border-top: 1px solid #ddd; padding-top: 10px;">
                Total: $${order.totalPrice.toFixed(2)}
              </p>
            </div>

            <div class="order-details">
              <h3>Delivery Address:</h3>
              <p>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
              </p>
            </div>

            ${order.specialInstructions ? `
              <div class="order-details">
                <h3>Special Instructions:</h3>
                <p>${order.specialInstructions}</p>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>We'll send you updates as your order progresses.</p>
            <p>Questions? Contact us at support@kitchenmode.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  // Order status update email
  async sendOrderStatusUpdate(userEmail: string, order: any, newStatus: string): Promise<void> {
    const statusMessages: { [key: string]: string } = {
      'confirmed': 'Your order has been confirmed and is being prepared.',
      'preparing': 'Your order is being prepared by the restaurant.',
      'ready': 'Your order is ready for pickup/delivery!',
      'out-for-delivery': 'Your order is on its way to you!',
      'delivered': 'Your order has been delivered. Enjoy your meal!',
      'cancelled': 'Your order has been cancelled.'
    };

    const subject = `Order Update - #${order._id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Order Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .status-update { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
            <p>Order #${order._id}</p>
          </div>
          
          <div class="content">
            <div class="status-update">
              <h2>Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h2>
              <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            </div>

            ${newStatus === 'delivered' ? `
              <p>We hope you enjoyed your meal! Please consider leaving a review to help other customers.</p>
            ` : ''}

            ${newStatus === 'out-for-delivery' ? `
              <p>Expected delivery time: ${order.estimatedDeliveryTime || '15-30 minutes'}</p>
            ` : ''}
          </div>

          <div class="footer">
            <p>Track your order status anytime in your account.</p>
            <p>Questions? Contact us at support@kitchenmode.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  // Payment confirmation email
  async sendPaymentConfirmation(userEmail: string, order: any, paymentDetails: any): Promise<void> {
    const subject = `Payment Confirmed - Order #${order._id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .payment-details { background-color: #f0fdf4; border: 1px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
            <p>Your payment has been processed successfully</p>
          </div>
          
          <div class="content">
            <div class="payment-details">
              <h2>Payment Details</h2>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
              <p><strong>Amount Paid:</strong> $${order.totalPrice.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentDetails.method || 'Credit Card'}</p>
              <p><strong>Transaction Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>Your order is now confirmed and being processed. You'll receive another email when your order status changes.</p>
          </div>

          <div class="footer">
            <p>Keep this email for your records.</p>
            <p>Questions? Contact us at support@kitchenmode.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  // Vendor new order notification
  async sendVendorOrderNotification(vendorEmail: string, order: any): Promise<void> {
    const subject = `New Order Received - #${order._id}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .urgent { background-color: #fef2f2; border: 1px solid #ef4444; padding: 10px; margin: 10px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received!</h1>
            <p>Order #${order._id}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>Action Required:</strong> Please confirm this order in your vendor dashboard and update the preparation time.
            </div>

            <div class="order-details">
              <p><strong>Customer:</strong> ${order.user?.name || 'N/A'}</p>
              <p><strong>Order Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Order Total:</strong> $${order.totalPrice.toFixed(2)}</p>
              <p><strong>Payment Status:</strong> ${order.isPaid ? 'Paid' : 'Pending'}</p>
            </div>

            <h3>Items to Prepare:</h3>
            ${order.orderItems.map((item: any) => `
              <div class="item">
                <strong>${item.name}</strong> x ${item.quantity}
                ${item.selectedOptions ? `<br><small>Options: ${item.selectedOptions.map((opt: any) => opt.name).join(', ')}</small>` : ''}
              </div>
            `).join('')}

            <div class="order-details">
              <h3>Delivery Address:</h3>
              <p>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
              </p>
            </div>

            ${order.specialInstructions ? `
              <div class="order-details">
                <h3>Special Instructions:</h3>
                <p><strong>${order.specialInstructions}</strong></p>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/vendor/orders/${order._id}">View Order in Dashboard</a></p>
            <p>Manage all your orders at your vendor dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: vendorEmail, subject, html });
  }

  // Password reset email
  async sendPasswordReset(userEmail: string, userName: string, resetUrl: string): Promise<void> {
    const subject = 'Reset Your Password - KitchenMode';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .reset-button { 
            display: inline-block; 
            background-color: #dc2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .warning { background-color: #fef2f2; border: 1px solid #dc2626; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your KitchenMode account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 15 minutes for security reasons</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>If you have any questions, contact us at support@kitchenmode.com</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: string = 'user'): Promise<void> {
    const subject = 'Welcome to KitchenMode!';
    const roleSpecificContent = {
      user: {
        title: 'Welcome to KitchenMode!',
        message: 'Start exploring delicious meals from your favorite restaurants.',
        cta: 'Browse Menu',
        ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      },
      vendor: {
        title: 'Welcome to KitchenMode Vendor Dashboard!',
        message: 'Start adding your menu items and reach more customers.',
        cta: 'Access Vendor Dashboard',
        ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL}/vendor`,
      },
      admin: {
        title: 'Welcome to KitchenMode Admin Panel!',
        message: 'Manage the platform and oversee all operations.',
        cta: 'Access Admin Panel',
        ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL}/admin`,
      },
    };

    const content = roleSpecificContent[userRole as keyof typeof roleSpecificContent] || roleSpecificContent.user;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to KitchenMode</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .cta-button { 
            display: inline-block; 
            background-color: #f97316; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .features { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${content.title}</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>Thank you for joining KitchenMode! ${content.message}</p>
            
            <div style="text-align: center;">
              <a href="${content.ctaLink}" class="cta-button">${content.cta}</a>
            </div>
            
            ${userRole === 'user' ? `
              <div class="features">
                <h3>What you can do:</h3>
                <ul>
                  <li>Browse menus from multiple restaurants</li>
                  <li>Track your orders in real-time</li>
                  <li>Save your favorite dishes</li>
                  <li>Manage multiple delivery addresses</li>
                  <li>Leave reviews and ratings</li>
                </ul>
              </div>
            ` : ''}

            ${userRole === 'vendor' ? `
              <div class="features">
                <h3>Getting started as a vendor:</h3>
                <ul>
                  <li>Complete your restaurant profile</li>
                  <li>Add your menu items with photos</li>
                  <li>Set your operating hours</li>
                  <li>Manage incoming orders</li>
                  <li>Track your analytics and earnings</li>
                </ul>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Need help? Contact us at support@kitchenmode.com</p>
            <p>Follow us on social media for updates and special offers!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: userEmail, subject, html });
  }
}

export const emailService = new EmailService();