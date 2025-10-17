import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import Blog from "@/models/Blog";
import { errorHandler } from "@/lib/errorHandler";
import { searchService } from "@/lib/search";
import { validateRequest } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Enhanced search schema
const searchSchema = z.object({
  q: z.string().max(100, 'Search query must not exceed 100 characters').optional(),
  type: z.enum(['products', 'vendors', 'blogs', 'all']).default('all'),
  category: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  rating: z.string().transform(Number).pipe(z.number().min(0).max(5)).optional(),
  availability: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['relevance', 'name', 'price', 'rating', 'createdAt']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).default(10),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Validate and parse search parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validatedData = searchSchema.parse(searchParams);

    const {
      q,
      type,
      category,
      minPrice,
      maxPrice,
      rating,
      availability,
      sortBy,
      sortOrder,
      page,
      limit,
    } = validatedData;

    logger.info('Enhanced search request', {
      query: q,
      type,
      page,
      limit,
      filters: { category, minPrice, maxPrice, rating, availability },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });

    const results: any = {};

    if (type === "all" || type === "products") {
      const filters: any = { isAvailable: true };
      
      // Add category filter
      if (category) filters.category = category;
      
      // Add price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        filters.price = {};
        if (minPrice !== undefined) filters.price.$gte = minPrice;
        if (maxPrice !== undefined) filters.price.$lte = maxPrice;
      }
      
      // Add rating filter
      if (rating !== undefined) filters.rating = { $gte: rating };

      // Add availability filter if specified
      if (availability !== undefined) filters.isAvailable = availability;

      const productResults = await searchService.search(Product, {
        query: q,
        filters,
        sort: buildSort(sortBy, sortOrder),
        page: type === "products" ? page : 1,
        limit: type === "products" ? limit : 5,
        facets: ['category', 'rating'],
      });

      results.products = {
        data: productResults.data,
        count: productResults.data.length,
        total: productResults.total,
        page: productResults.page,
        pages: productResults.pages,
        facets: productResults.facets,
        searchTime: productResults.searchTime,
      };
    }

    if (type === "all" || type === "vendors") {
      const filters: any = { isActive: true };
      
      const vendorResults = await searchService.search(Vendor, {
        query: q,
        filters,
        sort: { rating: -1, createdAt: -1 },
        page: type === "vendors" ? page : 1,
        limit: type === "vendors" ? limit : 5,
        facets: ['cuisineType'],
      });

      results.vendors = {
        data: vendorResults.data,
        count: vendorResults.data.length,
        total: vendorResults.total,
        page: vendorResults.page,
        pages: vendorResults.pages,
        facets: vendorResults.facets,
        searchTime: vendorResults.searchTime,
      };
    }

    if (type === "all" || type === "blogs") {
      const blogResults = await searchService.search(Blog, {
        query: q,
        filters: {},
        sort: { date: -1 },
        page: type === "blogs" ? page : 1,
        limit: type === "blogs" ? limit : 3,
        facets: ['category'],
      });

      results.blogs = {
        data: blogResults.data,
        count: blogResults.data.length,
        total: blogResults.total,
        page: blogResults.page,
        pages: blogResults.pages,
        facets: blogResults.facets,
        searchTime: blogResults.searchTime,
      };
    }

    const totalSearchTime = Object.values(results).reduce(
      (sum: number, result: any) => sum + (result.searchTime || 0), 
      0
    );

    return NextResponse.json({
      success: true,
      query: q,
      type,
      data: results,
      totalSearchTime,
      pagination: type !== 'all' ? {
        page,
        limit,
        total: results[type]?.total || 0,
        pages: results[type]?.pages || 0,
      } : undefined,
    });
  } catch (error) {
    const err = error as Error
    logger.error('Search API error', {
      error: err.message,
      stack: err.stack,
      searchParams: req.nextUrl.searchParams.toString(),
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: error.issues,
      }, { status: 400 });
    }

    return errorHandler(error as any, req);
  }
}

// Helper function to build sort object
function buildSort(sortBy: string, sortOrder: string): Record<string, 1 | -1> {
  const order = sortOrder === 'asc' ? 1 : -1;
  
  switch (sortBy) {
    case 'name':
      return { name: order };
    case 'price':
      return { price: order };
    case 'rating':
      return { rating: order };
    case 'createdAt':
      return { createdAt: order };
    case 'relevance':
    default:
      return { createdAt: -1 }; // Default sort by newest
  }
}