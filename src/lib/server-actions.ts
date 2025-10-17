import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ProductFilters } from "@/lib/api";

export interface ServerProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  vendor: {
    _id: string;
    businessName: string;
    rating: number;
    logo?: string;
    estimatedDeliveryTime?: string;
  };
  rating: number;
  numReviews: number;
  cookTime: string;
  options: Array<{
    name: string;
    choices: string[];
    required: boolean;
  }>;
  ingredients: string[];
  dietary?: string[];
  isAvailable: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getProducts(filters?: ProductFilters): Promise<{
  products: ServerProduct[];
  total: number;
  count: number;
  filters: {
    categories: string[];
    priceRange: { minPrice: number; maxPrice: number };
  };
}> {
  try {
    await connectDB();
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;
    
    let query: any = { isAvailable: true };
    
    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      query.category = { $regex: filters.category, $options: 'i' };
    }
    
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    if (filters?.minPrice || filters?.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    
    if (filters?.minRating) {
      query.rating = { $gte: filters.minRating };
    }
    
    if (filters?.dietary && filters.dietary.length > 0) {
      query.dietary = { $in: filters.dietary };
    }
    
  
    const products = await Product.find({isAvailable:true})
    //   .populate('vendor', 'businessName rating logo estimatedDeliveryTime')
    //   .sort({ salesCount: -1, createdAt: -1 })
    //   .skip(skip)
    //   .limit(limit)
    //   .lean();

      console.log(products)
    
    const total = await Product.countDocuments(query);
    
    // Get filter options
    const [categories, priceRange] = await Promise.all([
      Product.distinct('category'),
      Product.aggregate([
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
      ])
    ]);
    
    return {
      products: JSON.parse(JSON.stringify(products)),
      total,
      count: products.length,
      filters: {
        categories,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000 },
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function getProduct(id: string): Promise<ServerProduct | null> {
  try {
    await connectDB();
    
    const product = await Product.findById(id)
      .populate('vendor', 'businessName rating logo estimatedDeliveryTime')
      .lean();
    
    if (!product) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    await connectDB();
    const categories = await Product.distinct('category');
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}