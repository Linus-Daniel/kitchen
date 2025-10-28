import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admin = await protect(req);
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all'; // all, pending, verified, rejected
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any = {};
    
    if (status === 'pending') {
      query.isVerified = false;
      query.verificationStatus = { $ne: 'rejected' };
    } else if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'rejected') {
      query.verificationStatus = 'rejected';
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      Vendor.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const admin = await protect(req);
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { vendorId, action, reason } = await req.json(); // action: 'approve' | 'reject'

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    if (action === 'approve') {
      vendor.isVerified = true;
      vendor.verificationStatus = 'verified';
      vendor.verifiedAt = new Date();
      vendor.verifiedBy = admin._id;
    } else if (action === 'reject') {
      vendor.isVerified = false;
      vendor.verificationStatus = 'rejected';
      vendor.rejectionReason = reason;
      vendor.rejectedAt = new Date();
      vendor.rejectedBy = admin._id;
    }

    await vendor.save();

    // Send notification email to vendor (implement later)
    // await sendVerificationNotification(vendor, action, reason);

    return NextResponse.json({
      success: true,
      message: `Vendor ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: vendor
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}