import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { protect, errorHandler, ErrorResponse } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await protect(req);

    const userWithAddresses = await User.findById(user._id).select('addresses');
    
    if (!userWithAddresses) {
      throw new ErrorResponse("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: userWithAddresses.addresses || [],
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await protect(req);

    const { label, street, city, state, zipCode, country, type, isDefault } = await req.json();

    if (!label || !street || !city || !state || !zipCode) {
      throw new ErrorResponse("All address fields are required", 400);
    }

    const userDoc = await User.findById(user._id);
    
    if (!userDoc) {
      throw new ErrorResponse("User not found", 404);
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      userDoc.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    const newAddress = {
      label,
      street,
      city,
      state,
      zipCode,
      country: country || 'Nigeria',
      type: type || 'home',
      isDefault: isDefault || userDoc.addresses.length === 0, // First address is default
      createdAt: new Date(),
    };

    userDoc.addresses.push(newAddress);
    await userDoc.save();

    logger.info('Address added', { userId: user._id, addressLabel: label });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      data: userDoc.addresses[userDoc.addresses.length - 1],
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}