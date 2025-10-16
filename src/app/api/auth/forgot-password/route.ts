import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { errorHandler, ErrorResponse } from "@/lib/errorHandler";
import { emailService } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      throw new ErrorResponse("Email is required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal whether user exists for security
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link.",
      });
    }

    if (!user.isActive) {
      throw new ErrorResponse("Account is deactivated. Please contact support.", 400);
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;

    // Send email
    try {
      await emailService.sendPasswordReset(user.email, user.name, resetUrl);
      
      logger.info('Password reset email sent', { email: user.email, userId: user._id });

      return NextResponse.json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (emailError) {
      // Reset the token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('Failed to send password reset email', emailError, 'AUTH');
      throw new ErrorResponse("Email could not be sent. Please try again later.", 500);
    }
  } catch (error) {
    return errorHandler(error as any, req);
  }
}