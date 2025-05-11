"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  email: string;
}

interface OrderItem {
  // Define your order item properties here
  // Example:
  productId: string;
  quantity: number;
  price: number;
}

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface Order {
  _id: string;
  user: User;
  orderItems: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  isPaid: boolean;
  isDelivered: boolean;
}

const recentOrders: Order[] = [
  {
    _id: "ORD-001",
    user: { name: "John Doe", email: "john@example.com" },
    orderItems: [],
    totalPrice: 45.99,
    status: "Processing",
    createdAt: "2023-11-15T10:30:00Z",
    isPaid: true,
    isDelivered: false,
  },
  {
    _id: "ORD-002",
    user: { name: "Jane Smith", email: "jane@example.com" },
    orderItems: [],
    totalPrice: 89.5,
    status: "Shipped",
    createdAt: "2023-11-14T14:45:00Z",
    isPaid: true,
    isDelivered: false,
  },
  {
    _id: "ORD-003",
    user: { name: "Robert Johnson", email: "robert@example.com" },
    orderItems: [],
    totalPrice: 32.75,
    status: "Delivered",
    createdAt: "2023-11-13T09:15:00Z",
    isPaid: true,
    isDelivered: true,
  },
  {
    _id: "ORD-004",
    user: { name: "Emily Davis", email: "emily@example.com" },
    orderItems: [],
    totalPrice: 15.99,
    status: "Pending",
    createdAt: "2023-11-12T16:20:00Z",
    isPaid: false,
    isDelivered: false,
  },
  {
    _id: "ORD-005",
    user: { name: "Michael Wilson", email: "michael@example.com" },
    orderItems: [],
    totalPrice: 67.25,
    status: "Cancelled",
    createdAt: "2023-11-11T11:10:00Z",
    isPaid: false,
    isDelivered: false,
  },
];

interface StatusMap {
  [key: string]: { bg: string; text: string };
}

export function RecentOrders() {
  const statusMap: StatusMap = {
    Pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    Processing: { bg: "bg-blue-100", text: "text-blue-800" },
    Shipped: { bg: "bg-purple-100", text: "text-purple-800" },
    Delivered: { bg: "bg-green-100", text: "text-green-800" },
    Cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => {
              const paymentStatus = order.isPaid ? "Paid" : "Pending";

              return (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    #{order._id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${order.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.isPaid ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {order.isPaid ? (
                        <Icons.check className="h-3 w-3" />
                      ) : (
                        <Icons.clock className="h-3 w-3" />
                      )}
                      {paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusMap[order.status].bg} ${statusMap[order.status].text} gap-1`}
                    >
                      {order.status === "Processing" && (
                        <Icons.processing className="h-3 w-3" />
                      )}
                      {order.status === "Shipped" && (
                        <Icons.shipped className="h-3 w-3" />
                      )}
                      {order.status === "Delivered" && (
                        <Icons.delivered className="h-3 w-3" />
                      )}
                      {order.status === "Pending" && (
                        <Icons.pending className="h-3 w-3" />
                      )}
                      {order.status === "Cancelled" && (
                        <Icons.cancelled className="h-3 w-3" />
                      )}
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-8 gap-1">
          View all orders
          <Icons.chevronRight className="h-3.5 w-3.5" />
          <span className="sr-only">View all orders</span>
        </Button>
      </div>
    </div>
  );
}