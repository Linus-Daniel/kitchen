
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/Vendor";
import { ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      businessName,
      ownerName,
      email,
      password,
      phone,
      description,
      address,
      cuisineType,
    } = await req.json();

    const vendor = await Vendor.create({
      businessName,
      ownerName,
      email,
      password,
      phone,
      description,
      address,
      cuisineType,
    });

    const token = vendor.getJwtToken();

    return NextResponse.json(
      {
        success: true,
        token,
        role: "vendor",
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}