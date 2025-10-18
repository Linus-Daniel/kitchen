import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/models/Vendor';

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

    // Mock transaction data - in real implementation, this would come from a transactions collection
    const transactions = [
      {
        id: 'txn_001',
        type: 'earning',
        amount: 45.50,
        status: 'completed',
        description: 'Order #ORD123 commission',
        orderId: 'ORD123',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'ORD123'
      },
      {
        id: 'txn_002',
        type: 'withdrawal',
        amount: 100.00,
        status: 'completed',
        description: 'Bank transfer withdrawal',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        method: 'Bank Transfer',
        reference: 'WD_001'
      },
      {
        id: 'txn_003',
        type: 'credit',
        amount: 50.00,
        status: 'completed',
        description: 'Promotional credits added',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'PROMO_001'
      },
      {
        id: 'txn_004',
        type: 'earning',
        amount: 32.75,
        status: 'completed',
        description: 'Order #ORD124 commission',
        orderId: 'ORD124',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'ORD124'
      },
      {
        id: 'txn_005',
        type: 'deduction',
        amount: 15.00,
        status: 'completed',
        description: 'Platform fee deduction',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'FEE_001'
      }
    ];

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}