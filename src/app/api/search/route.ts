import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import Blog from "@/models/Blog";
import { errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "10") || 10;

    if (!query) {
      return NextResponse.json({
        success: false,
        message: "Search query is required",
      }, { status: 400 });
    }

    const searchRegex = { $regex: query, $options: "i" };
    const results: any = {};

    if (type === "all" || type === "products") {
      const products = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
        isAvailable: true,
      })
        .populate("vendor", "businessName rating logo")
        .limit(type === "products" ? limit : 5)
        .skip(type === "products" ? (page - 1) * limit : 0)
        .sort({ rating: -1, createdAt: -1 });

      results.products = {
        data: products,
        count: products.length,
        total: type === "products" ? await Product.countDocuments({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
          ],
          isAvailable: true,
        }) : products.length,
      };
    }

    if (type === "all" || type === "vendors") {
      const vendors = await Vendor.find({
        $or: [
          { businessName: searchRegex },
          { description: searchRegex },
          { cuisineType: { $in: [searchRegex] } },
        ],
        isActive: true,
      })
        .limit(type === "vendors" ? limit : 5)
        .skip(type === "vendors" ? (page - 1) * limit : 0)
        .sort({ rating: -1, createdAt: -1 });

      results.vendors = {
        data: vendors,
        count: vendors.length,
        total: type === "vendors" ? await Vendor.countDocuments({
          $or: [
            { businessName: searchRegex },
            { description: searchRegex },
            { cuisineType: { $in: [searchRegex] } },
          ],
          isActive: true,
        }) : vendors.length,
      };
    }

    if (type === "all" || type === "blogs") {
      const blogs = await Blog.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex },
          { category: searchRegex },
        ],
      })
        .limit(type === "blogs" ? limit : 3)
        .skip(type === "blogs" ? (page - 1) * limit : 0)
        .sort({ date: -1 });

      results.blogs = {
        data: blogs,
        count: blogs.length,
        total: type === "blogs" ? await Blog.countDocuments({
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { excerpt: searchRegex },
            { category: searchRegex },
          ],
        }) : blogs.length,
      };
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      data: results,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}