import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { orderId, email } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    if (order.user.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to pay for this order", 401);
    }

    if (order.isPaid) {
      throw new ErrorResponse("Order has already been paid", 400);
    }

    // Paystack initialization logic here
    const amountInKobo = Math.round(order.totalPrice * 100);
    const reference = `foodapp-${Date.now()}-${order._id.toString().slice(-6)}`;

    // Initialize Paystack payment (simplified)
    const paystackResponse = {
      data: {
        authorization_url: `https://paystack.com/pay/${reference}`,
        access_code: reference,
        reference,
      },
    };

    const payment = await Payment.create({
      user: user._id,
      order: order._id,
      paymentMethod: "Paystack",
      amount: order.totalPrice,
      currency: "NGN",
      status: "Pending",
      transactionId: reference,
      paymentDetails: {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
      },
    });

    return NextResponse.json({
      success: true,
      data: paystackResponse.data,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
