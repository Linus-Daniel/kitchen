import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);

    if (user.role !== "admin") {
      throw new ErrorResponse("Access denied. Admin privileges required.", 403);
    }

    const targetUser = await User.findById(id).select("-password");

    if (!targetUser) {
      throw new ErrorResponse("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: targetUser,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);
    const { role, isActive } = await req.json();

    if (user.role !== "admin") {
      throw new ErrorResponse("Access denied. Admin privileges required.", 403);
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      throw new ErrorResponse("User not found", 404);
    }

    if (role) {
      targetUser.role = role;
    }

    if (typeof isActive === "boolean") {
      targetUser.isActive = isActive;
    }

    await targetUser.save();

    const updatedUser = await User.findById(id).select("-password");

    return NextResponse.json({
      success: true,
      data: updatedUser,
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

    if (user.role !== "admin") {
      throw new ErrorResponse("Access denied. Admin privileges required.", 403);
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      throw new ErrorResponse("User not found", 404);
    }

    // Prevent admin from deleting themselves
    if (targetUser._id.toString() === user._id.toString()) {
      throw new ErrorResponse("Cannot delete your own account", 400);
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}