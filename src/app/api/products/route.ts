import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { vendorProtect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // // DEBUG: Log all search params
    // console.log("=== SEARCH PARAMS ===");
    // searchParams.forEach((value, key) => {
    //   console.log(`${key}: "${value}" (type: ${typeof value})`);
    // });

    // const vendor = searchParams.get("vendor");
    // const category = searchParams.get("category");
    // const search = searchParams.get("search");
    // const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    // const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    // const minRating = parseFloat(searchParams.get("minRating") || "0");
    // const sortBy = searchParams.get("sortBy") || "createdAt";
    // const sortOrder = searchParams.get("sortOrder") || "desc";
    // const page = parseInt(searchParams.get("page") || "1") || 1;
    // const limit = parseInt(searchParams.get("limit") || "12") || 12;

    // let query: any = { isAvailable: true };

    // // DEBUG: Log each condition
    // console.log("vendor:", vendor, "| truthy:", !!vendor);
    // if (vendor) {
    //   console.log("Adding vendor to query:", vendor);
    //   query.vendor = vendor;
    // }

    // console.log("category:", category, "| truthy:", !!category);
    // if (category) {
    //   console.log("Adding category to query:", category);
    //   query.category = category;
    // }

    // if (search) {
    //   console.log("Adding search to query:", search);
    //   query.$or = [
    //     { name: { $regex: search, $options: "i" } },
    //     { description: { $regex: search, $options: "i" } },
    //     { category: { $regex: search, $options: "i" } },
    //   ];
    // }

    // if (minPrice > 0 || maxPrice < 999999) {
    //   console.log("Adding price filter:", minPrice, "-", maxPrice);
    //   query.price = { $gte: minPrice, $lte: maxPrice };
    // }

    // if (minRating > 0) {
    //   console.log("Adding rating filter:", minRating);
    //   query.rating = { $gte: minRating };
    // }

    // console.log("=== FINAL QUERY ===");
    // console.log(JSON.stringify(query, null, 2));

    // const sortObj: any = {};
    // sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const products = await Product.find()
     

    const total = await Product.countDocuments();

    const categories = await Product.distinct("category", {
      isAvailable: true,
    });

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
