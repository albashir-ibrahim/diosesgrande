"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

function groupByVendor(items: any[]) {
  const map = new Map<string, { vendorName: string; items: any[] }>();
  for (const item of items) {
    const key = item.product.vendor.id;
    if (!map.has(key)) map.set(key, { vendorName: item.product.vendor.name, items: [] });
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, refresh } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlErr = params.get("error");
    if (urlErr) {
      setError(urlErr);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const groups = groupByVendor(items);
  
  // Overall totals
  const overallSubtotal = totalPrice;
  const overallShipping = groups.reduce((acc, group) => {
    const vendorSub = group.items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
    return acc + (vendorSub >= 20000 ? 0 : 2000);
  }, 0);
  const grandTotal = overallSubtotal + overallShipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fullAddress = `${shipping.address}, ${shipping.city}, ${shipping.state}`;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: fullAddress,
          contactPhone: shipping.phone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const data = await res.json();
      
      if (data.authorization_url) {
        // Redirect to Paystack
        window.location.href = data.authorization_url;
      } else {
        // Fallback for non-payment flows or if something went wrong
        router.push("/dashboard/orders");
        await refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products" className="text-[#0b8241] font-medium hover:underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Forms */}
        <div className="flex-1 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#0b8241] text-white rounded-full flex items-center justify-center text-sm">1</span>
              Shipping Information
            </h2>
            
            <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={shipping.fullName}
                  onChange={e => setShipping({...shipping, fullName: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#0b8241] outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={shipping.phone}
                  onChange={e => setShipping({...shipping, phone: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#0b8241] outline-none transition"
                  placeholder="0801 234 5678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  required
                  type="text"
                  value={shipping.address}
                  onChange={e => setShipping({...shipping, address: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#0b8241] outline-none transition"
                  placeholder="123 Marketplace Way"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  required
                  type="text"
                  value={shipping.city}
                  onChange={e => setShipping({...shipping, city: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#0b8241] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  required
                  value={shipping.state}
                  onChange={e => setShipping({...shipping, state: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-[#0b8241] outline-none transition bg-white"
                >
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  {/* More states can be added */}
                </select>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6 opacity-60">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#0b8241] text-white rounded-full flex items-center justify-center text-sm">2</span>
              Payment Method
            </h2>
            <div className="p-4 border-2 border-[#0b8241] rounded-xl bg-[#f0faf4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-4 border-[#0b8241] bg-white"/>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Pay Online (Paystack)</p>
                  <p className="text-xs text-gray-500">Secure payment via Cards, Transfer, or USSD</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-60 grayscale">
                <span className="text-[10px] font-bold border rounded px-1">VISA</span>
                <span className="text-[10px] font-bold border rounded px-1">MASTER</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-gray-400">Your payment will be processed securely via Paystack. You will be redirected to complete the transaction.</p>
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <aside className="lg:w-[400px] shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h2>
            
            {/* Vendor Groups */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6">
              {groups.map((group) => {
                const vendorSub = group.items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
                const vendorShipping = vendorSub >= 20000 ? 0 : 2000;
                
                return (
                  <div key={group.vendorName} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#e6f4ea] text-[#0b8241] rounded-full flex items-center justify-center text-[10px] font-bold">
                        {group.vendorName[0]}
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase">{group.vendorName}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {group.items.map((item: any) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg shrink-0 overflow-hidden border border-gray-100">
                             <img src={(item.product.images as string[])[0]} alt="" className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                            <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-900">₦{(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 text-right">
                       <p className="text-[10px] text-gray-400">Vendor Shipping: <span className="text-[#0b8241] font-medium">{vendorShipping === 0 ? "FREE" : `₦${vendorShipping.toLocaleString()}`}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>₦{overallSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Delivery</span>
                <span>₦{overallShipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-4">
                <span>Grand Total</span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {error && <p className="mt-4 text-xs text-red-500 font-medium bg-red-50 p-2 rounded">{error}</p>}

            <button
              form="checkout-form"
              disabled={loading}
              className="w-full mt-6 bg-[#0b8241] text-white py-4 rounded-xl font-bold text-base hover:bg-[#096b35] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <>Place Order & Pay ₦{grandTotal.toLocaleString()}</>
              )}
            </button>
            
            <p className="mt-4 text-[10px] text-center text-gray-400">
              By placing your order, you agree to Diosesgrande's <Link href="#" className="underline">Terms of Use</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
