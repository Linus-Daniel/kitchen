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

    // Return scheduling settings with defaults
    const scheduleSettings = {
      advanceBookingDays: vendor.scheduleSettings?.advanceBookingDays || 7,
      minOrderTime: vendor.scheduleSettings?.minOrderTime || 2,
      maxOrdersPerSlot: vendor.scheduleSettings?.maxOrdersPerSlot || 5,
      workingHours: {
        start: vendor.scheduleSettings?.workingHours?.start || '09:00',
        end: vendor.scheduleSettings?.workingHours?.end || '21:00'
      },
      timeSlotDuration: vendor.scheduleSettings?.timeSlotDuration || 60,
      blackoutDates: vendor.scheduleSettings?.blackoutDates || [],
      autoAcceptOrders: vendor.scheduleSettings?.autoAcceptOrders || false
    };

    return NextResponse.json(scheduleSettings);
  } catch (error) {
    console.error('Error fetching schedule settings:', error);
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

    const updates = await request.json();

    await dbConnect();

    const vendor = await Vendor.findById(session.user.id);
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    // Update schedule settings
    if (!vendor.scheduleSettings) {
      vendor.scheduleSettings = {};
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        vendor.scheduleSettings[key] = updates[key];
      }
    });

    await vendor.save();

    return NextResponse.json({ message: 'Schedule settings updated successfully' });
  } catch (error) {
    console.error('Error updating schedule settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}