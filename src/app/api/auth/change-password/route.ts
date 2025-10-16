import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { protect, errorHandler, ErrorResponse } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ErrorResponse("All fields are required", 400);
    }

    if (newPassword !== confirmPassword) {
      throw new ErrorResponse("New passwords do not match", 400);
    }

    if (newPassword.length < 6) {
      throw new ErrorResponse("New password must be at least 6 characters long", 400);
    }

    if (currentPassword === newPassword) {
      throw new ErrorResponse("New password must be different from current password", 400);
    }

    // Get user with password field
    const userWithPassword = await User.findById(user._id).select('+password');
    
    if (!userWithPassword) {
      throw new ErrorResponse("User not found", 404);
    }

    // Check current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ErrorResponse("Current password is incorrect", 400);
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    logger.info('Password changed successfully', { userId: user._id, email: user.email });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}