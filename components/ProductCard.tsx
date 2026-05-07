"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  vendor: { id: string; name: string; slug?: string | null };
  category: { id: string; name: string };
  reviews?: { rating: number }[];
}

function StarRating({ reviews }: { reviews?: { rating: number }[] }) {
  if (!reviews || reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`w-3 h-3 ${s <= Math.round(avg) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-gray-500">({reviews.length})</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  const { addToCart, isLoading } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      setError(err.message ?? "Failed to add");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-[#0b8241]/20 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-[#0b8241] font-medium mb-0.5">{product.category.name}</p>
        <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 flex-1">{product.name}</h3>
        <StarRating reviews={product.reviews} />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 mb-2">by {product.vendor.name}</p>

        {/* Add to Cart button */}
        {error ? (
          <div className="text-[10px] text-red-500 text-center py-1">{error}</div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className={`w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200 ${
              added
                ? "bg-[#0b8241] text-white"
                : product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#e6f4ea] text-[#0b8241] hover:bg-[#0b8241] hover:text-white"
            }`}
          >
            {added ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        )}
      </div>
    </Link>
  );
}
