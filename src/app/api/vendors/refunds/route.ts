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

    await dbConnect();

    // Mock refund data - in real implementation, this would come from a refunds collection
    const refunds = [
      {
        id: 'REF_001',
        orderId: 'ORD_123456',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+1234567890',
        orderDate: '2024-01-10',
        refundAmount: 25.50,
        requestDate: '2024-01-12',
        reason: 'Food quality issue',
        description: 'The food arrived cold and the taste was not as expected. Customer is requesting a full refund.',
        status: 'pending',
        priority: 'high',
        refundType: 'full',
        paymentMethod: 'Credit Card',
        estimatedProcessingTime: 3
      },
      {
        id: 'REF_002',
        orderId: 'ORD_123457',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        customerPhone: '+1234567891',
        orderDate: '2024-01-08',
        refundAmount: 15.75,
        requestDate: '2024-01-09',
        reason: 'Wrong order delivered',
        description: 'Customer ordered chicken burger but received beef burger. Requesting partial refund for the difference.',
        status: 'approved',
        priority: 'medium',
        refundType: 'partial',
        vendorResponse: 'Approved partial refund due to order mix-up. Process initiated.',
        processedDate: '2024-01-10',
        paymentMethod: 'PayPal',
        estimatedProcessingTime: 2
      },
      {
        id: 'REF_003',
        orderId: 'ORD_123458',
        customerName: 'Mike Johnson',
        customerEmail: 'mike.johnson@example.com',
        customerPhone: '+1234567892',
        orderDate: '2024-01-05',
        refundAmount: 32.00,
        requestDate: '2024-01-06',
        reason: 'Late delivery',
        description: 'Order was delivered 2 hours late. Food was cold and customer was not satisfied.',
        status: 'rejected',
        priority: 'low',
        refundType: 'full',
        vendorResponse: 'Delivery delay was due to weather conditions beyond our control. Offered store credit instead.',
        processedDate: '2024-01-07',
        paymentMethod: 'Credit Card',
        estimatedProcessingTime: 3
      },
      {
        id: 'REF_004',
        orderId: 'ORD_123459',
        customerName: 'Sarah Wilson',
        customerEmail: 'sarah.wilson@example.com',
        customerPhone: '+1234567893',
        orderDate: '2024-01-15',
        refundAmount: 18.25,
        requestDate: '2024-01-16',
        reason: 'Missing items',
        description: 'Order was missing dessert and drinks. Customer requests refund for missing items only.',
        status: 'processing',
        priority: 'medium',
        refundType: 'partial',
        vendorResponse: 'Confirmed missing items. Processing partial refund.',
        processedDate: '2024-01-16',
        paymentMethod: 'Credit Card',
        estimatedProcessingTime: 2
      },
      {
        id: 'REF_005',
        orderId: 'ORD_123460',
        customerName: 'David Brown',
        customerEmail: 'david.brown@example.com',
        customerPhone: '+1234567894',
        orderDate: '2024-01-03',
        refundAmount: 42.50,
        requestDate: '2024-01-04',
        reason: 'Allergic reaction',
        description: 'Customer had allergic reaction despite mentioning allergies in special instructions. Requesting full refund.',
        status: 'completed',
        priority: 'urgent',
        refundType: 'full',
        vendorResponse: 'Sincerely apologize for the oversight. Full refund processed immediately.',
        processedDate: '2024-01-04',
        paymentMethod: 'Credit Card',
        estimatedProcessingTime: 1
      }
    ];

    // Filter refunds for this vendor (in real implementation, this would be done in the query)
    return NextResponse.json(refunds);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}