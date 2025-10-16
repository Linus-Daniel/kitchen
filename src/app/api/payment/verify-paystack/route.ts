import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Cart from "@/models/Cart";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";
import { emailService } from "@/lib/email";
import { PaystackService } from "@/lib/paystack";

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
      order.orderStatus = "confirmed";
      await order.save();

      // Clear user's cart after successful payment
      await Cart.findOneAndUpdate(
        { user: user._id },
        { $set: { items: [], totalPrice: 0 } }
      );

      // Send payment confirmation email
      try {
        const userDetails = await User.findById(user._id);
        if (userDetails?.email) {
          await emailService.sendPaymentConfirmation(userDetails.email, order, {
            paymentId: reference,
            method: 'Paystack',
            amount: transactionData.amount / 100, // Convert from kobo to naira
            currency: transactionData.currency,
          });
        }
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
        // Don't fail the request if email fails
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