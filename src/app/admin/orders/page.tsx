"use client";

import { DataTable } from "@/components/admin/data-table";
// import { columns } from "@/components/admin/orderTable";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useEffect, useState } from "react";

async function getOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders'); // Replace with your actual API endpoint
  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }
  return res.json();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track your restaurant orders
          </p>
        </div>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <div className="rounded-md border">
        {/* <DataTable  data={orders} /> */}
      </div>
    </div>
  );
}