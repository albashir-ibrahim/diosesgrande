"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    images: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...uploadedImages];

    try {
      for (const file of Array.from(files)) {
        if (newImages.length >= 5) break;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push(data.url);
        }
      }
      setUploadedImages(newImages);
    } catch (err) {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setError("Failed to load categories"));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError("Please select a category");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        categoryId: formData.categoryId,
        images: uploadedImages,
      };

      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      router.push("/vendor/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
        <button onClick={() => router.back()} className="text-gray-500 hover:underline text-sm">
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241] text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail..."
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 h-32 resize-none outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241] text-sm"
              required
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241] text-sm"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241] text-sm bg-white"
              required
            >
              <option value="">-- Select a category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No categories found. Please seed the database or add categories first.
              </p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Product Images <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group bg-gray-50 border border-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              
              {uploadedImages.length < 5 && (
                <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#0b8241] transition-all group">
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-[#0b8241] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-[#e6f4ea] transition-colors">
                         <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0b8241]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload up to 5 photos. Min size 500x500px.</p>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-gray-50 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-[#0b8241] text-white px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#096b35] transition-all shadow-lg shadow-[#0b8241]/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
