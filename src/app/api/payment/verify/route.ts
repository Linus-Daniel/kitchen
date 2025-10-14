import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { reference, orderId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    if (order.user.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to verify payment for this order", 401);
    }

    const payment = await Payment.findOne({
      order: orderId,
      transactionId: reference,
    });

    if (!payment) {
      throw new ErrorResponse("Payment record not found", 404);
    }

    // In a real application, you would verify with Paystack API
    // For this example, we'll simulate a successful payment
    const isPaymentSuccessful = true; // This would come from Paystack verification

    if (isPaymentSuccessful) {
      // Update payment status
      payment.status = "Completed";
      payment.paidAt = new Date();
      payment.paymentDetails = {
        ...payment.paymentDetails,
        verifiedAt: new Date(),
        status: "success",
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
      };
      order.orderStatus = "Confirmed";
      await order.save();

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          order,
          payment,
        },
      });
    } else {
      // Update payment status as failed
      payment.status = "Failed";
      payment.paymentDetails = {
        ...payment.paymentDetails,
        verifiedAt: new Date(),
        status: "failed",
      };
      await payment.save();

      throw new ErrorResponse("Payment verification failed", 400);
    }
  } catch (error) {
    return errorHandler(error as any, req);
  }
}