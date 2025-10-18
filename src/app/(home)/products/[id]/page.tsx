"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiPlus, FiMinus, FiStar, FiClock, FiMapPin, FiShare2 } from 'react-icons/fi';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Image from 'next/image';
import Link from 'next/link';

interface ProductOption {
  _id: string;
  name: string;
  choices: Array<{
    name: string;
    price: number;
  }>;
  required: boolean;
  maxSelections: number;
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
    avatar?: string;
    rating: number;
    deliveryTime: string;
    address: string;
  };
  options: ProductOption[];
  rating: number;
  reviewCount: number;
  preparationTime: string;
  isAvailable: boolean;
  tags: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
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
  helpful: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'nutrition'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
      checkFavoriteStatus();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.getProduct(params.id as string);
      setProduct(response);
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.getProductReviews(params.id as string);
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
      setIsFavorite(favorites.some((fav: any) => fav._id === params.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate required options
    const missingOptions = product.options
      .filter(option => option.required)
      .filter(option => !selectedOptions[option._id]);

    if (missingOptions.length > 0) {
      showToast.error(`Please select: ${missingOptions.map(opt => opt.name).join(', ')}`);
      return;
    }

    // Calculate total price with options
    let totalPrice = product.price;
    const selectedOptionsArray = Object.entries(selectedOptions).map(([optionId, choiceName]) => {
      const option = product.options.find(opt => opt._id === optionId);
      const choice = option?.choices.find(c => c.name === choiceName);
      if (choice) {
        totalPrice += choice.price;
      }
      return {
        name: option?.name || '',
        choice: choiceName,
        price: choice?.price || 0
      };
    });

    addItem({
      id: product._id,
      name: product.name,
      price: totalPrice,
      quantity,
      image: product.images[0],
      vendor: product.vendor._id,
      vendorName: product.vendor.name,
      selectedOptions: selectedOptionsArray
    });

    showToast.success(`${product.name} added to cart!`);
  };

  const toggleFavorite = async () => {
    if (!user) {
      showToast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await apiClient.removeFavorite(product!._id);
        setIsFavorite(false);
        showToast.success('Removed from favorites');
      } else {
        await apiClient.addFavorite(product!._id);
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
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSkeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <LoadingSkeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <LoadingSkeleton className="h-8 w-3/4" />
              <LoadingSkeleton className="h-6 w-1/2" />
              <LoadingSkeleton className="h-20 w-full" />
              <LoadingSkeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link href="/" className="text-amber-600 hover:text-amber-700">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <FiShare2 size={20} />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'text-red-500 hover:text-red-600 bg-red-50' 
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-96 bg-gray-200 rounded-xl overflow-hidden"
            >
              <Image
                src={product.images[selectedImageIndex] || '/placeholder-food.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">Currently Unavailable</span>
                </div>
              )}
            </motion.div>
            
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-amber-500' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <span className="text-2xl font-bold text-amber-600">
                  ₦{product.price.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <FiStar className="text-yellow-400" fill="currentColor" size={16} />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-gray-500">({product.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <FiClock size={16} />
                  <span>{product.preparationTime}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{product.description}</p>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <Link href={`/vendors/${product.vendor._id}`} className="block hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    {product.vendor.avatar && (
                      <Image
                        src={product.vendor.avatar}
                        alt={product.vendor.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.vendor.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-400" fill="currentColor" size={14} />
                        <span>{product.vendor.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock size={14} />
                        <span>{product.vendor.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FiMapPin size={14} />
                      <span>{product.vendor.address}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Options */}
            {product.options.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customize your order</h3>
                {product.options.map((option) => (
                  <div key={option._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {option.name}
                        {option.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {option.maxSelections > 1 && (
                        <span className="text-sm text-gray-500">
                          Select up to {option.maxSelections}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {option.choices.map((choice) => (
                        <label
                          key={choice.name}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={option._id}
                              value={choice.name}
                              checked={selectedOptions[option._id] === choice.name}
                              onChange={(e) => setSelectedOptions(prev => ({
                                ...prev,
                                [option._id]: e.target.value
                              }))}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <span>{choice.name}</span>
                          </div>
                          {choice.price > 0 && (
                            <span className="text-amber-600 font-medium">
                              +₦{choice.price.toLocaleString()}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                  product.isAvailable
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.isAvailable 
                  ? `Add to Cart - ₦${(product.price * quantity + Object.entries(selectedOptions).reduce((total, [optionId, choiceName]) => {
                      const option = product.options.find(opt => opt._id === optionId);
                      const choice = option?.choices.find(c => c.name === choiceName);
                      return total + (choice?.price || 0);
                    }, 0)).toLocaleString()}`
                  : 'Currently Unavailable'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'details', label: 'Details' },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
                ...(product.nutritionalInfo ? [{ id: 'nutrition', label: 'Nutrition' }] : [])
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

          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="prose max-w-none"
                >
                  <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Category</h4>
                      <p className="text-gray-600">{product.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Preparation Time</h4>
                      <p className="text-gray-600">{product.preparationTime}</p>
                    </div>
                  </div>
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
                        <span className="font-medium">{product.rating}</span>
                      </div>
                      <span className="text-gray-500">({product.reviewCount} reviews)</span>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                              {review.user.avatar && (
                                <Image
                                  src={review.user.avatar}
                                  alt={review.user.name}
                                  width={40}
                                  height={40}
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
                              <p className="text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'nutrition' && product.nutritionalInfo && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-lg font-semibold mb-6">Nutritional Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{product.nutritionalInfo.calories}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{product.nutritionalInfo.protein}g</div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{product.nutritionalInfo.carbs}g</div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{product.nutritionalInfo.fat}g</div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}