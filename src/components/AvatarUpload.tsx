"use client";
import { useState, useRef } from 'react';
import { useAuth } from '@/context/authContext';
import LoadingSpinner from './LoadingSpinner';
import { FiCamera, FiUser, FiUpload } from 'react-icons/fi';

interface AvatarUploadProps {
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

export default function AvatarUpload({ 
  onUploadSuccess, 
  onUploadError, 
  size = 'md',
  editable = true 
}: AvatarUploadProps) {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please select a valid image file';
      onUploadError?.(error);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const error = 'File size cannot exceed 5MB';
      onUploadError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Update user context
      await updateUser({ avatar: data.data.avatar });
      
      onUploadSuccess?.(data.data.avatar);
      setPreview(null);
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (editable && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const avatarSrc = preview || user?.avatar;

  return (
    <div className="relative inline-block">
      <div 
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg ${
          editable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
        }`}
        onClick={handleClick}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user?.name || 'User avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <FiUser size={iconSizes[size]} className="text-white" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <LoadingSpinner size="sm" color="amber" />
          </div>
        )}

        {editable && !uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <FiCamera size={iconSizes[size]} className="text-white" />
          </div>
        )}
      </div>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={handleClick}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
            title="Upload new avatar"
          >
            {uploading ? (
              <LoadingSpinner size="sm" color="amber" />
            ) : (
              <FiUpload size={12} />
            )}
          </button>
        </>
      )}
    </div>
  );
}