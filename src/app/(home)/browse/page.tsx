"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, FiSearch, FiGrid, FiList, FiMapPin, FiStar, FiClock,
  FiHeart, FiShoppingCart, FiChevronDown, FiX, FiSliders
} from 'react-icons/fi';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
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
    deliveryFee: number;
  };
  rating: number;
  reviewCount: number;
  preparationTime: string;
  isAvailable: boolean;
  tags: string[];
  distance?: number;
}

interface Filters {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  deliveryTime: string;
  sortBy: 'popular' | 'rating' | 'price-low' | 'price-high' | 'delivery-time';
  dietary: string[];
}

const PRICE_RANGES = [
  { label: 'Under ₦1,000', value: [0, 1000] },
  { label: '₦1,000 - ₦2,500', value: [1000, 2500] },
  { label: '₦2,500 - ₦5,000', value: [2500, 5000] },
  { label: 'Over ₦5,000', value: [5000, 999999] },
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Keto', 'Low-Carb'
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'delivery-time', label: 'Fastest Delivery' },
];

export default function BrowsePage() {
  const { user } = useAuth();
  const { addItem } = useCartStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceRange: [0, 999999],
    rating: 0,
    deliveryTime: 'any',
    sortBy: 'popular',
    dietary: []
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [appliedFilters, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (appliedFilters.categories.length > 0) {
        appliedFilters.categories.forEach(cat => params.append('categories', cat));
      }
      if (appliedFilters.priceRange[0] > 0) params.append('minPrice', appliedFilters.priceRange[0].toString());
      if (appliedFilters.priceRange[1] < 999999) params.append('maxPrice', appliedFilters.priceRange[1].toString());
      if (appliedFilters.rating > 0) params.append('minRating', appliedFilters.rating.toString());
      if (appliedFilters.deliveryTime !== 'any') params.append('deliveryTime', appliedFilters.deliveryTime);
      if (appliedFilters.dietary.length > 0) {
        appliedFilters.dietary.forEach(diet => params.append('dietary', diet));
      }
      params.append('sortBy', appliedFilters.sortBy);

      const response = await apiClient.get(`/products?${params.toString()}`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const productForCart = {
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.images[0],
      description: product.description,
      rating: product.rating,
      cookTime: product.preparationTime,
      options: [],
      ingredients: [],
      dietary: product.tags
    };
    addItem(productForCart, 1);

    showToast.success(`${product.name} added to cart!`);
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters: Filters = {
      categories: [],
      priceRange: [0, 999999],
      rating: 0,
      deliveryTime: 'any',
      sortBy: 'popular',
      dietary: []
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.categories.length > 0) count++;
    if (appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 999999) count++;
    if (appliedFilters.rating > 0) count++;
    if (appliedFilters.deliveryTime !== 'any') count++;
    if (appliedFilters.dietary.length > 0) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSkeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Menu</h1>
          <p className="text-gray-600">Discover delicious food from top restaurants</p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedCategory === null
                  ? 'bg-amber-100 border-2 border-amber-500 text-amber-700'
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-medium text-sm">All Items</div>
              <div className="text-xs text-gray-500">{products.length} items</div>
            </button>
            
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-700'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={category.image || '/placeholder-category.jpg'}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="font-medium text-sm">{category.name}</div>
                <div className="text-xs text-gray-500">{category.productCount} items</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for food, restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 relative"
            >
              <FiSliders size={20} />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  {getActiveFilterCount()}
                </div>
              )}
            </button>
            
            <select
              value={appliedFilters.sortBy}
              onChange={(e) => setAppliedFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCategory && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full flex items-center gap-2">
                {categories.find(c => c.slug === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory(null)}>
                  <FiX size={14} />
                </button>
              </span>
            )}
            {getActiveFilterCount() > 0 && (
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Products */}
        {productsLoading ? (
          <div className={viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} className={viewMode === 'grid' ? "h-64 rounded-lg" : "h-32 rounded-lg"} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {products.map((product) => (
              <motion.div
                key={product._id}
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
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100"
                    onClick={() => {/* Toggle favorite */}}
                  >
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Categories Filter */}
                  <div>
                    <h3 className="font-medium mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category.slug)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, category.slug]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(c => c !== category.slug)
                                }));
                              }
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm">{category.name}</span>
                          <span className="text-xs text-gray-500">({category.productCount})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <div className="space-y-2">
                      {PRICE_RANGES.map((range, index) => (
                        <label key={index} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1]}
                            onChange={() => setFilters(prev => ({
                              ...prev,
                              priceRange: range.value as [number, number]
                            }))}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="font-medium mb-3">Minimum Rating</h3>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() => setFilters(prev => ({
                              ...prev,
                              rating
                            }))}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={14}
                                className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                                fill="currentColor"
                              />
                            ))}
                            <span className="text-sm ml-1">& up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Options */}
                  <div>
                    <h3 className="font-medium mb-3">Dietary</h3>
                    <div className="space-y-2">
                      {DIETARY_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.dietary.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  dietary: [...prev.dietary, option]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  dietary: prev.dietary.filter(d => d !== option)
                                }));
                              }
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}