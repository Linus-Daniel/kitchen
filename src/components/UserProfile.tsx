"use client";
import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import AvatarUpload from './AvatarUpload';
import LoadingSpinner from './LoadingSpinner';
import { FiEdit2, FiSave, FiX, FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';

interface UserProfileProps {
  onUpdateSuccess?: () => void;
  onUpdateError?: (error: string) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | '';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
}

export default function UserProfile({ onUpdateSuccess, onUpdateError }: UserProfileProps) {
  const { user, updateUser, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: (user?.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say') || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Nigeria',
    },
    businessName: user?.businessName || '',
    businessDescription: user?.businessDescription || '',
    businessCategory: user?.businessCategory || '',
    preferences: {
      newsletter: user?.preferences?.newsletter ?? true,
      smsNotifications: user?.preferences?.smsNotifications ?? true,
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      orderUpdates: user?.preferences?.orderUpdates ?? true,
      promotions: user?.preferences?.promotions ?? true,
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else if (field.startsWith('preferences.')) {
      const preferenceField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [preferenceField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Filter out empty gender field and convert to proper User type
      const updateData: Partial<any> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        address: formData.address,
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        businessCategory: formData.businessCategory,
        preferences: formData.preferences,
      };

      await updateUser(updateData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      onUpdateSuccess?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      onUpdateError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: (user?.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say') || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'Nigeria',
      },
      businessName: user?.businessName || '',
      businessDescription: user?.businessDescription || '',
      businessCategory: user?.businessCategory || '',
      preferences: {
        newsletter: user?.preferences?.newsletter ?? true,
        smsNotifications: user?.preferences?.smsNotifications ?? true,
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        orderUpdates: user?.preferences?.orderUpdates ?? true,
        promotions: user?.preferences?.promotions ?? true,
      },
    });
    setEditing(false);
    setError(null);
  };

  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    setSuccess('Avatar updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAvatarUploadError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <FiEdit2 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? <LoadingSpinner size="sm" /> : <FiSave size={16} />}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <FiX size={16} />
              Cancel
            </button>
          </div>
        )}
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

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <AvatarUpload
          size="xl"
          editable={true}
          onUploadSuccess={handleAvatarUploadSuccess}
          onUploadError={handleAvatarUploadError}
        />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h3>
        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
      </div>

      {/* Profile Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUser className="inline mr-1" size={14} />
              Full Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiMail className="inline mr-1" size={14} />
              Email Address
            </label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter your email"
              />
            ) : (
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiPhone className="inline mr-1" size={14} />
              Phone Number
            </label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            {editing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            ) : (
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            {editing ? (
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            ) : (
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).replace('-', ' ') : 'Not specified'}
              </p>
            )}
          </div>

          {user.role === 'vendor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your business name"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.businessName || 'Not specified'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description
                </label>
                {editing ? (
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Describe your business"
                    rows={3}
                  />
                ) : (
                  <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.businessDescription || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Category
                </label>
                {editing ? (
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => handleInputChange('businessCategory', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select category</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="fast-food">Fast Food</option>
                    <option value="cafe">Cafe</option>
                    <option value="bakery">Bakery</option>
                    <option value="dessert">Dessert Shop</option>
                    <option value="beverage">Beverage Shop</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.businessCategory || 'Not specified'}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Address Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <FiMapPin className="mr-2" size={18} />
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your street address"
                />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.address?.street || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your city"
                />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.address?.city || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your state"
                />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.address?.state || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter your ZIP code"
                />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.address?.zipCode || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              {editing ? (
                <select
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg">{user.address?.country || 'Nigeria'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            Notification Preferences
          </h4>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Newsletter Subscription</label>
              {editing ? (
                <input
                  type="checkbox"
                  checked={formData.preferences.newsletter}
                  onChange={(e) => handleInputChange('preferences.newsletter', e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.preferences?.newsletter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.preferences?.newsletter ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
              {editing ? (
                <input
                  type="checkbox"
                  checked={formData.preferences.smsNotifications}
                  onChange={(e) => handleInputChange('preferences.smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.preferences?.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.preferences?.smsNotifications ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              {editing ? (
                <input
                  type="checkbox"
                  checked={formData.preferences.emailNotifications}
                  onChange={(e) => handleInputChange('preferences.emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.preferences?.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Order Updates</label>
              {editing ? (
                <input
                  type="checkbox"
                  checked={formData.preferences.orderUpdates}
                  onChange={(e) => handleInputChange('preferences.orderUpdates', e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-2 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.preferences?.orderUpdates ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.preferences?.orderUpdates ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Promotional Offers</label>
              {editing ? (
                <input
                  type="checkbox"
                  checked={formData.preferences.promotions}
                  onChange={(e) => handleInputChange('preferences.promotions', e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.preferences?.promotions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.preferences?.promotions ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}