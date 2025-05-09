"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { UploadButton } from "@/utils/uploadthing";

export default function CreateBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    readTime: "",
    imageUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-light mb-8">Create New Blog Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content (HTML)
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              required
            >
              <option value="">Select a category</option>
              <option value="Sustainability">Sustainability</option>
              <option value="Urban Design">Urban Design</option>
              <option value="Design Theory">Design Theory</option>
              <option value="Materials">Materials</option>
              <option value="Case Studies">Case Studies</option>
            </select>
          </div>

          <div>
            <label htmlFor="readTime" className="block text-sm font-medium mb-2">
              Read Time
            </label>
            <input
              type="text"
              id="readTime"
              name="readTime"
              value={formData.readTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g., 5 min read"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Featured Image
          </label>
          {/* <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              setFormData(prev => ({ ...prev, imageUrl: res[0].url }));
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          /> */}
          {formData.imageUrl && (
            <div className="mt-4">
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="max-h-60 rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:bg-amber-400"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}