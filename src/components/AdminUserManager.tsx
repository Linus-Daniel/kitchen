"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { 
  FiSearch, 
  FiFilter, 
  FiUsers, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiEye
} from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'vendor' | 'admin';
  isEmailVerified: boolean;
  businessName?: string;
  businessCategory?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: string;
  lastLogin?: string;
}

interface UsersResponse {
  success: boolean;
  count: number;
  total: number;
  data: User[];
}

export default function AdminUserManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [limit] = useState(10);

  // Selected user for details view
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewUser = (userData: User) => {
    setSelectedUser(userData);
    setShowUserDetails(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      setSuccess('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'vendor':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiUsers className="mr-2" size={24} />
          User Management
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {totalUsers} total users
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <span className="flex items-center text-sm font-medium text-gray-700">
            <FiFilter className="mr-1" size={14} />
            Filter by role:
          </span>
          <button
            onClick={() => handleRoleFilter('')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              roleFilter === '' 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRoleFilter('user')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              roleFilter === 'user' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleRoleFilter('vendor')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              roleFilter === 'vendor' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Vendors
          </button>
          <button
            onClick={() => handleRoleFilter('admin')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              roleFilter === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" text="Loading users..." />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center p-8">
          <FiUsers size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    User
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Role
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Contact
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Business
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Joined
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr key={userData._id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{userData.name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiMail className="mr-1" size={12} />
                          {userData.email}
                          {userData.isEmailVerified && (
                            <span className="ml-2 px-1 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                              Verified
                            </span>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(userData.role)}`}>
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="text-sm">
                        {userData.phone && (
                          <p className="flex items-center text-gray-600">
                            <FiPhone className="mr-1" size={12} />
                            {userData.phone}
                          </p>
                        )}
                        {userData.address?.city && (
                          <p className="flex items-center text-gray-600 mt-1">
                            <FiMapPin className="mr-1" size={12} />
                            {userData.address.city}, {userData.address.state}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {userData.role === 'vendor' && (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{userData.businessName || 'N/A'}</p>
                          <p className="text-gray-500 capitalize">{userData.businessCategory || 'N/A'}</p>
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="text-sm text-gray-600">
                        <p className="flex items-center">
                          <FiCalendar className="mr-1" size={12} />
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewUser(userData)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="View details"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userData._id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete user"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={14} />
                Previous
              </button>
              <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedUser.role === 'vendor' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Business Name:</span>
                        <p className="font-medium">{selectedUser.businessName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <p className="font-medium capitalize">{selectedUser.businessCategory || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <div className="text-sm">
                      <p>{selectedUser.address.street || 'Street not provided'}</p>
                      <p>{selectedUser.address.city}, {selectedUser.address.state}</p>
                      <p>{selectedUser.address.country}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-600">Email Verified:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedUser.isEmailVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Joined:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}