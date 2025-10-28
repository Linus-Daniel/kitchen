"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  CreditCard, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Download,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";

interface Transaction {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  order: {
    _id: string;
    orderNumber: string;
    user: {
      name: string;
      email: string;
    };
    vendor: {
      businessName: string;
    };
    total: number;
    status: string;
  };
  refundAmount?: number;
  refundStatus?: string;
  refundedAt?: string;
}

interface TransactionStats {
  _id: string;
  count: number;
  totalAmount: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/admin/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data);
        setStats(data.stats || []);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      showToast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, searchQuery]);

  const handleRefund = async () => {
    if (!selectedTransaction || !refundAmount) return;

    try {
      setActionLoading('refund');
      
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          transactionId: selectedTransaction._id,
          amount: parseFloat(refundAmount),
          reason: refundReason
        })
      });

      if (response.ok) {
        showToast.success('Refund processed successfully');
        fetchTransactions();
        setRefundDialogOpen(false);
        setRefundAmount('');
        setRefundReason('');
        setSelectedTransaction(null);
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Refund failed');
      }
    } catch (error) {
      showToast.error('Refund failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkFailed = async (transaction: Transaction) => {
    const reason = prompt('Reason for marking as failed:');
    if (!reason) return;

    try {
      setActionLoading(transaction._id);
      
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_failed',
          transactionId: transaction._id,
          reason
        })
      });

      if (response.ok) {
        showToast.success('Transaction marked as failed');
        fetchTransactions();
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Action failed');
      }
    } catch (error) {
      showToast.error('Action failed');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'default', icon: CheckCircle, label: 'Completed' },
      pending: { color: 'secondary', icon: Clock, label: 'Pending' },
      failed: { color: 'destructive', icon: XCircle, label: 'Failed' },
      refunded: { color: 'outline', icon: RefreshCw, label: 'Refunded' },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate summary stats
  const totalTransactions = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalAmount = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const completedStats = stats.find(s => s._id === 'completed');
  const pendingStats = stats.find(s => s._id === 'pending');
  const failedStats = stats.find(s => s._id === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transaction Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage all platform transactions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(completedStats?.totalAmount || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completedStats?.count || 0} transactions
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(pendingStats?.totalAmount || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pendingStats?.count || 0} transactions
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by transaction ID or payment method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Transaction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Order</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Vendor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.transactionId}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.order.orderNumber}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(transaction.order.total)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.order.user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{transaction.order.vendor.businessName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          {transaction.refundAmount && (
                            <p className="text-sm text-red-500">
                              Refunded: {formatCurrency(transaction.refundAmount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {transaction.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setRefundAmount(transaction.amount.toString());
                                setRefundDialogOpen(true);
                              }}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                          {transaction.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkFailed(transaction)}
                              disabled={actionLoading === transaction._id}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for transaction {selectedTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Refund Amount</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedTransaction?.amount}
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(selectedTransaction?.amount || 0)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Reason for Refund</label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRefund}
                disabled={!refundAmount || !refundReason || actionLoading === 'refund'}
              >
                Process Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}