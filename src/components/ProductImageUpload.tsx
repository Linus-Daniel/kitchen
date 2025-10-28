"use client";
import { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { FiUpload, FiX, FiImage, FiCamera } from 'react-icons/fi';

interface ProductImage {
  url: string;
  public_id: string;
  width: number;
  height: number;
}

interface ProductImageUploadProps {
  existingImages?: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onUploadError?: (error: string) => void;
  maxImages?: number;
  required?: boolean;
}

export default function ProductImageUpload({
  existingImages = [],
  onImagesChange,
  onUploadError,
  maxImages = 5,
  required = false
}: ProductImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check total number of images
    if (images.length + fileArray.length > maxImages) {
      onUploadError?.(` You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate files
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        onUploadError?.(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        onUploadError?.(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    handleUpload(validFiles);
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      const newImages = [...images, ...data.data.images];
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Product image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FiUpload size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Product Images
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <button
                type="button"
                onClick={openFileDialog}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <FiCamera size={16} />
                Select Images
              </button>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, WEBP up to 10MB each. Maximum {maxImages} images.
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove image"
              >
                <FiX size={16} />
              </button>

              {/* Primary indicator */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <FiImage size={48} className="mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500">
        <p>• The first image will be used as the primary product image</p>
        <p>• Images will be automatically optimized for web display</p>
        <p>• Drag and drop to reorder images (coming soon)</p>
      </div>
    </div>
  );
}