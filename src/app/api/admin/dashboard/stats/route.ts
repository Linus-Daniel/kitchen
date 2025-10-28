import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admin = await protect(req);
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days

    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));

    // Comprehensive statistics
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      pendingVendors,
      recentUsers,
      recentVendors,
      recentOrders,
      topProducts,
      revenueStats
    ] = await Promise.all([
      // Basic counts
      User.countDocuments({ role: { $ne: 'admin' } }),
      Vendor.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'processing'] } }),
      Order.countDocuments({ status: 'completed' }),
      
      // Revenue calculation
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Pending vendors
      Vendor.countDocuments({ isVerified: false }),
      
      // Recent data
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt'),
      
      Vendor.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('businessName ownerName isVerified createdAt'),
      
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .populate('vendor', 'businessName'),
      
      // Top products
      Product.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'items.product',
            as: 'orders'
          }
        },
        {
          $addFields: {
            orderCount: { $size: '$orders' }
          }
        },
        { $sort: { orderCount: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: 1,
            price: 1,
            category: 1,
            orderCount: 1,
            vendor: 1
          }
        }
      ]),
      
      // Revenue by period
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: periodDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingVendors
      },
      recent: {
        users: recentUsers,
        vendors: recentVendors,
        orders: recentOrders,
        topProducts
      },
      analytics: {
        revenueStats,
        growthRate: {
          users: 0, // Calculate based on period comparison
          vendors: 0,
          orders: 0,
          revenue: 0
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}