import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    await connectDB();

    const { itemId } = await params;
    const user = await protect(req);
    const { quantity } = await req.json();

    if (quantity < 1) {
      throw new ErrorResponse("Quantity must be at least 1", 400);
    }

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      throw new ErrorResponse("Cart not found", 404);
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new ErrorResponse("Item not found in cart", 404);
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate("items.product", "name price images");

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    await connectDB();

    const { itemId } = await params;
    const user = await protect(req);

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      throw new ErrorResponse("Cart not found", 404);
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);

    if (cart.items.length === initialLength) {
      throw new ErrorResponse("Item not found in cart", 404);
    }

    await cart.save();
    await cart.populate("items.product", "name price images");

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}