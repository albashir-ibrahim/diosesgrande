"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Group cart items by vendor for display
function groupByVendor(items: ReturnType<typeof useCart>["items"]) {
  const map = new Map<string, { vendorName: string; items: typeof items }>();
  for (const item of items) {
    const key = item.product.vendor.id;
    if (!map.has(key)) {
      map.set(key, { vendorName: item.product.vendor.name, items: [] });
    }
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalItems, totalPrice, updateQuantity, removeItem, isLoading } =
    useCart();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const groups = groupByVendor(items);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0b8241]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">
              My Cart
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Add items from our marketplace to get started</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="bg-[#0b8241] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#096b35] transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.vendorName}>
                  {/* Vendor header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#0b8241] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {group.vendorName[0]}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {group.vendorName}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Items for this vendor */}
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                        {/* Image */}
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          {item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.product.category.name}</p>
                          <p className="text-sm font-bold text-[#0b8241] mt-1">
                            ₦{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Qty + Remove */}
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="text-gray-300 hover:text-red-400 transition"
                            aria-label="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={isLoading || item.quantity <= 1}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition text-sm font-bold"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold text-gray-700 border-x border-gray-200 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading || item.quantity >= item.product.stock}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition text-sm font-bold"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({totalItems} items)</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-[#0b8241] font-medium">{totalPrice >= 20000 ? "FREE" : "₦2,000"}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>₦{(totalPrice + (totalPrice >= 20000 ? 0 : 2000)).toLocaleString()}</span>
              </div>
            </div>

            {totalPrice < 20000 && (
              <p className="text-[11px] text-center text-gray-400">
                Add ₦{(20000 - totalPrice).toLocaleString()} more for free delivery
              </p>
            )}

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-[#0b8241] text-white text-center py-3 rounded-xl font-bold text-sm hover:bg-[#096b35] transition"
            >
              Proceed to Checkout →
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
