import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { protect, errorHandler } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const dietaryOptions = [
      { value: "vegetarian", label: "Vegetarian", icon: "🌱", description: "No meat products" },
      { value: "vegan", label: "Vegan", icon: "🌿", description: "No animal products" },
      { value: "gluten-free", label: "Gluten Free", icon: "🌾", description: "No gluten ingredients" },
      { value: "dairy-free", label: "Dairy Free", icon: "🥛", description: "No dairy products" },
      { value: "nut-free", label: "Nut Free", icon: "🥜", description: "No nuts or nut products" },
      { value: "halal", label: "Halal", icon: "☪️", description: "Prepared according to Islamic law" },
      { value: "kosher", label: "Kosher", icon: "✡️", description: "Prepared according to Jewish law" },
      { value: "organic", label: "Organic", icon: "🌿", description: "Organically grown ingredients" },
      { value: "spicy", label: "Spicy", icon: "🌶️", description: "Contains spicy ingredients" },
      { value: "low-carb", label: "Low Carb", icon: "💪", description: "Low carbohydrate content" },
      { value: "keto", label: "Keto Friendly", icon: "🥑", description: "Ketogenic diet friendly" },
      { value: "paleo", label: "Paleo", icon: "🦴", description: "Paleolithic diet friendly" },
    ];

    return NextResponse.json({
      success: true,
      data: dietaryOptions,
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

    const { value, label, icon, description } = await req.json();

    // Store in database or configuration
    // For now, returning success
    
    return NextResponse.json({
      success: true,
      message: "Dietary option management feature",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}