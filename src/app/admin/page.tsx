"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Overview } from "@/components/admin/overView";
import { RecentOrders } from "@/components/admin/recent-order";
import { motion} from "framer-motion";
import { useAdminStats } from "@/hooks/useAdminStats";

export default function DashboardPage() {
  const { stats, loading, error } = useAdminStats();

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getStatColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const statsData = stats ? [
    { 
      title: "Total Revenue", 
      value: `$${stats.totalRevenue.toFixed(2)}`, 
      change: formatChange(stats.revenueGrowth), 
      icon: Icons.dollar,
      changeColor: getStatColor(stats.revenueGrowth),
    },
    { 
      title: "Total Orders", 
      value: stats.totalOrders.toString(), 
      change: formatChange(stats.ordersGrowth), 
      icon: Icons.shoppingCart,
      changeColor: getStatColor(stats.ordersGrowth),
    },
    { 
      title: "Active Products", 
      value: stats.activeProducts.toString(), 
      change: "+19%", 
      icon: Icons.package,
      changeColor: "text-green-500",
    },
    { 
      title: "Total Users", 
      value: stats.totalUsers.toString(), 
      change: formatChange(stats.usersGrowth), 
      icon: Icons.users,
      changeColor: getStatColor(stats.usersGrowth),
    },
  ] : [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your Restaurant today
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {loading ? (
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
        ) : error ? (
          <Card className="md:col-span-2 lg:col-span-4">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-red-500">Error loading stats: {error}</p>
            </CardContent>
          </Card>
        ) : (
          statsData.map((stat, index) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeColor}>{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentOrders />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}