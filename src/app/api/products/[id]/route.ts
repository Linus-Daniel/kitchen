import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import {
  vendorProtect,
  adminProtect,
  ErrorResponse,
  errorHandler,
} from "@/lib/errorHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const product = await Product.findById(id).populate(
      "vendor",
      "businessName rating logo"
    );

    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    let product = await Product.findById(id);

    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    // Check if user is admin or vendor who owns the product
    let isAuthorized = false;
    try {
      await adminProtect(req);
      isAuthorized = true; // Admin can edit any product
    } catch (adminError) {
      // If not admin, check if vendor owns the product
      try {
        const vendor = await vendorProtect(req);
        if (product.vendor.toString() === vendor._id.toString()) {
          isAuthorized = true;
        }
      } catch (vendorError) {
        // Neither admin nor vendor
      }
    }

    if (!isAuthorized) {
      throw new ErrorResponse("Not authorized to update this product", 401);
    }

    product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    // Check if user is admin or vendor who owns the product
    let isAuthorized = false;
    try {
      await adminProtect(req);
      isAuthorized = true; // Admin can delete any product
    } catch (adminError) {
      // If not admin, check if vendor owns the product
      try {
        const vendor = await vendorProtect(req);
        if (product.vendor.toString() === vendor._id.toString()) {
          isAuthorized = true;
        }
      } catch (vendorError) {
        // Neither admin nor vendor
      }
    }

    if (!isAuthorized) {
      throw new ErrorResponse("Not authorized to delete this product", 401);
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
