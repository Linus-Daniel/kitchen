import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get unique categories from products
    const categories = await Product.distinct("category", {
      isAvailable: true,
    });

    // Predefined categories with icons and metadata
    const categoryMetadata = {
      "appetizers": { icon: "🥗", description: "Light bites and starters" },
      "main-course": { icon: "🍽️", description: "Full meals and entrees" },
      "desserts": { icon: "🍰", description: "Sweet treats and desserts" },
      "beverages": { icon: "🥤", description: "Drinks and beverages" },
      "salads": { icon: "🥗", description: "Fresh salads and greens" },
      "pizza": { icon: "🍕", description: "Fresh pizzas" },
      "burgers": { icon: "🍔", description: "Burgers and sandwiches" },
      "pasta": { icon: "🍝", description: "Pasta dishes" },
      "seafood": { icon: "🐟", description: "Fish and seafood" },
      "vegetarian": { icon: "🌱", description: "Vegetarian dishes" },
      "vegan": { icon: "🌿", description: "Plant-based meals" }
    };

    const enrichedCategories = categories.map(category => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      ...categoryMetadata[category as keyof typeof categoryMetadata],
      productCount: 0 // Will be populated in a separate call if needed
    }));

    return NextResponse.json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const admin = await protect(req);
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { name, icon, description } = await req.json();

    // For now, categories are managed through products
    // In the future, you could create a separate Category model
    
    return NextResponse.json({
      success: true,
      message: "Category management through product creation",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}