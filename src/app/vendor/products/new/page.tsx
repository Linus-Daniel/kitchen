"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus } from "lucide-react";
import { apiClient } from "@/lib/api";
import ProductImageUpload from "@/components/ProductImageUpload";

interface ProductOption {
  name: string;
  choices: string[];
  required: boolean;
}

export default function VendorNewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    cookTime: "",
    image: "",
    images: [] as Array<{url: string; public_id: string; width: number; height: number}>,
    ingredients: [""],
    dietary: [] as string[],
    options: [] as ProductOption[],
    isAvailable: true
  });

  const categories = [
    "appetizers", "main-course", "desserts", "beverages", "salads", 
    "pizza", "burgers", "pasta", "seafood", "vegetarian", "vegan"
  ];

  const dietaryOptions = [
    "vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free", 
    "halal", "kosher", "organic", "spicy", "low-carb"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ""] }));
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleDietaryChange = (option: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, dietary: [...prev.dietary, option] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        dietary: prev.dietary.filter(item => item !== option) 
      }));
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { name: "", choices: [""], required: false }]
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (optionIndex: number, field: string, value: any) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleChoiceChange = (optionIndex: number, choiceIndex: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].choices[choiceIndex] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addChoice = (optionIndex: number) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].choices.push("");
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].choices = newOptions[optionIndex].choices.filter((_, i) => i !== choiceIndex);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a product");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validate that at least one image is uploaded
      if (formData.images.length === 0) {
        setError("Please upload at least one product image");
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        vendor: user._id,
        vendorName: user.businessName || user.name,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ""),
        options: formData.options.filter(opt => 
          opt.name.trim() !== "" && opt.choices.some(choice => choice.trim() !== "")
        ).map(opt => ({
          ...opt,
          choices: opt.choices.filter(choice => choice.trim() !== "")
        }))
      };

      await apiClient.createProduct(productData);
      router.push("/vendor/products");
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-600">Create a new menu item for your restaurant</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cookTime">Cook Time *</Label>
                <Input
                  id="cookTime"
                  placeholder="e.g., 15-20 mins"
                  value={formData.cookTime}
                  onChange={(e) => handleInputChange("cookTime", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Product Images */}
            <ProductImageUpload
              existingImages={formData.images}
              onImagesChange={(images) => {
                handleInputChange("images", images);
                handleInputChange("image", images[0]?.url || "");
              }}
              onUploadError={(error) => setError(error)}
              maxImages={5}
              required
            />

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            {/* Ingredients */}
            <div>
              <Label>Ingredients</Label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="Enter ingredient"
                  />
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            {/* Dietary Options */}
            <div>
              <Label>Dietary Options</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {dietaryOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={formData.dietary.includes(option)}
                      onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                    />
                    <Label htmlFor={option} className="text-sm">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Options */}
            <div>
              <Label>Product Options (Size, Extras, etc.)</Label>
              {formData.options.map((option, optionIndex) => (
                <div key={optionIndex} className="border rounded-lg p-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      placeholder="Option name (e.g., Size, Extras)"
                      value={option.name}
                      onChange={(e) => handleOptionChange(optionIndex, "name", e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={option.required}
                        onCheckedChange={(checked) => handleOptionChange(optionIndex, "required", checked)}
                      />
                      <Label className="text-sm">Required</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(optionIndex)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {option.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex gap-2 mt-2">
                      <Input
                        placeholder="Choice option"
                        value={choice}
                        onChange={(e) => handleChoiceChange(optionIndex, choiceIndex, e.target.value)}
                      />
                      {option.choices.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeChoice(optionIndex, choiceIndex)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addChoice(optionIndex)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Choice
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => handleInputChange("isAvailable", checked)}
              />
              <Label htmlFor="isAvailable">Product is available</Label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}