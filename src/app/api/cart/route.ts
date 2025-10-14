import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    const cart = await Cart.findOne({ user: user._id }).populate(
      "items.product"
    );

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: { items: [], totalPrice: 0 },
      });
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { productId, quantity, selectedOptions } = await req.json();

    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = new Cart({
        user: user._id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) =>
        item.product.toString() === productId &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        selectedOptions,
        price: product.price,
      });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    const cart = await Cart.findOneAndUpdate(
      { user: user._id },
      { $set: { items: [], totalPrice: 0 } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
