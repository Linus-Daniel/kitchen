import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";
import { PaystackService } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await protect(req);
    const { orderId, amount, email, metadata } = await req.json();

    if (!orderId || !amount || !email) {
      throw new ErrorResponse("Missing required fields: orderId, amount, email", 400);
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    // Verify that the user owns this order
    if (order.user.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to initialize payment for this order", 401);
    }

    // Check if order is already paid
    if (order.isPaid) {
      throw new ErrorResponse("Order is already paid", 400);
    }

    // Initialize Paystack transaction
    const paystackService = new PaystackService();
    const transactionData = await paystackService.initializeTransaction({
      email,
      amount,
      orderId,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      metadata: {
        orderId,
        userId: user._id.toString(),
        ...metadata,
      },
    });

    // Create or update payment record
    const paymentData = {
      user: user._id,
      order: orderId,
      amount: amount,
      paymentMethod: 'Paystack',
      transactionId: transactionData.data.reference,
      status: 'Pending',
      paymentDetails: {
        authorization_url: transactionData.data.authorization_url,
        access_code: transactionData.data.access_code,
        reference: transactionData.data.reference,
        createdAt: new Date(),
      },
    };

    await Payment.findOneAndUpdate(
      { order: orderId },
      paymentData,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: transactionData.data.authorization_url,
        access_code: transactionData.data.access_code,
        reference: transactionData.data.reference,
      },
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}