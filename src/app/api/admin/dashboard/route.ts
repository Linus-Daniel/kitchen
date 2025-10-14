import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    if (user.role !== "admin") {
      throw new ErrorResponse("Access denied. Admin privileges required.", 403);
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get basic counts
    const [totalUsers, totalVendors, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Vendor.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // Get period-specific data
    const [newUsers, newOrders, periodRevenue] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: startDate },
        role: { $ne: "admin" },
      }),
      Order.countDocuments({
        createdAt: { $gte: startDate },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            isPaid: true,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]),
    ]);

    // Get order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get daily revenue for the period
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalQuantity: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    const dashboard = {
      summary: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        newUsers,
        newOrders,
        totalRevenue: periodRevenue[0]?.total || 0,
      },
      orderStatusStats,
      dailyRevenue,
      topProducts,
      period,
    };

    return NextResponse.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}