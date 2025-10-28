import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import Cart from "@/models/Cart";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";
import { PaystackService } from "@/lib/paystack";
import { notificationService } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { reference } = await req.json();

    if (!reference) {
      throw new ErrorResponse("Payment reference is required", 400);
    }

    // Verify payment with Paystack using the service
    const paystackService = new PaystackService();
    const verifyData = await paystackService.verifyPaymentServer(reference);

    if (!verifyData.status) {
      throw new ErrorResponse(`Payment verification failed: ${verifyData.message}`, 400);
    }

    const transactionData = verifyData.data;

    // Find the payment record
    const payment = await Payment.findOne({
      transactionId: reference,
    });

    if (!payment) {
      throw new ErrorResponse("Payment record not found", 404);
    }

    // Find the associated order
    const order = await Order.findById(payment.order);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    // Verify that the user owns this order
    if (order.user.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to verify payment for this order", 401);
    }

    // Check if payment was successful
    if (transactionData.status === 'success') {
      // Update payment status
      payment.status = "Completed";
      payment.paidAt = new Date();
      payment.paymentDetails = {
        ...payment.paymentDetails,
        verifiedAt: new Date(),
        status: "success",
        gateway_response: transactionData.gateway_response,
        paid_at: transactionData.paid_at,
        channel: transactionData.channel,
        ip_address: transactionData.ip_address,
        fees: transactionData.fees,
        authorization: transactionData.authorization,
      };
      await payment.save();

      // Update order status
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: reference,
        status: "success",
        update_time: new Date().toISOString(),
        email_address: user.email,
        payer_id: transactionData.customer?.id || "",
      };
      order.orderStatus = "Confirmed";
      await order.save();

      // Clear user's cart after successful payment
      await Cart.findOneAndUpdate(
        { user: user._id },
        { $set: { items: [], totalPrice: 0 } }
      );

      // Populate order with vendor details for notifications
      await order.populate([
        { path: 'vendorOrders.vendor', select: 'name email' },
        { path: 'orderItems.product', select: 'name vendor' },
        { path: 'user', select: 'name email' }
      ]);

      // Send comprehensive notifications
      try {
        // 1. Payment received notifications (in-app and email)
        await notificationService.sendPaymentReceivedNotification(order, {
          paymentId: reference,
          amount: transactionData.amount,
          currency: transactionData.currency,
          method: 'Paystack'
        });

        // 2. Order placed notifications (in-app and email)
        await notificationService.sendOrderPlacedNotifications(order);

        // 3. Send emails using the correct model based on role
        const Model = user.role === 'vendor' ? Vendor : User;
        const userDetails = await Model.findById(user._id);
        if (userDetails?.email) {
          // Send payment confirmation email
          await notificationService.sendEmailNotification(
            user._id.toString(),
            'User',
            'payment_received',
            order,
            {
              paymentId: reference,
              method: 'Paystack',
              amount: transactionData.amount / 100,
              currency: transactionData.currency,
            }
          );

          // Send order confirmation email
          await notificationService.sendEmailNotification(
            user._id.toString(),
            'User',
            'order_placed',
            order
          );
        }

        // 4. Send vendor emails
        const vendorIds = [...new Set(order.vendorOrders.map((vendorOrder: any) => vendorOrder.vendor._id || vendorOrder.vendor))];
        for (const vendorId of vendorIds) {
          // Create a vendor-specific order object for the email
          const vendorOrder = order.vendorOrders.find((vo: any) => (vo.vendor._id || vo.vendor).toString() === String(vendorId));
          const vendorSpecificOrder = {
            ...order.toObject(),
            orderItems: vendorOrder?.items || [],
            totalPrice: vendorOrder?.subtotal || 0
          };
          
          await notificationService.sendEmailNotification(
            String(vendorId),
            'Vendor',
            'order_placed',
            vendorSpecificOrder
          );
        }

      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
        // Don't fail the request if notifications fail
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          order,
          payment,
          transaction: {
            reference: transactionData.reference,
            amount: transactionData.amount / 100,
            currency: transactionData.currency,
            status: transactionData.status,
            paid_at: transactionData.paid_at,
            channel: transactionData.channel,
          },
        },
      });
    } else {
      // Update payment status as failed
      payment.status = "Failed";
      payment.paymentDetails = {
        ...payment.paymentDetails,
        verifiedAt: new Date(),
        status: "failed",
        gateway_response: transactionData.gateway_response,
      };
      await payment.save();

      throw new ErrorResponse(`Payment verification failed: ${transactionData.gateway_response}`, 400);
    }
  } catch (error) {
    return errorHandler(error as any, req);
  }
}