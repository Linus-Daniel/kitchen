"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Search,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";

interface Vendor {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
  description?: string;
  cuisineType?: string[];
}

export default function VendorVerificationPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/vendors/verification?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data.data);
      }
    } catch (error) {
      showToast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const handleVerificationAction = async (vendorId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(vendorId);
      
      const response = await fetch('/api/admin/vendors/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          action,
          reason: action === 'reject' ? rejectionReason : undefined
        })
      });

      if (response.ok) {
        showToast.success(`Vendor ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchVendors();
        setSelectedVendor(null);
        setRejectionReason('');
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

  const filteredVendors = vendors.filter(vendor =>
    vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.verificationStatus === 'rejected') {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    if (vendor.isVerified) {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Verification</h1>
          <p className="text-gray-600">Review and verify vendor applications</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('verified')}
              >
                Verified
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </Button>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading vendors...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No vendors found</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedVendor?._id === vendor._id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{vendor.businessName}</h3>
                      {getStatusBadge(vendor)}
                    </div>
                    <p className="text-gray-600 mb-1">Owner: {vendor.ownerName}</p>
                    <p className="text-gray-600 mb-1">{vendor.email}</p>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(vendor.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        {vendor.address.city}, {vendor.address.state}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Vendor Details */}
        <div className="lg:sticky lg:top-6">
          {selectedVendor ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Vendor Details
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-xl">{selectedVendor.businessName}</h3>
                  {getStatusBadge(selectedVendor)}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Owner</label>
                    <p>{selectedVendor.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p>{selectedVendor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p>{selectedVendor.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p>
                      {selectedVendor.address.street}<br />
                      {selectedVendor.address.city}, {selectedVendor.address.state} {selectedVendor.address.zipCode}
                    </p>
                  </div>
                  {selectedVendor.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p>{selectedVendor.description}</p>
                    </div>
                  )}
                  {selectedVendor.cuisineType && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cuisine Type</label>
                      <div className="flex gap-1 flex-wrap">
                        {selectedVendor.cuisineType.map((cuisine, index) => (
                          <Badge key={index} variant="outline">{cuisine}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!selectedVendor.isVerified && selectedVendor.verificationStatus !== 'rejected' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rejection Reason (if rejecting)</label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejection..."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleVerificationAction(selectedVendor._id, 'approve')}
                        disabled={actionLoading === selectedVendor._id}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleVerificationAction(selectedVendor._id, 'reject')}
                        disabled={actionLoading === selectedVendor._id || !rejectionReason.trim()}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a vendor to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}