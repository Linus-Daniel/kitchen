"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import Link from "next/link";

interface ProductOption {
  name: string;
  choices: Array<{
    choice: string;
    additionalPrice: number;
  }>;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isAvailable: boolean;
  preparationTime: number;
  servingSize: number;
  calories?: number;
  allergens: string[];
  dietaryInfo: string[];
  ingredients: string[];
  nutritionInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  productOptions: ProductOption[];
  tags: string[];
  spiceLevel?: string;
  deliveryFee?: number;
}

const categories = [
  "appetizers",
  "main-course", 
  "desserts",
  "beverages",
  "salads",
  "soups",
  "snacks",
  "breakfast",
  "lunch",
  "dinner"
];

const allergenOptions = [
  "gluten", "dairy", "nuts", "soy", "eggs", "shellfish", "fish", "peanuts"
];

const dietaryOptions = [
  "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo", "low-carb", "halal", "kosher"
];

const spiceLevels = ["mild", "medium", "hot", "very-hot"];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    images: [""],
    isAvailable: true,
    preparationTime: 15,
    servingSize: 1,
    calories: 0,
    allergens: [],
    dietaryInfo: [],
    ingredients: [""],
    nutritionInfo: {},
    productOptions: [],
    tags: [],
    spiceLevel: "",
    deliveryFee: 0,
  });

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProduct(params.id as string);
      const product = response.data.data;
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "",
        images: product.images?.length ? product.images : [""],
        isAvailable: product.isAvailable !== false,
        preparationTime: product.preparationTime || 15,
        servingSize: product.servingSize || 1,
        calories: product.calories || 0,
        allergens: product.allergens || [],
        dietaryInfo: product.dietaryInfo || [],
        ingredients: product.ingredients?.length ? product.ingredients : [""],
        nutritionInfo: product.nutritionInfo || {},
        productOptions: product.productOptions || [],
        tags: product.tags || [],
        spiceLevel: product.spiceLevel || "",
        deliveryFee: product.deliveryFee || 0,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Filter out empty images and ingredients
      const cleanedData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ""),
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ""),
        nutritionInfo: formData.nutritionInfo && Object.keys(formData.nutritionInfo).length > 0 ? formData.nutritionInfo : undefined,
      };

      await apiClient.updateProduct(params.id as string, cleanedData);
      setSuccess("Product updated successfully!");
      
      setTimeout(() => {
        router.push("/vendor/products");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.deleteProduct(params.id as string);
      router.push("/vendor/products");
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
      setDeleting(false);
    }
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addIngredientField = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ""]
    }));
  };

  const removeIngredientField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredientField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const addProductOption = () => {
    setFormData(prev => ({
      ...prev,
      productOptions: [...prev.productOptions, { name: "", choices: [{ choice: "", additionalPrice: 0 }] }]
    }));
  };

  const removeProductOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productOptions: prev.productOptions.filter((_, i) => i !== index)
    }));
  };

  const updateProductOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productOptions: prev.productOptions.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const addChoice = (optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      productOptions: prev.productOptions.map((option, i) => 
        i === optionIndex ? {
          ...option,
          choices: [...option.choices, { choice: "", additionalPrice: 0 }]
        } : option
      )
    }));
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      productOptions: prev.productOptions.map((option, i) => 
        i === optionIndex ? {
          ...option,
          choices: option.choices.filter((_, j) => j !== choiceIndex)
        } : option
      )
    }));
  };

  const updateChoice = (optionIndex: number, choiceIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productOptions: prev.productOptions.map((option, i) => 
        i === optionIndex ? {
          ...option,
          choices: option.choices.map((choice, j) => 
            j === choiceIndex ? { ...choice, [field]: value } : choice
          )
        } : option
      )
    }));
  };

  const toggleArrayItem = (array: string[], item: string, field: keyof ProductFormData) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to edit products.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendor/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
            <p className="text-muted-foreground">Update your product details</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? "Deleting..." : "Delete Product"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  min="1"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 15 }))}
                />
              </div>
              <div>
                <Label htmlFor="servingSize">Serving Size</Label>
                <Input
                  id="servingSize"
                  type="number"
                  min="1"
                  value={formData.servingSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, servingSize: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: !!checked }))}
              />
              <Label htmlFor="isAvailable">Available for orders</Label>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => updateImageField(index, e.target.value)}
                  />
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageField}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ingredient"
                    value={ingredient}
                    onChange={(e) => updateIngredientField(index, e.target.value)}
                  />
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredientField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredientField}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Allergens</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allergenOptions.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant={formData.allergens.includes(allergen) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(formData.allergens, allergen, 'allergens')}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dietaryOptions.map((diet) => (
                  <Badge
                    key={diet}
                    variant={formData.dietaryInfo.includes(diet) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(formData.dietaryInfo, diet, 'dietaryInfo')}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="spiceLevel">Spice Level</Label>
                <Select value={formData.spiceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, spiceLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select spice level" />
                  </SelectTrigger>
                  <SelectContent>
                    {spiceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Options */}
        <Card>
          <CardHeader>
            <CardTitle>Product Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.productOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <Input
                      placeholder="Option name (e.g., Size, Toppings)"
                      value={option.name}
                      onChange={(e) => updateProductOption(optionIndex, 'name', e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductOption(optionIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {option.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex gap-2">
                        <Input
                          placeholder="Choice name"
                          value={choice.choice}
                          onChange={(e) => updateChoice(optionIndex, choiceIndex, 'choice', e.target.value)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Additional price"
                          value={choice.additionalPrice}
                          onChange={(e) => updateChoice(optionIndex, choiceIndex, 'additionalPrice', parseFloat(e.target.value) || 0)}
                          className="max-w-xs"
                        />
                        {option.choices.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeChoice(optionIndex, choiceIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addChoice(optionIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Choice
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addProductOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product Option
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}