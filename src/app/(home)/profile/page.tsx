"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Shield, 
  Bell,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Upload,
  Save,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";
import AvatarUpload from "@/components/AvatarUpload";
import AddressManager from "@/components/AddressManager";
import PasswordChange from "@/components/PasswordChange";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      orderUpdates: boolean;
      promotions: boolean;
    };
    privacy: {
      profileVisibility: string;
      shareData: boolean;
    };
    dietary?: string[];
  };
  // Vendor specific fields
  businessName?: string;
  businessDescription?: string;
  businessCategory?: string;
  isVerified?: boolean;
  verificationStatus?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    businessDescription: "",
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        orderUpdates: true,
        promotions: false,
      },
      privacy: {
        profileVisibility: "public",
        shareData: false,
      },
      dietary: [] as string[],
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile/complete');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        
        // Populate form data
        setFormData({
          name: data.data.name || "",
          phone: data.data.phone || "",
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : "",
          gender: data.data.gender || "",
          businessDescription: data.data.businessDescription || "",
          preferences: {
            notifications: {
              email: data.data.preferences?.notifications?.email ?? true,
              push: data.data.preferences?.notifications?.push ?? true,
              sms: data.data.preferences?.notifications?.sms ?? false,
              orderUpdates: data.data.preferences?.notifications?.orderUpdates ?? true,
              promotions: data.data.preferences?.notifications?.promotions ?? false,
            },
            privacy: {
              profileVisibility: data.data.preferences?.privacy?.profileVisibility || "public",
              shareData: data.data.preferences?.privacy?.shareData ?? false,
            },
            dietary: data.data.preferences?.dietary || [],
          }
        });
      }
    } catch (error) {
      showToast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/user/profile/complete', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast.success('Profile updated successfully');
        fetchProfile();
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      showToast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="h-4 w-4 mr-2" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{profile.name}</h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {profile.role === 'vendor' ? 'Vendor' : 'Customer'}
                  </Badge>
                  {profile.role === 'vendor' && (
                    <Badge 
                      variant={profile.isVerified ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {profile.isVerified ? 'Verified' : 'Pending Verification'}
                    </Badge>
                  )}
                </div>
                <AvatarUpload
                  currentAvatar={profile.avatar}
                  onUploadComplete={() => fetchProfile()}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {profile.role === 'vendor' && (
                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business..."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordChange />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={formData.preferences.notifications.email}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.notifications.email', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={formData.preferences.notifications.push}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.notifications.push', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={formData.preferences.notifications.sms}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.notifications.sms', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about order status changes</p>
                </div>
                <Switch
                  checked={formData.preferences.notifications.orderUpdates}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.notifications.orderUpdates', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Promotions</Label>
                  <p className="text-sm text-gray-500">Receive promotional offers and deals</p>
                </div>
                <Switch
                  checked={formData.preferences.notifications.promotions}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.notifications.promotions', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Profile Visibility</Label>
                <select
                  value={formData.preferences.privacy.profileVisibility}
                  onChange={(e) => 
                    handleInputChange('preferences.privacy.profileVisibility', e.target.value)
                  }
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Usage Data</Label>
                  <p className="text-sm text-gray-500">Help improve our service by sharing anonymous usage data</p>
                </div>
                <Switch
                  checked={formData.preferences.privacy.shareData}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.privacy.shareData', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}