import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Favorite from "@/models/Favorite";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await connectDB();

    const { productId } = await params;
    const user = await protect(req);

    const favorite = await Favorite.findOneAndDelete({
      user: user._id,
      product: productId,
    });

    if (!favorite) {
      throw new ErrorResponse("Favorite not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from favorites",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await connectDB();

    const { productId } = await params;
    const user = await protect(req);

    const favorite = await Favorite.findOne({
      user: user._id,
      product: productId,
    });

    return NextResponse.json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}