import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);
    const { productId, orderId, rating, comment, images } = await req.json();

    // Validate the order exists and belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    if (order.user.toString() !== user._id.toString()) {
      throw new ErrorResponse("Not authorized to review this order", 401);
    }

    // Check if order contains the product
    const hasProduct = order.orderItems.some(
      (item: any) => item.product.toString() === productId
    );

    if (!hasProduct) {
      throw new ErrorResponse("Product not found in this order", 400);
    }

    // Get product and vendor information
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: user._id,
      product: productId,
      order: orderId,
    });

    if (existingReview) {
      throw new ErrorResponse("Review already exists for this product", 400);
    }

    const review = await Review.create({
      user: user._id,
      product: productId,
      vendor: product.vendor,
      order: orderId,
      rating,
      comment,
      images: images || [],
    });

    await review.populate("user", "name");

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      numReviews: reviews.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const vendorId = searchParams.get("vendorId");
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "10") || 10;
    const rating = searchParams.get("rating");

    let query: any = {};

    if (productId) {
      query.product = productId;
    }

    if (vendorId) {
      query.vendor = vendorId;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate("user", "name")
      .populate("product", "name images")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: reviews.length,
      total,
      data: reviews,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}