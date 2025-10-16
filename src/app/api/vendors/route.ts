import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { adminProtect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Only admins can fetch all vendors
    await adminProtect(req);

    const vendors = await Vendor.find({}, 'businessName email phone logo description rating createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}