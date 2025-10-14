import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { vendorProtect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const vendor = await vendorProtect(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "10") || 10;
    const status = searchParams.get("status");

    let query: any = {
      "vendorOrders.vendor": vendor._id,
    };

    if (status) {
      query["vendorOrders.status"] = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("vendorOrders.items.product", "name images")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Filter vendor-specific orders
    const vendorOrders = orders.map((order) => {
      const vendorOrder = order.vendorOrders.find(
        (vo: any) => vo.vendor.toString() === vendor._id.toString()
      );
      return {
        ...order.toObject(),
        vendorOrder,
      };
    });

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: vendorOrders.length,
      total,
      data: vendorOrders,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}