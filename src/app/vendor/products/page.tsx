"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Search, ToggleLeft, ToggleRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  cookTime: string;
  isAvailable: boolean;
  salesCount: number;
  createdAt: string;
}

export default function VendorProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = [
    "appetizers", "main-course", "desserts", "beverages", "salads",
    "pizza", "burgers", "pasta", "seafood", "vegetarian", "vegan"
  ];

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getVendorProducts();
      let filteredProducts = response.data || [];
      
      // Apply client-side filtering since vendor products endpoint might not support filters
      if (searchTerm) {
        filteredProducts = filteredProducts.filter((product: Product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (categoryFilter) {
        filteredProducts = filteredProducts.filter((product: Product) =>
          product.category === categoryFilter
        );
      }
      
      setProducts(filteredProducts);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await apiClient.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await apiClient.updateProduct(productId, { isAvailable: !currentStatus });
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, isAvailable: !currentStatus } : p
      ));
    } catch (err: any) {
      setError(err.message || "Failed to update product availability");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to manage your products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Products</h2>
          <p className="text-muted-foreground">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {searchTerm || categoryFilter ? "No products match your filters" : "No products yet. Create your first product!"}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/api/placeholder/40/40";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/vendor/products/${product._id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.isAvailable ? "default" : "secondary"}>
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                        <button
                          onClick={() => handleToggleAvailability(product._id, product.isAvailable)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {product.isAvailable ? 
                            <ToggleRight className="h-4 w-4 text-green-600" /> : 
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          }
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.salesCount || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{product.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/vendor/products/${product._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}