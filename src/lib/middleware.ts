import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
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
