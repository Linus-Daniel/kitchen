import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    await dbConnect();

    // Find scheduled orders for the vendor on the specified date
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const orders = await Order.find({
      'vendorOrders.vendor': session.user.id,
      scheduledDate: {
        $gte: startDate,
        $lt: endDate
      }
    }).populate('user', 'name email phone')
      .populate('vendorOrders.items.product', 'name price');

    // Transform orders to match the expected format
    const scheduledOrders = orders.map(order => {
      const vendorOrder = order.vendorOrders.find((vo: any) => 
        vo.vendor.toString() === session.user.id
      );

      return {
        id: order._id.toString(),
        customerName: order.user.name,
        customerPhone: order.user.phone || 'N/A',
        items: vendorOrder.items.map((item: any) => ({
          productId: item.product._id.toString(),
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          options: item.options || []
        })),
        scheduledDate: order.scheduledDate,
        scheduledTime: order.scheduledTime,
        totalAmount: vendorOrder.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        specialInstructions: order.specialInstructions,
        createdAt: order.createdAt,
        prepTime: vendorOrder.estimatedPrepTime || 30
      };
    });

    return NextResponse.json(scheduledOrders);
  } catch (error) {
    console.error('Error fetching scheduled orders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { message: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Verify vendor owns this order
    const vendorOrder = order.vendorOrders.find((vo: any) => 
      vo.vendor.toString() === session.user.id
    );

    if (!vendorOrder) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Update order status
    order.status = status;
    if (status === 'preparing') {
      order.preparationStartedAt = new Date();
    } else if (status === 'ready') {
      order.readyAt = new Date();
    } else if (status === 'completed') {
      order.completedAt = new Date();
    }

    await order.save();

    // In real implementation, send notifications to customer

    return NextResponse.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}