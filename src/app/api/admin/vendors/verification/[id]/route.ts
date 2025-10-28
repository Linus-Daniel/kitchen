import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await protect(req);
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const vendor = await Vendor.findById(id).select('-password');

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const admin = await protect(req);
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const updates = await req.json();

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      {
        ...updates,
        updatedAt: new Date(),
        updatedBy: admin._id
      },
      { new: true, select: '-password' }
    );

    if (!vendor) {
      return NextResponse.json({ message: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}