"use client";

import { FormEvent, useState } from "react";
import { useAuth } from '@/context/authContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiAlertCircle } from 'react-icons/fi';
import { Store } from 'lucide-react';
import { VendorRegisterData } from '@/lib/api';

export default function VendorRegistrationPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    description: '',
    cuisineType: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.businessName || !formData.ownerName || !formData.cuisineType) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const vendorData: VendorRegisterData = {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        description: formData.description,
        address: formData.address,
        cuisineType: [formData.cuisineType]
      };

      await register(vendorData as any, true); // true indicates vendor registration
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 mx-auto">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-800">Register Your Restaurant</CardTitle>
            <CardDescription>
              Join our platform and start serving customers today
            </CardDescription>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-2">
                <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div 
                className="flex items-center bg-red-100 text-red-700 p-3 rounded-lg mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FiAlertCircle className="mr-2" />
                {error}
              </motion.div>
            )}

            <form className="space-y-4">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Enter restaurant name"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Enter owner's full name"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cuisineType">Cuisine Type *</Label>
                    <Select value={formData.cuisineType} onValueChange={(value) => handleInputChange('cuisineType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="thai">Thai</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="fast-food">Fast Food</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Restaurant Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your restaurant, specialties, and what makes you unique"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full bg-orange-600 hover:bg-orange-700">
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input 
                      id="street" 
                      placeholder="123 Main Street" 
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        placeholder="City" 
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State *</Label>
                      <Input 
                        id="state" 
                        placeholder="State" 
                        value={formData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input 
                        id="zipCode" 
                        placeholder="12345" 
                        value={formData.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="button" onClick={handleNext} className="flex-1 bg-orange-600 hover:bg-orange-700">
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="restaurant@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-gray-500">Password must be at least 6 characters long</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your application will be reviewed within 24-48 hours</li>
                      <li>• You'll receive an email confirmation once approved</li>
                      <li>• You can then start adding your menu items</li>
                      <li>• Begin receiving orders from customers</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleSubmit} 
                      className="flex-1 bg-orange-600 hover:bg-orange-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/vendor/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Sign in to your dashboard
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}