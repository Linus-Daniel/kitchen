import { getProducts, getCategories, ServerProduct } from "@/lib/server-actions";
import StorePageClient from "./StorePageClient";

interface StorePageWrapperProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    dietary?: string;
  }>;
}

export default async function StorePageWrapper({ searchParams }: StorePageWrapperProps) {
  const params = await searchParams;
  const filters = {
    category: params?.category || 'all',
    search: params?.search || '',
    page: params?.page ? parseInt(params.page) : 1,
    minPrice: params?.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params?.maxPrice ? parseFloat(params.maxPrice) : undefined,
    rating: params?.rating ? parseFloat(params.rating) : undefined,
    dietary: params?.dietary ? params.dietary.split(',') : [],
    limit: 12,
  };

  try {
    const [productsData, categories] = await Promise.all([
      getProducts(filters),
      getCategories(),
    ]);

    return (
      <StorePageClient
        initialProducts={productsData.products}
        initialPagination={{
          page: filters.page,
          limit: filters.limit,
          total: productsData.total,
          count: productsData.count,
        }}
        initialFilters={filters}
        availableCategories={categories}
        availableFilters={productsData.filters}
      />
    );
  } catch (error) {
    console.error('Error in StorePageWrapper:', error);
    return (
      <StorePageClient
        initialProducts={[]}
        initialPagination={{ page: 1, limit: 12, total: 0, count: 0 }}
        initialFilters={filters}
        availableCategories={[]}
        availableFilters={{ categories: [], priceRange: { minPrice: 0, maxPrice: 100 } }}
        error="Failed to load products. Please try again later."
      />
    );
  }
}