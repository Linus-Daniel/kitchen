"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useVendorStats } from "@/hooks/useVendorStats";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

export default function VendorDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useVendorStats();
  const { orders, loading: ordersLoading, error: ordersError, updateOrderStatus } = useVendorOrders({ 
    limit: 5 
  });

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getStatColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const statsData = stats ? [
    {
      title: "Today's Orders",
      value: stats.todayOrders.toString(),
      change: formatChange(stats.ordersChange),
      icon: "shoppingCart",
      changeColor: getStatColor(stats.ordersChange),
    },
    { 
      title: "Total Revenue", 
      value: `$${stats.totalRevenue.toFixed(2)}`, 
      change: formatChange(stats.revenueChange), 
      icon: "dollar",
      changeColor: getStatColor(stats.revenueChange),
    },
    { 
      title: "Active Products", 
      value: stats.activeProducts.toString(), 
      change: formatChange(stats.productsChange), 
      icon: "package",
      changeColor: getStatColor(stats.productsChange),
    },
    { 
      title: "Customer Reviews", 
      value: stats.averageRating.toFixed(1), 
      change: formatChange(stats.ratingChange), 
      icon: "star",
      changeColor: getStatColor(stats.ratingChange),
    },
  ] : [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's your restaurant overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          <Card className="md:col-span-2 lg:col-span-4">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-red-500">Error loading stats: {statsError}</p>
            </CardContent>
          </Card>
        ) : (
          statsData.map((stat, index) => {
            const Icon = Icons[stat.icon as keyof typeof Icons];
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.changeColor}>{stat.change}</span> from
                      yesterday
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/vendor/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : ordersError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading orders: {ordersError}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderItems.length} items • ${order.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.orderStatus.toLowerCase() === 'delivered' 
                        ? 'bg-green-100 text-green-800'
                        : order.orderStatus.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : order.orderStatus.toLowerCase() === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vendor/orders/${order._id}`}>View</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
