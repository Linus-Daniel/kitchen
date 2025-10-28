import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "10") || 10;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: blogs.length,
      total,
      data: blogs,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await protect(req);

    if (!["admin", "vendor"].includes(user.role)) {
      throw new ErrorResponse("Access denied. Admin or Vendor privileges required.", 403);
    }

    const { title, content, excerpt, category, readTime, imageUrl } = await req.json();

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      category,
      readTime,
      imageUrl,
      author: 'name' in user ? user.name : user.businessName,
    });

    return NextResponse.json(
      {
        success: true,
        data: blog,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}