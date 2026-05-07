"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        // We'll use a specific vendor fetch endpoint or just fetch from a shared detail endpoint if allowed
        // For simplicity, let's assume we have a way to fetch vendor-scoped details
        // Actually, I'll just use a server component for the initial load and a client component for the update logic if possible
        // But since this is already a client component, I'll fetch via API.
        const res = await fetch(`/api/vendor/orders/${id}`); // I need to create this GET route too
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/vendor/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      router.refresh();
      router.push("/vendor/orders");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading order details...</div>;
  if (error && !order) return <div className="p-20 text-center text-red-500 font-bold">{error}</div>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/vendor/orders" className="text-sm text-[#0b8241] font-bold hover:underline mb-6 inline-block">
        ← Back to Orders
      </Link>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black text-gray-900">Update Order Status</h1>
        <div className="flex items-center gap-3">
           <span className="text-xs font-bold text-gray-400 uppercase">Current Status:</span>
           <span className="bg-gray-100 text-gray-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-200">
             {order.status}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Info */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">Customer & Delivery Info</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</p>
                <p className="text-sm font-bold text-gray-800">{order.user.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Phone</p>
                <p className="text-sm font-bold text-gray-800">{order.contactPhone || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Address</p>
                <p className="text-sm text-gray-600 leading-relaxed">{order.shippingAddress || "No address provided"}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 px-8 py-5 border-b border-gray-100 bg-gray-50/50">Items to Ship</h2>
            <div className="divide-y divide-gray-50">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                    <img src={(item.product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Quantity: <span className="text-gray-700 font-bold">{item.quantity}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₦{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Update Form */}
        <aside>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Change Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select New Status</label>
                <div className="space-y-2">
                  {["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                        newStatus === status 
                          ? "bg-[#0b8241] text-white border-[#0b8241] shadow-md shadow-[#0b8241]/20" 
                          : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {status === "DELIVERED" ? "COMPLETED / DELIVERED" : status}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

              <button
                onClick={handleUpdate}
                disabled={updating || newStatus === order.status}
                className="w-full bg-[#0b8241] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#096b35] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-4"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 text-[10px] text-gray-400 leading-relaxed text-center">
              Changing status notifies the customer. Ensure items are ready before marking as **SHIPPED**.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
