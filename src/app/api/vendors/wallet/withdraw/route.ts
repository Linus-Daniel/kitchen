import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, methodId, note } = await request.json();

    if (!amount || !methodId) {
      return NextResponse.json(
        { message: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        { message: 'Minimum withdrawal amount is $10' },
        { status: 400 }
      );
    }

    await dbConnect();

    const vendor = await Vendor.findById(session.user.id);
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Check available balance (this would be calculated properly in real implementation)
    const availableBalance = vendor.wallet?.availableBalance || 0;
    
    if (amount > availableBalance) {
      return NextResponse.json(
        { message: 'Insufficient available balance' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawalRequest = {
      id: `WD_${Date.now()}`,
      amount,
      methodId,
      note,
      status: 'pending',
      requestDate: new Date().toISOString(),
      estimatedProcessingTime: 3 // days
    };

    // Update vendor wallet
    if (!vendor.wallet) {
      vendor.wallet = {};
    }
    
    if (!vendor.wallet.withdrawalRequests) {
      vendor.wallet.withdrawalRequests = [];
    }
    
    vendor.wallet.withdrawalRequests.push(withdrawalRequest);
    await vendor.save();

    // In real implementation, this would:
    // 1. Integrate with payment processor
    // 2. Send notifications
    // 3. Update transaction records

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawalId: withdrawalRequest.id
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}