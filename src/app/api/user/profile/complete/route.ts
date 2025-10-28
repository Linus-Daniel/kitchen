import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { protect, errorHandler, updateUserById } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    
    // Get complete user profile based on role
    let profileData;
    if (user.role === 'vendor') {
      profileData = await Vendor.findById(user._id).select('-password');
    } else {
      profileData = await User.findById(user._id).select('-password');
    }

    if (!profileData) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const updates = await req.json();

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.email; // Email updates should go through separate verification

    const updatedProfile = await updateUserById(user._id, user.role, {
      ...updates,
      updatedAt: new Date()
    });

    if (!updatedProfile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}