"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface AddToCartLargeProps {
  productId: string;
  stock: number;
}

export default function AddToCartLarge({ productId, stock }: AddToCartLargeProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    setError("");
    try {
      await addToCart(productId, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to add to cart");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (stock === 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 transition font-bold text-lg"
            disabled={quantity <= 1 || isLoading}
          >
            −
          </button>
          <span className="px-6 py-2 font-bold text-gray-800 border-x border-gray-100 min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 transition font-bold text-lg"
            disabled={quantity >= stock || isLoading}
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-400">{stock} units available</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className={`flex-1 py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-sm ${
            added
              ? "bg-[#0b8241] text-white"
              : "bg-[#0b8241] text-white hover:bg-[#096b35] active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : added ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Added to Cart!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              Add to Cart
            </>
          )}
        </button>

        <button className="border-2 border-gray-100 text-gray-400 py-4 px-5 rounded-xl hover:bg-gray-50 hover:text-red-400 hover:border-red-50 transition active:scale-[0.95]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
