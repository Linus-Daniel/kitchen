'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Users,
  ChefHat,
  Settings,
  BarChart3,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ScheduledOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    options?: string[];
  }[];
  scheduledDate: string;
  scheduledTime: string;
  totalAmount: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  deliveryAddress: string;
  specialInstructions?: string;
  createdAt: string;
  prepTime: number;
}

interface TimeSlot {
  id: string;
  time: string;
  maxOrders: number;
  currentOrders: number;
  isAvailable: boolean;
  prepTime: number;
}

interface VendorScheduleSettings {
  advanceBookingDays: number;
  minOrderTime: number;
  maxOrdersPerSlot: number;
  workingHours: {
    start: string;
    end: string;
  };
  timeSlotDuration: number;
  blackoutDates: string[];
  autoAcceptOrders: boolean;
}

const VendorScheduling = () => {
  const [scheduledOrders, setScheduledOrders] = useState<ScheduledOrder[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<VendorScheduleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'orders' | 'calendar' | 'settings' | 'analytics'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchSchedulingData();
  }, [selectedDate]);

  const fetchSchedulingData = async () => {
    try {
      const [ordersRes, slotsRes, settingsRes] = await Promise.all([
        fetch(`/api/vendors/scheduling/orders?date=${selectedDate}`),
        fetch(`/api/vendors/scheduling/slots?date=${selectedDate}`),
        fetch('/api/vendors/scheduling/settings')
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setScheduledOrders(ordersData);
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setTimeSlots(slotsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setScheduleSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching scheduling data:', error);
      toast.error('Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/vendors/scheduling/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchSchedulingData();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updateTimeSlot = async (slotId: string, updates: Partial<TimeSlot>) => {
    try {
      const response = await fetch(`/api/vendors/scheduling/slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Time slot updated successfully');
        fetchSchedulingData();
      } else {
        toast.error('Failed to update time slot');
      }
    } catch (error) {
      console.error('Error updating time slot:', error);
      toast.error('Failed to update time slot');
    }
  };

  const updateScheduleSettings = async (settings: Partial<VendorScheduleSettings>) => {
    try {
      const response = await fetch('/api/vendors/scheduling/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Schedule settings updated successfully');
        setScheduleSettings(prev => prev ? { ...prev, ...settings } : null);
      } else {
        toast.error('Failed to update schedule settings');
      }
    } catch (error) {
      console.error('Error updating schedule settings:', error);
      toast.error('Failed to update schedule settings');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      preparing: { color: 'bg-yellow-100 text-yellow-800', label: 'Preparing' },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredOrders = scheduledOrders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const generateTimeSlots = () => {
    if (!scheduleSettings) return [];
    
    const slots = [];
    const startHour = parseInt(scheduleSettings.workingHours.start.split(':')[0]);
    const endHour = parseInt(scheduleSettings.workingHours.end.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour += scheduleSettings.timeSlotDuration / 60) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const ordersCount = scheduledOrders.filter(order => order.scheduledTime === time).length;
      
      slots.push({
        id: `slot-${hour}`,
        time,
        maxOrders: scheduleSettings.maxOrdersPerSlot,
        currentOrders: ordersCount,
        isAvailable: ordersCount < scheduleSettings.maxOrdersPerSlot,
        prepTime: 30
      });
    }
    
    return slots;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Scheduling</h1>
          <p className="text-gray-600 mt-2">Manage scheduled orders and time slots</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'orders', name: 'Scheduled Orders', icon: Calendar },
                { id: 'calendar', name: 'Time Slots', icon: Clock },
                { id: 'settings', name: 'Settings', icon: Settings },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Date Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Selected Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Total Orders: {scheduledOrders.length}
              </span>
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Orders</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        {getStatusBadge(order.status)}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Customer</p>
                          <p className="text-sm text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Scheduled Time</p>
                          <p className="text-sm text-gray-900">
                            {new Date(order.scheduledDate).toLocaleDateString()} at {order.scheduledTime}
                          </p>
                          <p className="text-sm text-gray-500">Prep time: {order.prepTime} mins</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Amount</p>
                          <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Order Items</p>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                {item.options && item.options.length > 0 && (
                                  <p className="text-xs text-gray-500">Options: {item.options.join(', ')}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.quantity}x ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.specialInstructions && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                          <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-6">
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                          Complete Order
                        </button>
                      )}
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No scheduled orders</h3>
                  <p className="text-gray-600">No orders found for the selected date and filter.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Time Slots Tab */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Time Slots for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generateTimeSlots().map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg border-2 ${
                      slot.isAvailable 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{slot.time}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        slot.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.isAvailable ? 'Available' : 'Full'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Orders: {slot.currentOrders}/{slot.maxOrders}</p>
                      <p>Prep time: {slot.prepTime} mins</p>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => updateTimeSlot(slot.id, { 
                          maxOrders: slot.maxOrders + 1 
                        })}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        +1 Capacity
                      </button>
                      <button
                        onClick={() => updateTimeSlot(slot.id, { 
                          isAvailable: !slot.isAvailable 
                        })}
                        className={`text-xs px-2 py-1 rounded ${
                          slot.isAvailable 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {slot.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && scheduleSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Booking Days
                  </label>
                  <input
                    type="number"
                    value={scheduleSettings.advanceBookingDays}
                    onChange={(e) => updateScheduleSettings({ 
                      advanceBookingDays: parseInt(e.target.value) 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Time (hours)
                  </label>
                  <input
                    type="number"
                    value={scheduleSettings.minOrderTime}
                    onChange={(e) => updateScheduleSettings({ 
                      minOrderTime: parseInt(e.target.value) 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Orders Per Time Slot
                  </label>
                  <input
                    type="number"
                    value={scheduleSettings.maxOrdersPerSlot}
                    onChange={(e) => updateScheduleSettings({ 
                      maxOrdersPerSlot: parseInt(e.target.value) 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot Duration (minutes)
                  </label>
                  <select
                    value={scheduleSettings.timeSlotDuration}
                    onChange={(e) => updateScheduleSettings({ 
                      timeSlotDuration: parseInt(e.target.value) 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Hours Start
                  </label>
                  <input
                    type="time"
                    value={scheduleSettings.workingHours.start}
                    onChange={(e) => updateScheduleSettings({ 
                      workingHours: { 
                        ...scheduleSettings.workingHours, 
                        start: e.target.value 
                      } 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Hours End
                  </label>
                  <input
                    type="time"
                    value={scheduleSettings.workingHours.end}
                    onChange={(e) => updateScheduleSettings({ 
                      workingHours: { 
                        ...scheduleSettings.workingHours, 
                        end: e.target.value 
                      } 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleSettings.autoAcceptOrders}
                    onChange={(e) => updateScheduleSettings({ 
                      autoAcceptOrders: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Auto-accept scheduled orders
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Scheduled Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {scheduledOrders.filter(o => o.scheduledDate === selectedDate).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue from Scheduled Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${scheduledOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${scheduledOrders.length > 0 
                        ? (scheduledOrders.reduce((sum, order) => sum + order.totalAmount, 0) / scheduledOrders.length).toFixed(2)
                        : '0.00'
                      }
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Time Analysis</h3>
              <div className="space-y-3">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0') + ':00';
                  const orderCount = scheduledOrders.filter(order => order.scheduledTime === hour).length;
                  const maxCount = Math.max(...Array.from({ length: 24 }, (_, j) => {
                    const h = j.toString().padStart(2, '0') + ':00';
                    return scheduledOrders.filter(order => order.scheduledTime === h).length;
                  }));
                  const percentage = maxCount > 0 ? (orderCount / maxCount) * 100 : 0;

                  return (
                    <div key={hour} className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700 w-16">{hour}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-orange-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{orderCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VendorScheduling;