import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    await Notification.updateMany(
      {
        recipient: user._id,
        recipientModel: user.role === "vendor" ? "Vendor" : "User",
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}