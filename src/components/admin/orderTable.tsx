"use client";

import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersTableProps {
  data: Order[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function OrdersTable({
  data,
  sortBy,
  sortDirection,
  onSort,
}: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Order ID
          </TableHead>
          <TableHead>
            Customer
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort?.("totalPrice")}
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
              {sortBy === "totalPrice" && (
                <span className="ml-1">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </Button>
          </TableHead>
          <TableHead>
            Status
          </TableHead>
          <TableHead>
            Date
          </TableHead>
          <TableHead>
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order._id}>
            <TableCell className="font-mono">
              {order._id.slice(-8)}
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.user?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {order.user?.email}
                </div>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(order.totalPrice)}
            </TableCell>
            <TableCell>
              <Badge className={getStatusBadgeClass(order.status)}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(order._id)}
                  >
                    Copy Order ID
                  </DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Processing: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  return statusMap[status] || "";
}