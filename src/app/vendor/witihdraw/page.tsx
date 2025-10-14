"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { ChartArea } from "lucide-react";

// Mock data
const balanceData = {
  available: 2456.78,
  pending: 1234.56,
  totalEarnings: 15678.9,
};

const withdrawalHistory = [
  {
    id: "WD-1001",
    amount: 1000.0,
    method: "Bank Transfer",
    status: "completed",
    date: "2023-11-15",
    processed: "2023-11-16",
  },
  {
    id: "WD-1002",
    amount: 500.0,
    method: "PayPal",
    status: "completed",
    date: "2023-11-10",
    processed: "2023-11-11",
  },
  {
    id: "WD-1003",
    amount: 1500.0,
    method: "Bank Transfer",
    status: "pending",
    date: "2023-11-14",
    processed: "-",
  },
  {
    id: "WD-1004",
    amount: 750.0,
    method: "PayPal",
    status: "failed",
    date: "2023-11-08",
    processed: "2023-11-09",
  },
];

export default function WithdrawalPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle withdrawal logic
    console.log("Withdrawal request:", { amount, method });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Withdrawal</h2>
        <p className="text-muted-foreground">
          Manage your earnings and withdrawal requests
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <Icons.dollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceData.available.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Balance
            </CardTitle>
            <Icons.clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceData.pending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Processing period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <ChartArea className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceData.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>
              Enter the amount you want to withdraw and select your preferred
              method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  max={balanceData.available}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Available: ${balanceData.available.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Withdrawal Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Processing Time</Label>
                <p className="text-sm text-muted-foreground">
                  {method === "bank" && "3-5 business days"}
                  {method === "paypal" && "1-2 business days"}
                  {method === "stripe" && "2-3 business days"}
                  {!method && "Select a method to see processing time"}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!amount || !method}
              >
                Request Withdrawal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>Your recent withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistory.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      {withdrawal.id}
                    </TableCell>
                    <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell>{withdrawal.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdrawal.status === "completed"
                            ? "default"
                            : withdrawal.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{withdrawal.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
