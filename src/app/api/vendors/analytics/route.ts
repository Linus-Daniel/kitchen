import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { vendorProtect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const vendor = await vendorProtect(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    // Calculate date range
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

    // Get vendor's orders
    const vendorOrders = await Order.aggregate([
      {
        $match: {
          "vendorOrders.vendor": vendor._id,
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$vendorOrders" },
      { $match: { "vendorOrders.vendor": vendor._id } },
    ]);

    // Calculate metrics
    const totalOrders = vendorOrders.length;
    const totalRevenue = vendorOrders.reduce(
      (sum, order) => sum + order.vendorOrders.subtotal,
      0
    );

    // Order status distribution
    const orderStatusStats = vendorOrders.reduce((acc: any, order) => {
      const status = order.vendorOrders.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          "vendorOrders.vendor": vendor._id,
          createdAt: { $gte: startDate },
          isPaid: true,
        },
      },
      { $unwind: "$vendorOrders" },
      { $match: { "vendorOrders.vendor": vendor._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$vendorOrders.subtotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          "vendorOrders.vendor": vendor._id,
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$vendorOrders" },
      { $match: { "vendorOrders.vendor": vendor._id } },
      { $unwind: "$vendorOrders.items" },
      {
        $group: {
          _id: "$vendorOrders.items.product",
          totalQuantity: { $sum: "$vendorOrders.items.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$vendorOrders.items.quantity",
                "$vendorOrders.items.price",
              ],
            },
          },
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

    // Product performance
    const productCount = await Product.countDocuments({ vendor: vendor._id });
    const averageRating = await Review.aggregate([
      { $match: { vendor: vendor._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    // Customer satisfaction
    const reviewStats = await Review.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const analytics = {
      summary: {
        totalOrders,
        totalRevenue,
        productCount,
        averageRating: averageRating[0]?.avgRating || 0,
      },
      orderStatusStats,
      dailyRevenue,
      topProducts,
      reviewStats,
      period,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}