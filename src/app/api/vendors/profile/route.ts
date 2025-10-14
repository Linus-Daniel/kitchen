import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { vendorProtect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const vendor = await vendorProtect(req);

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const vendor = await vendorProtect(req);
    const body = await req.json();

    const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      data: updatedVendor,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
