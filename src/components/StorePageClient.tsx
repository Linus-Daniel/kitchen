"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import StoreHero from "@/components/storeHero";
import CategoryFilter from "@/components/CartegoriesFilter";
import StoreGrid from "@/components/storeGrid";
import CartSidebar from "@/components/CartBar";
import SearchBar from "@/components/searchBar";
import { LuShoppingCart, LuFilter, LuX } from "react-icons/lu";
import { useCart } from "@/hooks/useCart";
import { ServerProduct } from "@/lib/server-actions";

interface FilterOptions {
  priceRange: [number, number];
  dietary: string[];
  rating: number;
  deliveryTime: number;
}

interface StorePageClientProps {
  initialProducts: ServerProduct[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    count: number;
  };
  initialFilters: any;
  availableCategories: string[];
  availableFilters: {
    categories: string[];
    priceRange: { minPrice: number; maxPrice: number };
  };
  error?: string;
}

const StorePageClient = ({
  initialProducts,
  initialPagination,
  initialFilters,
  availableCategories,
  availableFilters,
  error,
}: StorePageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category || "all");
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.search || "");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { cartCount } = useCart();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    priceRange: [
      initialFilters.minPrice || availableFilters.priceRange.minPrice,
      initialFilters.maxPrice || availableFilters.priceRange.maxPrice
    ],
    dietary: initialFilters.dietary || [],
    rating: initialFilters.rating || 0,
    deliveryTime: 60,
  });

  // Update URL with current filters
  const updateURL = useCallback((newFilters: any) => {
    const params = new URLSearchParams();
    
    if (newFilters.category && newFilters.category !== 'all') {
      params.set('category', newFilters.category);
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.minPrice) {
      params.set('minPrice', newFilters.minPrice.toString());
    }
    if (newFilters.maxPrice) {
      params.set('maxPrice', newFilters.maxPrice.toString());
    }
    if (newFilters.rating) {
      params.set('rating', newFilters.rating.toString());
    }
    if (newFilters.dietary && newFilters.dietary.length > 0) {
      params.set('dietary', newFilters.dietary.join(','));
    }
    
    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newURL, { scroll: false });
  }, [router]);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    updateURL({
      category,
      search: searchQuery,
      minPrice: filterOptions.priceRange[0] > availableFilters.priceRange.minPrice ? filterOptions.priceRange[0] : undefined,
      maxPrice: filterOptions.priceRange[1] < availableFilters.priceRange.maxPrice ? filterOptions.priceRange[1] : undefined,
      rating: filterOptions.rating > 0 ? filterOptions.rating : undefined,
      dietary: filterOptions.dietary,
    });
  }, [searchQuery, filterOptions, availableFilters, updateURL]);

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    updateURL({
      category: selectedCategory,
      search: query,
      minPrice: filterOptions.priceRange[0] > availableFilters.priceRange.minPrice ? filterOptions.priceRange[0] : undefined,
      maxPrice: filterOptions.priceRange[1] < availableFilters.priceRange.maxPrice ? filterOptions.priceRange[1] : undefined,
      rating: filterOptions.rating > 0 ? filterOptions.rating : undefined,
      dietary: filterOptions.dietary,
    });
  }, [selectedCategory, filterOptions, availableFilters, updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterOptions({
      priceRange: [availableFilters.priceRange.minPrice, availableFilters.priceRange.maxPrice],
      dietary: [],
      rating: 0,
      deliveryTime: 60,
    });
    setSearchQuery("");
    setSelectedCategory("all");
    router.push('/', { scroll: false });
  }, [availableFilters, router]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      selectedCategory !== "all" ||
      filterOptions.priceRange[0] > availableFilters.priceRange.minPrice ||
      filterOptions.priceRange[1] < availableFilters.priceRange.maxPrice ||
      filterOptions.dietary.length > 0 ||
      filterOptions.rating > 0 ||
      filterOptions.deliveryTime < 60
    );
  }, [searchQuery, selectedCategory, filterOptions, availableFilters]);

  // Debounced filter updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL({
        category: selectedCategory,
        search: searchQuery,
        minPrice: filterOptions.priceRange[0] > availableFilters.priceRange.minPrice ? filterOptions.priceRange[0] : undefined,
        maxPrice: filterOptions.priceRange[1] < availableFilters.priceRange.maxPrice ? filterOptions.priceRange[1] : undefined,
        rating: filterOptions.rating > 0 ? filterOptions.rating : undefined,
        dietary: filterOptions.dietary,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterOptions, selectedCategory, searchQuery, availableFilters, updateURL]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>FoodExpress - Discover Delicious Meals</title>
        <meta
          name="description"
          content="Browse our delicious menu with advanced search and filtering options"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <StoreHero />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Search and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
            <p className="text-gray-600">
              Discover delicious meals from top restaurants
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              placeholder="Search dishes, restaurants..."
              className="flex-1"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  showFilters || hasActiveFilters
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-white border-gray-300 text-gray-700 hover:border-amber-300"
                }`}
              >
                <LuFilter size={18} />
                Filters
                {hasActiveFilters && (
                  <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  <LuX size={18} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    ${filterOptions.priceRange[0]}
                  </span>
                  <input
                    type="range"
                    min={availableFilters.priceRange.minPrice}
                    max={availableFilters.priceRange.maxPrice}
                    value={filterOptions.priceRange[1]}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        priceRange: [
                          prev.priceRange[0],
                          parseInt(e.target.value),
                        ],
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">
                    ${filterOptions.priceRange[1]}+
                  </span>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Spicy"].map(
                    (diet) => (
                      <button
                        key={diet}
                        onClick={() =>
                          setFilterOptions((prev) => ({
                            ...prev,
                            dietary: prev.dietary.includes(diet)
                              ? prev.dietary.filter((d) => d !== diet)
                              : [...prev.dietary, diet],
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          filterOptions.dietary.includes(diet)
                            ? "bg-green-100 border-green-300 text-green-700"
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:border-green-300"
                        }`}
                      >
                        {diet}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filterOptions.rating}
                  onChange={(e) =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      rating: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4★ & above</option>
                  <option value={3}>3★ & above</option>
                  <option value={2}>2★ & above</option>
                </select>
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Delivery Time
                </label>
                <select
                  value={filterOptions.deliveryTime}
                  onChange={(e) =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      deliveryTime: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value={60}>Any Time</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
            categories={availableCategories}
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Search: "{searchQuery}"
                <button
                  onClick={() => handleSearchChange("")}
                  className="hover:text-blue-900"
                >
                  <LuX size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Store Grid */}
        <StoreGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          openCart={() => setIsCartOpen(true)}
          showFavorites={true}
          filterOptions={filterOptions}
          initialProducts={initialProducts}
          serverSide={true}
        />
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Enhanced Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-all transform hover:scale-105 z-40 flex items-center gap-2 group"
        aria-label="Open cart"
      >
        <LuShoppingCart size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>
    </>
  );
};

export default StorePageClient;