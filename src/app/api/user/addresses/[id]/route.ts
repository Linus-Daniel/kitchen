import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { protect, errorHandler, ErrorResponse } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await protect(req);
    const { id: addressId } = await params;

    const { label, street, city, state, zipCode, country, type, isDefault } = await req.json();

    if (!label || !street || !city || !state || !zipCode) {
      throw new ErrorResponse("All address fields are required", 400);
    }

    const userDoc = await User.findById(user._id);
    
    if (!userDoc) {
      throw new ErrorResponse("User not found", 404);
    }

    const addressIndex = userDoc.addresses.findIndex((addr: any) => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      throw new ErrorResponse("Address not found", 404);
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      userDoc.addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update address
    userDoc.addresses[addressIndex] = {
      ...userDoc.addresses[addressIndex],
      label,
      street,
      city,
      state,
      zipCode,
      country: country || 'Nigeria',
      type: type || 'home',
      isDefault,
    };

    await userDoc.save();

    logger.info('Address updated', { userId: user._id, addressId, addressLabel: label });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: userDoc.addresses[addressIndex],
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await protect(req);
    const { id: addressId } = await params;

    const userDoc = await User.findById(user._id);
    
    if (!userDoc) {
      throw new ErrorResponse("User not found", 404);
    }

    const addressIndex = userDoc.addresses.findIndex((addr: any) => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      throw new ErrorResponse("Address not found", 404);
    }

    const wasDefault = userDoc.addresses[addressIndex].isDefault;
    
    // Remove address
    userDoc.addresses.splice(addressIndex, 1);

    // If deleted address was default, make first remaining address default
    if (wasDefault && userDoc.addresses.length > 0) {
      userDoc.addresses[0].isDefault = true;
    }

    await userDoc.save();

    logger.info('Address deleted', { userId: user._id, addressId });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await protect(req);
    const { id: addressId } = await params;

    const userDoc = await User.findById(user._id);
    
    if (!userDoc) {
      throw new ErrorResponse("User not found", 404);
    }

    const addressIndex = userDoc.addresses.findIndex((addr: any) => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      throw new ErrorResponse("Address not found", 404);
    }

    // Unset all defaults first
    userDoc.addresses.forEach((addr: any) => {
      addr.isDefault = false;
    });

    // Set this address as default
    userDoc.addresses[addressIndex].isDefault = true;

    await userDoc.save();

    logger.info('Default address updated', { userId: user._id, addressId });

    return NextResponse.json({
      success: true,
      message: "Default address updated successfully",
      data: userDoc.addresses[addressIndex],
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}