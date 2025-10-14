import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    let settings;
    if (user.role === "vendor") {
      const vendor = await Vendor.findById(user._id).select(
        "businessName email phone description address cuisineType logo deliveryFee minOrderAmount estimatedDeliveryTime"
      );
      settings = vendor;
    } else {
      const userData = await User.findById(user._id).select(
        "name email phone address role"
      );
      settings = userData;
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const updateData = await req.json();

    let updatedUser;
    if (user.role === "vendor") {
      updatedUser = await Vendor.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    } else {
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}