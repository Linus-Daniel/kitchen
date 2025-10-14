import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);
    const { isRead } = await req.json();

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new ErrorResponse("Notification not found", 404);
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to update this notification", 401);
    }

    notification.isRead = isRead;
    if (isRead && !notification.readAt) {
      notification.readAt = new Date();
    }

    await notification.save();

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new ErrorResponse("Notification not found", 404);
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to delete this notification", 401);
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}