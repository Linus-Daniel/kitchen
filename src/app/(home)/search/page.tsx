"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiMapPin, FiStar, 
  FiClock, FiHeart, FiShoppingCart, FiX, FiSliders
} from 'react-icons/fi';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  type: 'product' | 'vendor';
  data: Product | Vendor;
  relevanceScore: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vendor: {
    _id: string;
    name: string;
    rating: number;
    deliveryTime: string;
  };
  rating: number;
  reviewCount: number;
  preparationTime: string;
  isAvailable: boolean;
  tags: string[];
}

interface Vendor {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  address: string;
  cuisine: string[];
  isOpen: boolean;
  productCount: number;
}

interface SearchFilters {
  type: 'all' | 'products' | 'vendors';
  category: string;
  priceRange: [number, number];
  rating: number;
  isOpen: boolean;
  sortBy: 'relevance' | 'rating' | 'price' | 'distance';
}

const POPULAR_SEARCHES = [
  'Pizza', 'Burger', 'Sushi', 'Chinese', 'Indian', 'Italian', 
  'Chicken', 'Salad', 'Dessert', 'Coffee', 'Fast Food', 'Healthy'
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    category: 'all',
    priceRange: [0, 999999],
    rating: 0,
    isOpen: false,
    sortBy: 'relevance'
  });

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      params.append('type', filters.type);
      params.append('sortBy', filters.sortBy);
      
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.rating > 0) params.append('minRating', filters.rating.toString());
      if (filters.isOpen) params.append('isOpen', 'true');
      if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 999999) params.append('maxPrice', filters.priceRange[1].toString());

      const response = await apiClient.get(`/search?${params.toString()}`);
      setResults(response.data || []);
      
      // Save to recent searches
      saveRecentSearch(searchQuery);
      
    } catch (error) {
      console.error('Search error:', error);
      showToast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      vendor: product.vendor._id,
      vendorName: product.vendor.name,
      selectedOptions: []
    });

    showToast.success(`${product.name} added to cart!`);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-32 h-32' : 'h-48'} bg-gray-200`}>
        <Image
          src={product.images[0] || '/placeholder-food.jpg'}
          alt={product.name}
          fill
          className="object-cover"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-sm font-medium">Unavailable</span>
          </div>
        )}
        <button className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100">
          <FiHeart size={16} className="text-gray-600" />
        </button>
      </div>
      
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-amber-600">
              {product.name}
            </h3>
          </Link>
          <span className="text-lg font-bold text-amber-600">
            ₦{product.price.toLocaleString()}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FiStar className="text-yellow-400" fill="currentColor" size={14} />
            <span>{product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock size={14} />
            <span>{product.preparationTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/vendors/${product.vendor._id}`}
            className="text-sm text-gray-600 hover:text-amber-600"
          >
            {product.vendor.name}
          </Link>
          <button
            onClick={() => handleAddToCart(product)}
            disabled={!product.isAvailable}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              product.isAvailable
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );

  const VendorCard = ({ vendor }: { vendor: Vendor }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-32 bg-gray-200">
        <Image
          src={vendor.avatar || '/placeholder-restaurant.jpg'}
          alt={vendor.name}
          fill
          className="object-cover"
        />
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${
          vendor.isOpen 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {vendor.isOpen ? 'Open' : 'Closed'}
        </div>
        <button className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100">
          <FiHeart size={16} className="text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <Link href={`/vendors/${vendor._id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-amber-600">
            {vendor.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{vendor.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FiStar className="text-yellow-400" fill="currentColor" size={14} />
            <span>{vendor.rating}</span>
            <span>({vendor.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock size={14} />
            <span>{vendor.deliveryTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {vendor.cuisine.slice(0, 3).map((cuisine, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {cuisine}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Min. order: </span>
            <span className="font-medium">₦{vendor.minimumOrder.toLocaleString()}</span>
          </div>
          <div>
            <span className="font-medium">{vendor.productCount} items</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const productsCount = results.filter(r => r.type === 'product').length;
  const vendorsCount = results.filter(r => r.type === 'vendor').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for food, restaurants..."
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-3 py-2 font-medium">Suggestions</div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                            router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                        >
                          <FiSearch size={14} className="text-gray-400" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {recentSearches.length > 0 && searchQuery.length === 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 px-3 py-2 font-medium">Recent Searches</div>
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(search);
                            setShowSuggestions(false);
                            router.push(`/search?q=${encodeURIComponent(search)}`);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                        >
                          <FiClock size={14} className="text-gray-400" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 px-3 py-2 font-medium">Popular Searches</div>
                    <div className="flex flex-wrap gap-2 px-3 pb-2">
                      {POPULAR_SEARCHES.slice(0, 6).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(search);
                            setShowSuggestions(false);
                            router.push(`/search?q=${encodeURIComponent(search)}`);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Results Header */}
        {searchQuery && (
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search results for "{searchQuery}"
              </h1>
              <p className="text-gray-600">
                {results.length} results ({productsCount} products, {vendorsCount} restaurants)
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Results</option>
                <option value="products">Products ({productsCount})</option>
                <option value="vendors">Restaurants ({vendorsCount})</option>
              </select>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Price</option>
                <option value="distance">Distance</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiList size={16} />
                </button>
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiSliders size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} className={viewMode === 'grid' ? "h-64 rounded-lg" : "h-32 rounded-lg"} />
            ))}
          </div>
        ) : searchQuery && results.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {results
              .filter(result => filters.type === 'all' || result.type === filters.type)
              .map((result, index) => (
                <div key={`${result.type}-${result.data._id}`}>
                  {result.type === 'product' ? (
                    <ProductCard product={result.data as Product} />
                  ) : (
                    <VendorCard vendor={result.data as Vendor} />
                  )}
                </div>
              ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-6">Try searching for something else or browse our categories</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {POPULAR_SEARCHES.slice(0, 8).map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    router.push(`/search?q=${encodeURIComponent(search)}`);
                  }}
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 text-sm"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">What are you craving?</h3>
            <p className="text-gray-500 mb-6">Search for your favorite food or restaurant</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {POPULAR_SEARCHES.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    router.push(`/search?q=${encodeURIComponent(search)}`);
                  }}
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 text-sm"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click overlay to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}