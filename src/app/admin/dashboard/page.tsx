"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Store, 
  Package, 
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalVendors: number;
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    pendingVendors: number;
  };
  recent: {
    users: Array<{
      _id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    }>;
    vendors: Array<{
      _id: string;
      businessName: string;
      ownerName: string;
      isVerified: boolean;
      createdAt: string;
    }>;
    orders: Array<{
      _id: string;
      user: { name: string; email: string };
      vendor: { businessName: string };
      total: number;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Users",
      value: stats.overview.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      href: "/admin/users"
    },
    {
      title: "Total Vendors",
      value: stats.overview.totalVendors,
      icon: Store,
      color: "bg-green-500",
      textColor: "text-green-600",
      href: "/admin/vendors"
    },
    {
      title: "Total Products",
      value: stats.overview.totalProducts,
      icon: Package,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      href: "/admin/products"
    },
    {
      title: "Total Orders",
      value: stats.overview.totalOrders,
      icon: ShoppingBag,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      href: "/admin/orders"
    },
    {
      title: "Total Revenue",
      value: `$${stats.overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      href: "/admin/transactions"
    },
    {
      title: "Pending Vendors",
      value: stats.overview.pendingVendors,
      icon: AlertCircle,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      href: "/admin/vendors/verification"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of platform activity and management</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(card.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.textColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">Growth trend</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.users.map((user) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{user.role}</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Vendors</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/vendors')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.vendors.map((vendor) => (
                <div key={vendor._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vendor.businessName}</p>
                    <p className="text-sm text-gray-500">{vendor.ownerName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={vendor.isVerified ? "default" : "secondary"}>
                      {vendor.isVerified ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent.orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-sm text-gray-500">{order.vendor.businessName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.total}</p>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/vendors/verification')}
              className="h-20 flex flex-col"
            >
              <AlertCircle className="h-6 w-6 mb-2" />
              Verify Vendors
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/products')}
              className="h-20 flex flex-col"
            >
              <Package className="h-6 w-6 mb-2" />
              Manage Products
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/transactions')}
              className="h-20 flex flex-col"
            >
              <DollarSign className="h-6 w-6 mb-2" />
              View Transactions
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/settings')}
              className="h-20 flex flex-col"
            >
              <Eye className="h-6 w-6 mb-2" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}