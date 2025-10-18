"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiStar, FiClock, FiMapPin, FiPhone, FiHeart, 
  FiShare2, FiFilter, FiSearch, FiGrid, FiList, FiInfo
} from 'react-icons/fi';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Image from 'next/image';
import Link from 'next/link';

interface Vendor {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  address: string;
  phone: string;
  email: string;
  cuisine: string[];
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  isOpen: boolean;
  tags: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  preparationTime: string;
  isAvailable: boolean;
  tags: string[];
}

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  order: {
    items: string[];
  };
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCartStore();
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFavorite, setIsFavorite] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (params.id) {
      fetchVendor();
      fetchProducts();
      fetchReviews();
      checkFavoriteStatus();
    }
  }, [params.id]);

  const fetchVendor = async () => {
    try {
      const response = await apiClient.get(`/vendors/${params.id}`);
      setVendor(response.data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      showToast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await apiClient.get(`/vendors/${params.id}/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/vendors/${params.id}/reviews`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;
    try {
      const response = await apiClient.getFavorites();
      const favorites = response.data || [];
      setIsFavorite(favorites.some((fav: any) => fav.vendor === params.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showToast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await apiClient.delete(`/favorites/vendor/${vendor!._id}`);
        setIsFavorite(false);
        showToast.success('Removed from favorites');
      } else {
        await apiClient.post(`/favorites/vendor/${vendor!._id}`);
        setIsFavorite(true);
        showToast.success('Added to favorites');
      }
    } catch (error) {
      showToast.error('Failed to update favorites');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.name,
          text: vendor?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success('Link copied to clipboard');
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      vendor: vendor!._id,
      vendorName: vendor!.name,
      selectedOptions: []
    });

    showToast.success(`${product.name} added to cart!`);
  };

  const getCurrentStatus = () => {
    if (!vendor) return { isOpen: false, message: '' };
    
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3); // mon, tue, etc
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM
    
    const todayHours = vendor.operatingHours[currentDay];
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, message: 'Closed today' };
    }

    const isCurrentlyOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
    if (isCurrentlyOpen) {
      return { isOpen: true, message: `Open until ${todayHours.close}` };
    } else {
      return { isOpen: false, message: `Opens at ${todayHours.open}` };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSkeleton className="h-64 w-full" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSkeleton className="h-8 w-1/2 mb-4" />
          <LoadingSkeleton className="h-6 w-3/4 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <Link href="/" className="text-amber-600 hover:text-amber-700">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const status = getCurrentStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative">
        <div className="h-64 bg-gray-300 overflow-hidden">
          <Image
            src={vendor.banner || '/placeholder-restaurant.jpg'}
            alt={vendor.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>
        
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full"
          >
            <FiArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
            >
              <FiShare2 size={20} />
            </button>
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'text-red-500 bg-white' 
                  : 'text-white bg-black bg-opacity-50 hover:bg-opacity-70'
              }`}
            >
              <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Vendor Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 bg-white rounded-full overflow-hidden border-4 border-white">
                <Image
                  src={vendor.avatar || '/placeholder-avatar.jpg'}
                  alt={vendor.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 text-white mb-2">
                <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-400" fill="currentColor" size={16} />
                    <span className="font-medium">{vendor.rating}</span>
                    <span className="opacity-80">({vendor.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock size={16} />
                    <span>{vendor.deliveryTime}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${status.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span>{status.message}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">₦{vendor.deliveryFee.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Delivery Fee</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">₦{vendor.minimumOrder.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Minimum Order</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{vendor.deliveryTime}</div>
            <div className="text-sm text-gray-600">Delivery Time</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'menu', label: `Menu (${products.length})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
              { id: 'info', label: 'Info' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Menu Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
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

              {/* Products Grid/List */}
              {productsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <LoadingSkeleton key={i} className="h-48 rounded-lg" />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {filteredProducts.map((product) => (
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
                      </div>
                      
                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                          <span className="text-lg font-bold text-amber-600">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FiStar className="text-yellow-400" fill="currentColor" size={14} />
                              <span>{product.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock size={14} />
                              <span>{product.preparationTime}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/products/${product._id}`}
                              className="px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.isAvailable}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                product.isAvailable
                                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found matching your criteria.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-400" fill="currentColor" />
                    <span className="font-medium">{vendor.rating}</span>
                  </div>
                  <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                          {review.user.avatar && (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{review.user.name}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  size={14}
                                  className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                  fill="currentColor"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{review.comment}</p>
                          {review.order.items.length > 0 && (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Ordered: </span>
                              {review.order.items.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Restaurant Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">About</h3>
                    <p className="text-gray-600">{vendor.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cuisine</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.cuisine.map((cuisine, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>

                  {vendor.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Hours */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FiMapPin className="text-gray-400" size={16} />
                        <span className="text-gray-600">{vendor.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiPhone className="text-gray-400" size={16} />
                        <span className="text-gray-600">{vendor.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                    <div className="space-y-2">
                      {Object.entries(vendor.operatingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="capitalize font-medium">{day}</span>
                          <span className="text-gray-600">
                            {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.keys(vendor.socialMedia).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                      <div className="flex gap-3">
                        {vendor.socialMedia.facebook && (
                          <a
                            href={vendor.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                          >
                            f
                          </a>
                        )}
                        {vendor.socialMedia.instagram && (
                          <a
                            href={vendor.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700"
                          >
                            ig
                          </a>
                        )}
                        {vendor.socialMedia.twitter && (
                          <a
                            href={vendor.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500"
                          >
                            tw
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}