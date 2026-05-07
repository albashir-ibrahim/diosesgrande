"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState, useEffect } from "react";

function groupByVendor(items: ReturnType<typeof useCart>["items"]) {
  const map = new Map<string, { vendorName: string; items: typeof items }>();
  for (const item of items) {
    const key = item.product.vendor.id;
    if (!map.has(key)) map.set(key, { vendorName: item.product.vendor.name, items: [] });
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
}

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, isLoading, refresh } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  if (!mounted) return null;

  const groups = groupByVendor(items);
  const delivery = totalPrice >= 20000 ? 0 : 2000;
  const grand = totalPrice + delivery;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Shopping Cart
        {totalItems > 0 && <span className="text-base font-normal text-gray-500 ml-2">({totalItems} item{totalItems !== 1 ? "s" : ""})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link href="/products" className="bg-[#0b8241] text-white px-8 py-3 rounded-full font-bold hover:bg-[#096b35] transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {groups.map((group) => (
              <div key={group.vendorName} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Vendor Header */}
                <div className="flex items-center gap-3 px-6 py-4 bg-[#f0faf4] border-b border-[#d1eedd]">
                  <div className="w-8 h-8 bg-[#0b8241] rounded-full flex items-center justify-center text-white font-bold">
                    {group.vendorName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{group.vendorName}</p>
                    <p className="text-xs text-gray-500">{group.items.length} item{group.items.length !== 1 ? "s" : ""} from this vendor</p>
                  </div>
                  <span className="ml-auto text-xs text-[#0b8241] font-medium bg-[#d1eedd] px-2 py-0.5 rounded-full">
                    ✅ Verified Vendor
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-5">
                      {/* Image */}
                      <Link href={`/products/${item.product.id}`} className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 hover:opacity-80 transition">
                        {item.product.images[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.id}`} className="text-sm font-semibold text-gray-800 hover:text-[#0b8241] transition line-clamp-2 leading-snug">
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">{item.product.category.name}</p>
                        <p className="text-sm font-bold text-[#0b8241] mt-2">₦{item.product.price.toLocaleString()} <span className="text-gray-400 font-normal text-xs">/ unit</span></p>

                        {/* Qty + Remove */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={isLoading || item.quantity <= 1}
                              className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition font-bold"
                            >−</button>
                            <span className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-x border-gray-200 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading || item.quantity >= item.product.stock}
                              className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition font-bold"
                            >+</button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="text-sm text-red-400 hover:text-red-600 transition flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-gray-900">₦{(item.product.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × ₦{item.product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-800 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-[#0b8241] font-medium" : ""}>
                    {delivery === 0 ? "FREE" : `₦${delivery.toLocaleString()}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-gray-400 bg-[#f0faf4] rounded-lg px-3 py-2">
                    🚚 Add ₦{(20000 - totalPrice).toLocaleString()} more for free delivery
                  </p>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>₦{grand.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full mt-6 bg-[#0b8241] text-white text-center py-3.5 rounded-xl font-bold hover:bg-[#096b35] transition text-sm">
                Proceed to Checkout →
              </Link>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: "🔒", label: "Secure Payment" },
                  { icon: "🛡️", label: "Buyer Protection" },
                  { icon: "🔄", label: "Easy Returns" },
                ].map((b) => (
                  <div key={b.label} className="bg-gray-50 rounded-lg px-2 py-2">
                    <div className="text-lg">{b.icon}</div>
                    <div className="text-[9px] text-gray-500 leading-tight mt-1">{b.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-[#0b8241] hover:underline">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
