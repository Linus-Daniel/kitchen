'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Download, 
  Upload,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WalletBalance {
  available: number;
  pending: number;
  totalEarnings: number;
  totalWithdrawn: number;
  credits: number;
  commissionRate: number;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'credit' | 'deduction' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  orderId?: string;
  date: string;
  processedDate?: string;
  method?: string;
  reference?: string;
}

interface WithdrawalMethod {
  id: string;
  type: 'bank' | 'paypal' | 'mobile_money';
  name: string;
  details: string;
  isDefault: boolean;
  processingTime: string;
}

const VendorWallet = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdraw' | 'methods'>('overview');
  const [filterType, setFilterType] = useState<string>('all');
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    methodId: '',
    note: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes, methodsRes] = await Promise.all([
        fetch('/api/vendors/wallet/balance'),
        fetch('/api/vendors/wallet/transactions'),
        fetch('/api/vendors/wallet/methods')
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }

      if (methodsRes.ok) {
        const methodsData = await methodsRes.json();
        setWithdrawalMethods(methodsData);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawalForm.amount || !withdrawalForm.methodId) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(withdrawalForm.amount);
    if (amount < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    if (balance && amount > balance.available) {
      toast.error('Insufficient available balance');
      return;
    }

    try {
      const response = await fetch('/api/vendors/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          methodId: withdrawalForm.methodId,
          note: withdrawalForm.note
        })
      });

      if (response.ok) {
        toast.success('Withdrawal request submitted successfully');
        setWithdrawalForm({ amount: '', methodId: '', note: '' });
        fetchWalletData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal');
    }
  };

  const addCredit = async (amount: number) => {
    try {
      const response = await fetch('/api/vendors/wallet/add-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        toast.success('Credits added successfully');
        fetchWalletData();
      } else {
        toast.error('Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    switch (type) {
      case 'earning':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'credit':
        return <Plus className="w-4 h-4 text-purple-500" />;
      case 'deduction':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Failed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const filteredTransactions = transactions.filter(transaction => 
    filterType === 'all' || transaction.type === filterType
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet & Earnings</h1>
          <p className="text-gray-600 mt-2">Manage your earnings, withdrawals, and credits</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'transactions', name: 'Transactions', icon: DollarSign },
                { id: 'withdraw', name: 'Withdraw', icon: Download },
                { id: 'methods', name: 'Payment Methods', icon: CreditCard }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${balance?.available.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Ready for withdrawal</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${balance?.pending.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Processing period</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Credits</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${balance?.credits.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <Plus className="w-8 h-8 text-purple-500" />
                </div>
                <button
                  onClick={() => addCredit(50)}
                  className="text-xs text-purple-600 hover:text-purple-800 mt-2"
                >
                  Add $50 credits
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${balance?.totalEarnings.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Commission: {balance?.commissionRate || 15}%
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Request Withdrawal</p>
                    <p className="text-sm text-gray-500">Transfer earnings to your account</p>
                  </div>
                </button>

                <button
                  onClick={() => addCredit(100)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-6 h-6 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add Credits</p>
                    <p className="text-sm text-gray-500">Top up promotional credits</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View History</p>
                    <p className="text-sm text-gray-500">Track all transactions</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="earning">Earnings</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="credit">Credits</option>
                  <option value="deduction">Deductions</option>
                  <option value="refund">Refunds</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type, transaction.status)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {transaction.type.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-500">{transaction.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            ['earning', 'credit'].includes(transaction.type) 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {['earning', 'credit'].includes(transaction.type) ? '+' : '-'}
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.reference || transaction.orderId || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Withdrawal Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Withdrawal</h3>
                <form onSubmit={handleWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                      placeholder="0.00"
                      min="10"
                      max={balance?.available || 0}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Available: ${balance?.available.toFixed(2) || '0.00'} | Minimum: $10
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={withdrawalForm.methodId}
                      onChange={(e) => setWithdrawalForm({ ...withdrawalForm, methodId: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select payment method</option>
                      {withdrawalMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name} - {method.processingTime}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <textarea
                      value={withdrawalForm.note}
                      onChange={(e) => setWithdrawalForm({ ...withdrawalForm, note: e.target.value })}
                      placeholder="Add any additional notes..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Request Withdrawal
                  </button>
                </form>
              </div>

              {/* Recent Withdrawals */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h3>
                <div className="space-y-4">
                  {filteredTransactions
                    .filter(t => t.type === 'withdrawal')
                    .slice(0, 5)
                    .map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div>
                          <p className="font-medium text-gray-900">${withdrawal.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{withdrawal.method}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(withdrawal.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(withdrawal.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">
                  Add Method
                </button>
              </div>
              
              <div className="space-y-4">
                {withdrawalMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.details}</p>
                        <p className="text-xs text-gray-400">{method.processingTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Default
                        </span>
                      )}
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VendorWallet;