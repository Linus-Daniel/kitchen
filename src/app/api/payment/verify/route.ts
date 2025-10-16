import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";
import { emailService } from "@/lib/email";

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

    // Verify with Paystack API
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    let isPaymentSuccessful = false;
    let transactionData = null;

    if (paystackSecretKey && payment.paymentMethod === "Paystack") {
      try {
        const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
        const verifyResponse = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        });

        const verifyData = await verifyResponse.json();
        
        if (verifyData.status && verifyData.data.status === 'success') {
          isPaymentSuccessful = true;
          transactionData = verifyData.data;
        }
      } catch (verifyError) {
        console.error('Paystack verification error:', verifyError);
      }
    } else {
      // Fallback for other payment methods or missing configuration
      isPaymentSuccessful = true;
    }

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

      // Send payment confirmation email
      try {
        const userDetails = await User.findById(user._id);
        if (userDetails?.email) {
          await emailService.sendPaymentConfirmation(userDetails.email, order, {
            paymentId: reference,
            method: 'Credit Card'
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