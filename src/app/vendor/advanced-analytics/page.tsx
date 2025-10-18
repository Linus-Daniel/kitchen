'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Clock, 
  Star, 
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    daily: { date: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    forecast: { date: string; predicted: number }[];
  };
  orders: {
    total: number;
    growth: number;
    completed: number;
    cancelled: number;
    averageValue: number;
    peakHours: { hour: string; count: number }[];
    trends: { date: string; count: number }[];
  };
  customers: {
    total: number;
    newCustomers: number;
    returningCustomers: number;
    topCustomers: { name: string; orders: number; spent: number }[];
    retention: number;
    satisfaction: number;
  };
  products: {
    totalSold: number;
    topPerforming: { 
      name: string; 
      sold: number; 
      revenue: number; 
      rating: number;
      profit: number;
    }[];
    lowPerforming: { 
      name: string; 
      sold: number; 
      revenue: number; 
      rating: number;
    }[];
    categories: { category: string; percentage: number; revenue: number }[];
  };
  performance: {
    preparationTime: {
      average: number;
      trend: number;
      byCategory: { category: string; time: number }[];
    };
    deliveryTime: {
      average: number;
      onTime: number;
      delayed: number;
    };
    qualityScore: number;
    efficiency: number;
  };
  marketing: {
    promotions: {
      active: number;
      revenue: number;
      conversion: number;
    };
    reviews: {
      average: number;
      total: number;
      recent: { rating: number; comment: string; date: string }[];
    };
    visibility: {
      searchRanking: number;
      profileViews: number;
      clickThrough: number;
    };
  };
}

const VendorAdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'products' | 'customers' | 'performance' | 'marketing'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/vendors/analytics/advanced?start=${dateRange.start}&end=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/vendors/analytics/export?type=${type}&start=${dateRange.start}&end=${dateRange.end}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${type}-${Date.now()}.pdf`;
        a.click();
        toast.success('Report exported successfully');
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${formatPercentage(growth)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into your business performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchAnalytics()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => exportReport('comprehensive')}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'revenue', name: 'Revenue', icon: DollarSign },
                { id: 'products', name: 'Products', icon: ShoppingBag },
                { id: 'customers', name: 'Customers', icon: Users },
                { id: 'performance', name: 'Performance', icon: Activity },
                { id: 'marketing', name: 'Marketing', icon: Target }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</p>
                    <div className="flex items-center mt-1">
                      {analytics.revenue.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatGrowth(analytics.revenue.growth)}
                      </span>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
                    <div className="flex items-center mt-1">
                      {analytics.orders.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${analytics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatGrowth(analytics.orders.growth)}
                      </span>
                    </div>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.orders.averageValue)}</p>
                    <p className="text-sm text-gray-500 mt-1">Per order</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.customers.satisfaction.toFixed(1)}/5.0</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">{analytics.marketing.reviews.total} reviews</span>
                    </div>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h3>
                <div className="h-64 flex items-end space-x-2">
                  {analytics.revenue.daily.slice(-30).map((day, index) => {
                    const maxRevenue = Math.max(...analytics.revenue.daily.map(d => d.amount));
                    const height = (day.amount / maxRevenue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-orange-500 w-full rounded-t transition-all duration-300 hover:bg-orange-600"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ${formatCurrency(day.amount)}`}
                        />
                        <span className="text-xs text-gray-500 mt-1 transform rotate-45">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                <div className="space-y-4">
                  {analytics.products.topPerforming.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sold} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{analytics.performance.preparationTime.average}</p>
                  <p className="text-sm text-gray-600">Avg Prep Time (min)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatPercentage(analytics.performance.deliveryTime.onTime)}</p>
                  <p className="text-sm text-gray-600">On-Time Delivery</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatPercentage(analytics.customers.retention)}</p>
                  <p className="text-sm text-gray-600">Customer Retention</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{formatPercentage(analytics.performance.efficiency)}</p>
                  <p className="text-sm text-gray-600">Operational Efficiency</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                <div className="h-80 flex items-end space-x-4">
                  {analytics.revenue.monthly.map((month, index) => {
                    const maxRevenue = Math.max(...analytics.revenue.monthly.map(m => m.amount));
                    const height = (month.amount / maxRevenue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="bg-gradient-to-t from-orange-500 to-orange-300 w-full rounded-t transition-all duration-300 hover:from-orange-600 hover:to-orange-400"
                          style={{ height: `${height}%` }}
                          title={`${month.month}: ${formatCurrency(month.amount)}`}
                        />
                        <span className="text-xs text-gray-500 mt-2 transform rotate-45">
                          {month.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
                <div className="space-y-4">
                  {analytics.revenue.forecast.slice(0, 7).map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(forecast.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(forecast.predicted)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
                  <button
                    onClick={() => exportReport('products')}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    Export
                  </button>
                </div>
                <div className="space-y-4">
                  {analytics.products.topPerforming.map((product, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Units Sold</p>
                          <p className="font-semibold">{product.sold}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Revenue</p>
                          <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rating</p>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="font-semibold">{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Profit</p>
                          <p className="font-semibold text-green-600">{formatCurrency(product.profit)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                <div className="space-y-4">
                  {analytics.products.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPercentage(category.percentage)}
                          </span>
                          <p className="text-xs text-gray-500">{formatCurrency(category.revenue)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Low Performing Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Products Needing Attention</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.products.lowPerforming.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            {product.rating.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-orange-600 hover:text-orange-800">
                            Optimize
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional tabs would follow similar patterns... */}
        {/* For brevity, showing structure for remaining tabs */}
        
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Customers</span>
                    <span className="font-semibold">{analytics.customers.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Customers</span>
                    <span className="font-semibold text-green-600">{analytics.customers.newCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returning Customers</span>
                    <span className="font-semibold text-blue-600">{analytics.customers.returningCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention Rate</span>
                    <span className="font-semibold">{formatPercentage(analytics.customers.retention)}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Customer</th>
                        <th className="text-left py-2">Orders</th>
                        <th className="text-left py-2">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.customers.topCustomers.map((customer, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{customer.name}</td>
                          <td className="py-2">{customer.orders}</td>
                          <td className="py-2">{formatCurrency(customer.spent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VendorAdvancedAnalytics;