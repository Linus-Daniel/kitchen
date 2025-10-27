"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { Clock, Search, Eye } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedOptions?: Array<{ name: string; choice: string }>;
  }>;
  user: {
    name: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderStatus: string;
  totalPrice: number;
  specialInstructions?: string;
  createdAt: string;
  isPaid: boolean;
}

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "out-for-delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await apiClient.getVendorOrders(filters);
      let filteredOrders = response.data || [];
      
      // Apply search filter
      if (searchTerm) {
        filteredOrders = filteredOrders.filter((order: Order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderItems.some(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      
      setOrders(filteredOrders);
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.updateVendorOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (createdAt: string) => {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);
    
    if (diffMinutes > 30) return 'urgent';
    if (diffMinutes > 15) return 'warning';
    return 'normal';
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to manage orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage incoming orders and update their status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            {orders.filter(o => o.orderStatus === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="bg-orange-50">
            {orders.filter(o => o.orderStatus === 'preparing').length} Preparing
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter ? "No orders match your filters" : "No orders yet"}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const urgency = getUrgencyLevel(order.createdAt);
                  return (
                    <TableRow 
                      key={order._id}
                      className={urgency === 'urgent' ? 'bg-red-50' : urgency === 'warning' ? 'bg-yellow-50' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {urgency === 'urgent' && <Clock className="h-4 w-4 text-red-500" />}
                          #{order._id.slice(-6)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-gray-500">{order.user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.name}
                              {item.selectedOptions && item.selectedOptions.length > 0 && (
                                <span className="text-gray-500">
                                  {' '}({item.selectedOptions.map(opt => opt.choice).join(', ')})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.orderStatus}
                            onValueChange={(value) => updateOrderStatus(order._id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/vendor/orders/${order._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}