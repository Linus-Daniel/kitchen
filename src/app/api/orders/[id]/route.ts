import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);

    const order = await Order.findById(id)
      .populate("orderItems.product", "name images")
      .populate("vendorOrders.vendor", "businessName logo")
      .populate("user", "name email phone");

    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    // Check if user owns this order
    if (order.user._id.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to view this order", 401);
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);
    const { orderStatus } = await req.json();

    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    // Check if user owns this order
    if (order.user.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to update this order", 401);
    }

    // Only allow cancellation if order is still pending or confirmed
    if (orderStatus === "Cancelled" && !["Pending", "Confirmed"].includes(order.orderStatus)) {
      throw new ErrorResponse("Cannot cancel order at this stage", 400);
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "Completed") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}