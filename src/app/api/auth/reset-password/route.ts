import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { errorHandler, ErrorResponse } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, password, confirmPassword } = await req.json();

    if (!token || !password || !confirmPassword) {
      throw new ErrorResponse("All fields are required", 400);
    }

    if (password !== confirmPassword) {
      throw new ErrorResponse("Passwords do not match", 400);
    }

    if (password.length < 6) {
      throw new ErrorResponse("Password must be at least 6 characters long", 400);
    }

    // Find user with valid reset token
    const users = await User.find({
      resetPasswordExpires: { $gt: Date.now() },
    });

    let user = null;
    for (const u of users) {
      if (u.resetPasswordToken && bcrypt.compareSync(token, u.resetPasswordToken)) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new ErrorResponse("Invalid or expired reset token", 400);
    }

    if (!user.isActive) {
      throw new ErrorResponse("Account is deactivated. Please contact support.", 400);
    }

    // Reset password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastLoginAt = new Date();

    await user.save();

    logger.info('Password reset successful', { userId: user._id, email: user.email });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}