import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const vendor = await Vendor.findById(session.user.id);
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Calculate available balance from completed orders
    const completedOrders = await Order.find({
      'vendorOrders.vendor': vendor._id,
      status: 'completed',
      paymentStatus: 'paid'
    });

    const totalEarnings = completedOrders.reduce((sum, order) => {
      const vendorOrder = order.vendorOrders.find((vo: any) => 
        vo.vendor.toString() === vendor._id.toString()
      );
      return sum + (vendorOrder?.vendorEarnings || 0);
    }, 0);

    // Calculate withdrawn amount
    const totalWithdrawn = vendor.wallet?.totalWithdrawn || 0;
    
    // Calculate pending balance (orders in preparation/delivery)
    const pendingOrders = await Order.find({
      'vendorOrders.vendor': vendor._id,
      status: { $in: ['preparing', 'ready', 'out_for_delivery'] },
      paymentStatus: 'paid'
    });

    const pendingBalance = pendingOrders.reduce((sum, order) => {
      const vendorOrder = order.vendorOrders.find((vo: any) => 
        vo.vendor.toString() === vendor._id.toString()
      );
      return sum + (vendorOrder?.vendorEarnings || 0);
    }, 0);

    const availableBalance = totalEarnings - totalWithdrawn;
    const credits = vendor.wallet?.credits || 0;
    const commissionRate = vendor.commissionRate || 15;

    const walletBalance = {
      available: Math.max(0, availableBalance),
      pending: pendingBalance,
      totalEarnings,
      totalWithdrawn,
      credits,
      commissionRate
    };

    return NextResponse.json(walletBalance);
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}