import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Favorite from "@/models/Favorite";
import Product from "@/models/Product";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "12") || 12;

    const favorites = await Favorite.find({ user: user._id })
      .populate({
        path: "product",
        populate: {
          path: "vendor",
          select: "businessName rating logo",
        },
      })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Favorite.countDocuments({ user: user._id });

    return NextResponse.json({
      success: true,
      count: favorites.length,
      total,
      data: favorites,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { productId } = await req.json();

    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: user._id,
      product: productId,
    });

    if (existingFavorite) {
      throw new ErrorResponse("Product already in favorites", 400);
    }

    const favorite = await Favorite.create({
      user: user._id,
      product: productId,
    });

    await favorite.populate("product", "name price images");

    return NextResponse.json(
      {
        success: true,
        data: favorite,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}