import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ErrorResponse("Blog post not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);

    if (!["admin", "vendor"].includes(user.role)) {
      throw new ErrorResponse("Access denied. Admin or Vendor privileges required.", 403);
    }

    const { title, content, excerpt, category, readTime, imageUrl } = await req.json();

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        content,
        excerpt,
        category,
        readTime,
        imageUrl,
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      throw new ErrorResponse("Blog post not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await protect(req);

    if (!["admin", "vendor"].includes(user.role)) {
      throw new ErrorResponse("Access denied. Admin or Vendor privileges required.", 403);
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      throw new ErrorResponse("Blog post not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}