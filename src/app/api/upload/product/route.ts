import { NextRequest, NextResponse } from "next/server";
import { protect, errorHandler, ErrorResponse } from "@/lib/errorHandler";
import connectDB from "@/lib/db";
import { CloudinaryService } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await protect(req);
    
    
    // Ensure user is vendor or admin
    if (user.role !== 'vendor' && user.role !== 'admin') {
      throw new ErrorResponse("Access denied. Only vendors and admins can upload product images", 403);
    }
    
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      throw new ErrorResponse("No files provided", 400);
    }

    if (files.length > 5) {
      throw new ErrorResponse("Maximum 5 images allowed", 400);
    }

    const uploadPromises = files.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new ErrorResponse(`Invalid file type: ${file.name}. Please upload only image files`, 400);
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new ErrorResponse(`File ${file.name} exceeds 10MB limit`, 400);
      }

      return await CloudinaryService.uploadProductImage(file);
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        images: uploadResults.map(result => ({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        })),
      },
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}