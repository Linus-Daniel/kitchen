import { NextResponse } from 'next/server';
import dbConnect from '@/lib/monogodb';
import BlogPost from '@/models/Blog'
export async function GET() {
  try {
    await dbConnect();
    const posts = await BlogPost.find().sort({ date: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Create slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    const post = new BlogPost({ ...body});
    await post.save();
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}