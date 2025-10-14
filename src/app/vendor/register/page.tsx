import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ChartArea } from "lucide-react";

// Mock data - replace with API calls
const dashboardStats = [
  {
    title: "Total Revenue",
    value: "$12,456",
    change: "+18.2%",
    icon: "dollar",
    description: "This month",
  },
  {
    title: "Total Orders",
    value: "324",
    change: "+12%",
    icon: "shoppingCart",
    description: "This month",
  },
  {
    title: "Orders Delivered",
    value: "298",
    change: "+15%",
    icon: "delivery",
    description: "Successfully delivered",
  },
  {
    title: "Pending Orders",
    value: "26",
    change: "-5%",
    icon: "clock",
    description: "Need attention",
  },
];

const recentOrders = [
  {
    id: "ORD-1001",
    customer: "John Doe",
    items: 3,
    total: 45.99,
    status: "preparing",
    time: "10 min ago",
  },
  {
    id: "ORD-1002",
    customer: "Jane Smith",
    items: 2,
    total: 32.5,
    status: "ready",
    time: "15 min ago",
  },
  {
    id: "ORD-1003",
    customer: "Mike Johnson",
    items: 5,
    total: 89.75,
    status: "delivered",
    time: "25 min ago",
  },
  {
    id: "ORD-1004",
    customer: "Sarah Wilson",
    items: 1,
    total: 15.99,
    status: "preparing",
    time: "30 min ago",
  },
];

const topProducts = [
  { name: "Margherita Pizza", orders: 45, revenue: 584.55 },
  { name: "Pepperoni Pizza", orders: 38, revenue: 493.0 },
  { name: "Caesar Salad", orders: 32, revenue: 255.68 },
  { name: "Garlic Bread", orders: 28, revenue: 112.0 },
];

export default function VendorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Welcome back! Here's your restaurant performance summary.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/vendor/withdraw">
              <Icons.dollar className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/products/new">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => {
          const Icon = Icons[stat.icon as keyof typeof Icons];
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <p
                    className={`text-xs ${
                      stat.change.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icons.shoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer} • {order.items} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">${order.total}</p>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "ready"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.orders} orders
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-sm">${product.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              asChild
            >
              <Link href="/vendor/orders">
                <Icons.shoppingCart className="h-6 w-6" />
                <span>Manage Orders</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              asChild
            >
              <Link href="/vendor/products">
                <Icons.package className="h-6 w-6" />
                <span>View Products</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              asChild
            >
              <Link href="/vendor/analytics">
                <ChartArea className="h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              asChild
            >
              <Link href="/vendor/withdraw">
                <Icons.dollar className="h-6 w-6" />
                <span>Withdraw Funds</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
