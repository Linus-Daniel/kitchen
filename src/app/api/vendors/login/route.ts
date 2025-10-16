import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      throw new ErrorResponse("Please provide email and password", 400);
    }

    const vendor = await Vendor.findOne({ email }).select("+password");
    console.log(email, password, vendor);

    if (!vendor) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const isMatch = await vendor.comparePassword(password);

    if (!isMatch) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const token = vendor.getJwtToken();

    return NextResponse.json({
      success: true,
      token,
      role: "vendor",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
