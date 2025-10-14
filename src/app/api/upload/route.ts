import { NextRequest, NextResponse } from "next/server";
import { protect, ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const user = await protect(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "general";

    if (!file) {
      throw new ErrorResponse("No file provided", 400);
    }

    // Validate file type
    const allowedTypes = {
      image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    };

    const isValidType = type === "general" || 
      (allowedTypes.image && allowedTypes.image.includes(file.type)) ||
      (allowedTypes.document && allowedTypes.document.includes(file.type));

    if (!isValidType) {
      throw new ErrorResponse("Invalid file type", 400);
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new ErrorResponse("File size too large. Maximum 10MB allowed.", 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}_${randomString}.${fileExtension}`;

    // In a real application, you would upload to a cloud storage service
    // For this example, we'll simulate the upload and return a mock URL
    const mockUploadUrl = `/uploads/${fileName}`;

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: {
        url: mockUploadUrl,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: user._id,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await protect(req);
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      throw new ErrorResponse("File name is required", 400);
    }

    // In a real application, you would delete from cloud storage
    // For this example, we'll just simulate success

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return errorHandler(error as any, req);
  }
}