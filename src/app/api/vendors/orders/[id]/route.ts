import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { vendorProtect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const vendor = await vendorProtect(req);
    const { status } = await req.json();

    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    // Find the vendor's order within the main order
    const vendorOrderIndex = order.vendorOrders.findIndex(
      (vo: any) => vo.vendor.toString() === vendor._id.toString()
    );

    if (vendorOrderIndex === -1) {
      throw new ErrorResponse("Vendor order not found", 404);
    }

    // Update vendor order status
    order.vendorOrders[vendorOrderIndex].status = status;

    // Update main order status based on vendor order statuses
    const allVendorStatuses = order.vendorOrders.map((vo: any) => vo.status);
    
    if (allVendorStatuses.every((s: string) => s === "Delivered")) {
      order.orderStatus = "Completed";
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (allVendorStatuses.some((s: string) => s === "Cancelled")) {
      order.orderStatus = "Processing";
    } else if (allVendorStatuses.every((s: string) => ["Confirmed", "Preparing", "Ready"].includes(s))) {
      order.orderStatus = "Processing";
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order.vendorOrders[vendorOrderIndex],
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}