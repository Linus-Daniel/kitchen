import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    console.log(user)
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "20") || 20;
    const isRead = searchParams.get("isRead");
    const type = searchParams.get("type");

    let query: any = { 
      recipient: user._id,
      recipientModel: user.role === "vendor" ? "Vendor" : "User",
    };

    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: user._id,
      recipientModel: user.role === "vendor" ? "Vendor" : "User",
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}