import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = searchParams.get('end') || new Date().toISOString().split('T')[0];

    await dbConnect();

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);

    // Get orders for the date range
    const orders = await Order.find({
      'vendorOrders.vendor': session.user.id,
      createdAt: { $gte: startDate, $lt: endDate }
    }).populate('vendorOrders.items.product');

    // Calculate revenue data
    const totalRevenue = orders.reduce((sum, order) => {
      const vendorOrder = order.vendorOrders.find((vo: any) => 
        vo.vendor.toString() === session.user.id
      );
      return sum + (vendorOrder?.vendorEarnings || 0);
    }, 0);

    // Generate daily revenue data
    const dailyRevenue = [];
    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRevenue = orders
        .filter(order => order.createdAt >= dayStart && order.createdAt < dayEnd)
        .reduce((sum, order) => {
          const vendorOrder = order.vendorOrders.find((vo: any) => 
            vo.vendor.toString() === session.user.id
          );
          return sum + (vendorOrder?.vendorEarnings || 0);
        }, 0);

      dailyRevenue.push({
        date: currentDate.toISOString().split('T')[0],
        amount: dayRevenue
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate order statistics
    const completedOrders = orders.filter(order => order.status === 'completed');
    const cancelledOrders = orders.filter(order => order.status === 'cancelled');
    const averageOrderValue = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0;

    // Get product analytics
    const products = await Product.find({ vendor: session.user.id });
    const productAnalytics = products.map(product => {
      const productOrders = orders.filter(order => 
        order.vendorOrders.some((vo: any) => 
          vo.items.some((item: any) => item.product.toString() === product._id.toString())
        )
      );

      const totalSold = productOrders.reduce((sum, order) => {
        const vendorOrder = order.vendorOrders.find((vo: any) => 
          vo.vendor.toString() === session.user.id
        );
        const productItem = vendorOrder?.items.find((item: any) => 
          item.product.toString() === product._id.toString()
        );
        return sum + (productItem?.quantity || 0);
      }, 0);

      const revenue = totalSold * product.price;
      const profit = revenue * 0.7; // Assuming 30% costs

      return {
        name: product.name,
        sold: totalSold,
        revenue,
        rating: product.averageRating || 0,
        profit
      };
    });

    // Sort products by performance
    const topPerforming = [...productAnalytics]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lowPerforming = [...productAnalytics]
      .filter(p => p.sold > 0)
      .sort((a, b) => a.sold - b.sold)
      .slice(0, 5);

    // Mock data for other sections (in real implementation, calculate from actual data)
    const analyticsData = {
      revenue: {
        total: totalRevenue,
        growth: 12.5,
        daily: dailyRevenue,
        monthly: [
          { month: 'Jan', amount: 2500 },
          { month: 'Feb', amount: 3200 },
          { month: 'Mar', amount: 2800 },
          { month: 'Apr', amount: 3600 },
          { month: 'May', amount: 4200 },
          { month: 'Jun', amount: 3900 }
        ],
        forecast: [
          { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], predicted: 180 },
          { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], predicted: 220 },
          { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], predicted: 195 }
        ]
      },
      orders: {
        total: orders.length,
        growth: 8.3,
        completed: completedOrders.length,
        cancelled: cancelledOrders.length,
        averageValue: averageOrderValue,
        peakHours: [
          { hour: '12:00', count: 15 },
          { hour: '13:00', count: 22 },
          { hour: '19:00', count: 28 },
          { hour: '20:00', count: 25 }
        ],
        trends: dailyRevenue.map(day => ({
          date: day.date,
          count: Math.round(day.amount / (averageOrderValue || 1))
        }))
      },
      customers: {
        total: 156,
        newCustomers: 23,
        returningCustomers: 133,
        topCustomers: [
          { name: 'John Doe', orders: 12, spent: 340.50 },
          { name: 'Jane Smith', orders: 8, spent: 280.75 },
          { name: 'Mike Johnson', orders: 6, spent: 195.25 }
        ],
        retention: 72.5,
        satisfaction: 4.3
      },
      products: {
        totalSold: productAnalytics.reduce((sum, p) => sum + p.sold, 0),
        topPerforming,
        lowPerforming,
        categories: [
          { category: 'Main Dishes', percentage: 45, revenue: 1800 },
          { category: 'Appetizers', percentage: 25, revenue: 1000 },
          { category: 'Desserts', percentage: 20, revenue: 800 },
          { category: 'Beverages', percentage: 10, revenue: 400 }
        ]
      },
      performance: {
        preparationTime: {
          average: 25,
          trend: -2.1,
          byCategory: [
            { category: 'Fast Food', time: 15 },
            { category: 'Main Dishes', time: 30 },
            { category: 'Complex Dishes', time: 45 }
          ]
        },
        deliveryTime: {
          average: 35,
          onTime: 85.2,
          delayed: 14.8
        },
        qualityScore: 88.5,
        efficiency: 92.3
      },
      marketing: {
        promotions: {
          active: 3,
          revenue: 450.75,
          conversion: 12.8
        },
        reviews: {
          average: 4.3,
          total: 89,
          recent: [
            { rating: 5, comment: 'Excellent food quality!', date: '2024-01-15' },
            { rating: 4, comment: 'Good service, fast delivery', date: '2024-01-14' },
            { rating: 5, comment: 'Amazing taste, will order again', date: '2024-01-13' }
          ]
        },
        visibility: {
          searchRanking: 8,
          profileViews: 324,
          clickThrough: 15.6
        }
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}