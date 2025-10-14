import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      throw new ErrorResponse("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const token = user.getJwtToken();

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
