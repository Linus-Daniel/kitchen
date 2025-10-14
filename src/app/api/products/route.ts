import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { vendorProtect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const vendor = searchParams.get("vendor");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "12") || 12;

    let query: any = { isAvailable: true };

    if (vendor) {
      query.vendor = vendor;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Price filtering
    if (minPrice > 0 || maxPrice < 999999) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    // Rating filtering
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const products = await Product.find(query)
      .populate("vendor", "businessName rating logo estimatedDeliveryTime")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortObj);

    const total = await Product.countDocuments(query);

    // Get available categories for filtering
    const categories = await Product.distinct("category", { isAvailable: true });

    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      count: products.length,
      total,
      data: products,
      filters: {
        categories,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      },
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const vendor = await vendorProtect(req);
    const body = await req.json();

    const productData = {
      ...body,
      vendor: vendor._id,
      vendorName: vendor.businessName,
    };

    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
