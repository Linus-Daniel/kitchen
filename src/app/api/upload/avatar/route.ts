import { NextRequest, NextResponse } from "next/server";
import { protect, errorHandler, ErrorResponse, updateUserById } from "@/lib/errorHandler";
import connectDB from "@/lib/db";
import { CloudinaryService } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await protect(req);
    
    const formData = await req.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      throw new ErrorResponse("No file provided", 400);
    }

    if (!file.type.startsWith('image/')) {
      throw new ErrorResponse("Please upload a valid image file", 400);
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new ErrorResponse("File size cannot exceed 5MB", 400);
    }

    const uploadResult = await CloudinaryService.uploadAvatar(file);

    // Update avatar in the appropriate model based on user role
    const updatedEntity = await updateUserById(
      user._id,
      user.role,
      { avatar: uploadResult.secure_url }
    );

    if (!updatedEntity) {
      const entityType = user.role === 'vendor' ? 'Vendor' : 'User';
      throw new ErrorResponse(`${entityType} not found`, 404);
    }

    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: uploadResult.secure_url,
        user: updatedEntity,
      },
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}