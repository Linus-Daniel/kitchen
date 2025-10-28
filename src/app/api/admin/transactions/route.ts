import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } },
      ];
    }

    // Get transactions with populated data
    const [transactions, total, stats] = await Promise.all([
      Payment.find(filter)
        .populate({
          path: 'order',
          populate: [
            { path: 'user', select: 'name email' },
            { path: 'vendor', select: 'businessName' }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      
      Payment.countDocuments(filter),
      
      Payment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Transform data for response
    const transactionData = transactions.map(transaction => ({
      _id: transaction._id,
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      order: {
        _id: transaction.order._id,
        orderNumber: transaction.order.orderNumber,
        user: transaction.order.user,
        vendor: transaction.order.vendor,
        total: transaction.order.total,
        status: transaction.order.status
      },
      refundAmount: transaction.refundAmount,
      refundStatus: transaction.refundStatus,
      refundedAt: transaction.refundedAt
    }));

    return NextResponse.json({
      success: true,
      data: transactionData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { action, transactionId, amount, reason } = await req.json();

    const transaction = await Payment.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    switch (action) {
      case 'refund':
        if (transaction.status !== 'completed') {
          return NextResponse.json({ error: 'Can only refund completed transactions' }, { status: 400 });
        }

        const refundAmount = amount || transaction.amount;
        if (refundAmount > transaction.amount) {
          return NextResponse.json({ error: 'Refund amount cannot exceed transaction amount' }, { status: 400 });
        }

        transaction.refundAmount = refundAmount;
        transaction.refundStatus = refundAmount === transaction.amount ? 'full' : 'partial';
        transaction.refundReason = reason;
        transaction.refundedAt = new Date();
        transaction.refundedBy = session.user.id;
        transaction.status = 'refunded';

        await transaction.save();

        // Update order status if fully refunded
        if (refundAmount === transaction.amount) {
          await Order.findByIdAndUpdate(transaction.order, { 
            status: 'refunded',
            refundedAt: new Date(),
            refundReason: reason
          });
        }

        break;

      case 'mark_failed':
        transaction.status = 'failed';
        transaction.failureReason = reason;
        await transaction.save();

        // Update order status
        await Order.findByIdAndUpdate(transaction.order, { 
          status: 'payment_failed',
          paymentFailureReason: reason
        });

        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${action} successfully`,
      data: transaction
    });

  } catch (error) {
    console.error('Error processing transaction action:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction action' },
      { status: 500 }
    );
  }
}