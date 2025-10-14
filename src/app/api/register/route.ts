import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { ErrorResponse, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, phone } = await req.json();

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    const token = user.getJwtToken();

    return NextResponse.json(
      {
        success: true,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as any, req);
  }
}
