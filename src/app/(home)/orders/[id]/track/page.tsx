"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiMapPin, FiClock, FiPhone, FiMessageCircle, 
  FiCheck, FiPackage, FiTruck, FiHome, FiStar, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  selectedOptions: Array<{
    name: string;
    choice: string;
  }>;
}

interface VendorOrder {
  vendor: {
    _id: string;
    name: string;
    avatar: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'delivered' | 'cancelled';
  estimatedTime: string;
  subtotal: number;
}

interface Order {
  _id: string;
  user: {
    name: string;
    phone: string;
  };
  vendorOrders: VendorOrder[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';
  totalPrice: number;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  createdAt: string;
  paidAt: string;
  deliveredAt?: string;
  specialInstructions?: string;
  driver?: {
    _id: string;
    name: string;
    phone: string;
    avatar: string;
    vehicle: {
      type: string;
      plateNumber: string;
    };
    location: {
      lat: number;
      lng: number;
    };
  };
  timeline: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
}

const ORDER_STATUSES = {
  pending: { label: 'Order Placed', icon: FiPackage, color: 'text-blue-600' },
  confirmed: { label: 'Confirmed', icon: FiCheck, color: 'text-green-600' },
  processing: { label: 'Preparing', icon: FiClock, color: 'text-orange-600' },
  ready: { label: 'Ready for Pickup', icon: FiPackage, color: 'text-purple-600' },
  completed: { label: 'Delivered', icon: FiHome, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: FiRefreshCw, color: 'text-red-600' }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'items' | 'contact'>('timeline');

  useEffect(() => {
    if (params.id) {
      fetchOrder();
      // Set up polling for real-time updates
      const interval = setInterval(fetchOrder, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [params.id]);

  const fetchOrder = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(!showLoader);
      
      const response = await apiClient.get(`/orders/${params.id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      showToast.error('Failed to load order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCallVendor = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleCallDriver = () => {
    if (order?.driver?.phone) {
      window.open(`tel:${order.driver.phone}`);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'ready', 'completed'];
    return steps.indexOf(status);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSkeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <LoadingSkeleton className="h-64 rounded-lg" />
              <LoadingSkeleton className="h-48 rounded-lg" />
            </div>
            <div className="space-y-6">
              <LoadingSkeleton className="h-32 rounded-lg" />
              <LoadingSkeleton className="h-48 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link href="/account/orders" className="text-amber-600 hover:text-amber-700">
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = ORDER_STATUSES[order.orderStatus as keyof typeof ORDER_STATUSES];
  const statusStep = getStatusStep(order.orderStatus);

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
            <button
              onClick={() => fetchOrder(false)}
              disabled={refreshing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <FiRefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Placed on {formatTime(order.createdAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' :
                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                <currentStatus.icon size={16} />
                {currentStatus.label}
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {Object.entries(ORDER_STATUSES).slice(0, 5).map(([status, config], index) => {
                const isCompleted = index <= statusStep;
                const isCurrent = index === statusStep;
                
                return (
                  <div key={status} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        <config.icon size={20} />
                      </div>
                      <span className={`text-xs mt-2 text-center ${
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {config.label}
                      </span>
                    </div>
                    {index < 4 && (
                      <div className={`flex-1 h-1 mx-4 ${
                        index < statusStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Delivery */}
          {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FiClock className="text-amber-600" size={20} />
                <div>
                  <div className="font-medium text-amber-900">
                    Estimated delivery: {order.estimatedDeliveryTime}
                  </div>
                  <div className="text-sm text-amber-700">
                    We'll keep you updated on any changes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'timeline', label: 'Timeline', count: order.timeline.length },
                    { id: 'items', label: 'Items', count: order.vendorOrders.reduce((sum, vo) => sum + vo.items.length, 0) },
                    { id: 'contact', label: 'Contact' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'timeline' && (
                    <motion.div
                      key="timeline"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                      <div className="space-y-4">
                        {order.timeline.map((event, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{event.message}</div>
                              <div className="text-sm text-gray-500">{formatTime(event.timestamp)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'items' && (
                    <motion.div
                      key="items"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                      <div className="space-y-6">
                        {order.vendorOrders.map((vendorOrder, vendorIndex) => (
                          <div key={vendorIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                <Image
                                  src={vendorOrder.vendor.avatar || '/placeholder-restaurant.jpg'}
                                  alt={vendorOrder.vendor.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">{vendorOrder.vendor.name}</h4>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  vendorOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  vendorOrder.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {vendorOrder.status}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {vendorOrder.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-3">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                    <Image
                                      src={item.image || '/placeholder-food.jpg'}
                                      alt={item.name}
                                      width={64}
                                      height={64}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium">{item.name}</h5>
                                    {item.selectedOptions.length > 0 && (
                                      <p className="text-sm text-gray-500">
                                        {item.selectedOptions.map(opt => `${opt.name}: ${opt.choice}`).join(', ')}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                      <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="border-t border-gray-200 mt-4 pt-4 text-right">
                              <span className="font-semibold">Subtotal: ₦{vendorOrder.subtotal.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      <div className="space-y-6">
                        {/* Vendors */}
                        <div>
                          <h4 className="font-medium mb-3">Restaurants</h4>
                          <div className="space-y-3">
                            {order.vendorOrders.map((vendorOrder, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                                    <Image
                                      src={vendorOrder.vendor.avatar || '/placeholder-restaurant.jpg'}
                                      alt={vendorOrder.vendor.name}
                                      width={40}
                                      height={40}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{vendorOrder.vendor.name}</div>
                                    <div className="text-sm text-gray-500">{vendorOrder.vendor.address}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleCallVendor(vendorOrder.vendor.phone)}
                                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  <FiPhone size={16} />
                                  Call
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Driver */}
                        {order.driver && (
                          <div>
                            <h4 className="font-medium mb-3">Delivery Driver</h4>
                            <div className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                    <Image
                                      src={order.driver.avatar || '/placeholder-avatar.jpg'}
                                      alt={order.driver.name}
                                      width={48}
                                      height={48}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{order.driver.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {order.driver.vehicle.type} • {order.driver.vehicle.plateNumber}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleCallDriver}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                  >
                                    <FiPhone size={16} />
                                    Call
                                  </button>
                                  <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <FiMessageCircle size={16} />
                                    Chat
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
              <div className="flex items-start gap-3">
                <FiMapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <div className="font-medium">{order.shippingAddress.street}</div>
                  <div className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </div>
                  {order.specialInstructions && (
                    <div className="mt-2 text-sm text-gray-500">
                      <strong>Instructions:</strong> {order.specialInstructions}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{(order.totalPrice - order.deliveryFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₦{order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Paid on {formatTime(order.paidAt)}
                </div>
              </div>
            </div>

            {/* Actions */}
            {order.orderStatus === 'completed' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>
                <p className="text-gray-600 text-sm mb-4">
                  How was your order? Your feedback helps us improve.
                </p>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  <FiStar size={16} />
                  Leave Review
                </button>
              </div>
            )}

            {/* Support */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FiMessageCircle size={16} />
                  Chat with Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FiPhone size={16} />
                  Call Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}