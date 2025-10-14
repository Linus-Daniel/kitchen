import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    const userData = await User.findById(user._id);

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
