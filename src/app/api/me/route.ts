import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import { protect, vendorProtect, errorHandler } from "@/lib/errorHandler";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let token;
    if (req.headers.get("authorization")?.startsWith("Bearer")) {
      token = req.headers.get("authorization")!.split(" ")[1];
    }

    if (!token) {
      throw new Error("Not authorized to access this route");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    let userData;

    // Check if it's a vendor token
    if (decoded.role === "vendor") {
      const vendor = await vendorProtect(req);
      userData = await Vendor.findById(vendor._id);
    } else {
      // Regular user
      const user = await protect(req);
      userData = await User.findById(user._id);
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
