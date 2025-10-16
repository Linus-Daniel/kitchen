import StorePageWrapper from "@/components/StorePageWrapper";

interface StorePageProps {
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

export default function StorePage({ searchParams }: StorePageProps) {
  return <StorePageWrapper searchParams={searchParams} />;
}