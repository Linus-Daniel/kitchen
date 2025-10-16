import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { IUser, IVendor } from "@/types";

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

export async function protect(req: NextRequest): Promise<IUser> {
  let token;

  if (req.headers.get("authorization")?.startsWith("Bearer")) {
    token = req.headers.get("authorization")!.split(" ")[1];
    
  }

  if (!token) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ErrorResponse("User not found", 401);
    }

    return user;
  } catch (err) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }
}

export async function vendorProtect(req: NextRequest): Promise<IVendor> {
  let token;

  if (req.headers.get("authorization")?.startsWith("Bearer")) {
    token = req.headers.get("authorization")!.split(" ")[1];
  }

  if (!token) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "vendor") {
      throw new ErrorResponse("Not authorized as vendor", 401);
    }

    const vendor = await Vendor.findById(decoded.id);
    if (!vendor) {
      throw new ErrorResponse("Vendor not found", 401);
    }

    return vendor;
  } catch (err) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }
}

export async function adminProtect(req: NextRequest): Promise<IUser> {
  let token;

  if (req.headers.get("authorization")?.startsWith("Bearer")) {
    token = req.headers.get("authorization")!.split(" ")[1];
  }

  if (!token) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "admin") {
      throw new ErrorResponse("Not authorized as admin", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ErrorResponse("Admin user not found", 401);
    }

    return user;
  } catch (err) {
    throw new ErrorResponse("Not authorized to access this route", 401);
  }
}

export function authorize(...roles: string[]) {
  return (user: IUser) => {
    if (!roles.includes(user.role)) {
      throw new ErrorResponse(
        `User role ${user.role} is not authorized to access this route`,
        403
      );
    }
  };
}
