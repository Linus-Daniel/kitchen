import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // adjust path to your next-auth config
import { IUser, IVendor } from "@/types";

// Helper function to get the appropriate model based on role
export function getUserModel(role: string) {
  return role === 'vendor' ? Vendor : User;
}

// Helper function to update user/vendor by ID with role-based model selection
export async function updateUserById(userId: string, role: string, updateData: any, options: any = {}) {
  const Model = getUserModel(role);
  return await Model.findByIdAndUpdate(userId, updateData, { 
    new: true, 
    select: '-password',
    ...options 
  });
}

export class ErrorResponse extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface MongooseError extends Error {
  name: string;
  code?: number;
  errors?: Record<string, { message: string }>;
}

export function errorHandler(err: MongooseError, req: NextRequest, res?: NextResponse) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404) as any;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400) as any;
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400) as any;
  }

  return NextResponse.json({
    success: false,
    error: error.message || "Server Error",
  }, { status: (error as any).statusCode || 500 });
}

export async function protect(req: NextRequest): Promise<IUser | IVendor> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }

  // Check if the user is a vendor first
  if (session.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ email: session.user.email });
    if (!vendor) {
      throw new ErrorResponse("Vendor not found", 401);
    }
    return vendor;
  }

  // Default to regular user lookup
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    throw new ErrorResponse("User not found", 401);
  }

  return user;
}

export async function vendorProtect(req: NextRequest): Promise<IVendor> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email || session.user.role !== "vendor") {
    throw new ErrorResponse("Not authorized as vendor", 401);
  }

  const vendor = await Vendor.findOne({ email: session.user.email });
  if (!vendor) {
    throw new ErrorResponse("Vendor not found", 401);
  }

  return vendor;
}

export async function adminProtect(req: NextRequest): Promise<IUser> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email || session.user.role !== "admin") {
    throw new ErrorResponse("Not authorized as admin", 401);
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    throw new ErrorResponse("Admin user not found", 401);
  }

  return user;
}
