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

    // Paystack initialization logic
    const amountInKobo = Math.round(order.totalPrice * 100);
    const reference = `kitchenmode_${Date.now()}_${order._id.toString().slice(-6)}`;

    // Initialize Paystack payment
    const paystackApiUrl = 'https://api.paystack.co/transaction/initialize';
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new ErrorResponse("Paystack configuration error", 500);
    }

    const paystackPayload = {
      email: user.email || email,
      amount: amountInKobo,
      reference,
      currency: 'NGN',
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order._id.toString()
          }
        ]
      }
    };

    const paystackResponse = await fetch(paystackApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new ErrorResponse(`Payment initialization failed: ${paystackData.message}`, 400);
    }

    const payment = await Payment.create({
      user: user._id,
      order: order._id,
      paymentMethod: "Paystack",
      amount: order.totalPrice,
      currency: "NGN",
      status: "Pending",
      transactionId: reference,
      paymentDetails: {
        authorizationUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        amount: order.totalPrice,
        currency: 'NGN',
      },
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
