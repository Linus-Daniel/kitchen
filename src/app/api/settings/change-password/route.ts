import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import bcrypt from "bcryptjs";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      throw new ErrorResponse("Current password and new password are required", 400);
    }

    if (newPassword.length < 6) {
      throw new ErrorResponse("New password must be at least 6 characters long", 400);
    }

    let userData;
    if (user.role === "vendor") {
      userData = await Vendor.findById(user._id).select("+password");
    } else {
      userData = await User.findById(user._id).select("+password");
    }

    if (!userData) {
      throw new ErrorResponse("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password);

    if (!isCurrentPasswordValid) {
      throw new ErrorResponse("Current password is incorrect", 400);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    userData.password = hashedNewPassword;
    await userData.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}