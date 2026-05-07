import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      vendor: { select: { name: true, logo: true } },
      orderItems: {
        include: { product: { select: { id: true, name: true, images: true, category: { select: { name: true } } } } },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "PAID": return "bg-blue-100 text-blue-700";
      case "PROCESSING": return "bg-purple-100 text-purple-700";
      case "SHIPPED": return "bg-indigo-100 text-indigo-700";
      case "DELIVERED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "DELIVERED") return "COMPLETED";
    return status;
  };

  const steps = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/dashboard/orders" className="text-sm text-[#0b8241] font-bold hover:underline mb-4 inline-block">
          ← Back to My Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-gray-900">Order Details</h1>
          <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
        <p className="text-gray-500 mt-2">Order ID: <span className="font-mono font-bold text-gray-700">{order.id}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Items and Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Tracker */}
          <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-8">Delivery Status</h2>
            <div className="relative flex justify-between">
              {/* Background Line */}
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />
              {/* Active Line */}
              <div 
                className="absolute top-5 left-0 h-1 bg-[#0b8241] transition-all duration-500 -z-0" 
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step, i) => (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-full border-4 flex items-center justify-center transition-colors ${
                    i <= currentStepIndex ? "bg-[#0b8241] border-[#e6f4ea] text-white" : "bg-white border-gray-100 text-gray-300"
                  }`}>
                    {i < currentStepIndex ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <p className={`mt-3 text-[10px] font-black uppercase tracking-wider ${i <= currentStepIndex ? "text-[#0b8241]" : "text-gray-400"}`}>
                    {getStatusLabel(step)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Items */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Items ({order.orderItems.length})</h2>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-400">Sold by</span>
                 <span className="text-sm font-bold text-[#0b8241]">{order.vendor.name}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {order.orderItems.map((item) => (
                <div key={item.id} className="p-8 flex gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                    <img src={(item.product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/products/${item.product.id}`} className="text-lg font-bold text-gray-800 hover:text-[#0b8241] transition">
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-400 mt-1">{item.product.category.name}</p>
                      </div>
                      <p className="text-lg font-black text-gray-900">₦{item.price.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                      <div className="text-sm"><span className="text-gray-400">Quantity:</span> <span className="font-bold text-gray-700">{item.quantity}</span></div>
                      <Link href={`/products/${item.product.id}`} className="text-xs font-bold text-[#0b8241] bg-[#e6f4ea] px-3 py-1.5 rounded-lg hover:bg-[#0b8241] hover:text-white transition">
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column: Summary and Info */}
        <div className="space-y-6">
          <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">₦{(order.total - (order.total >= 20000 ? 0 : 2000)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping Fee</span>
                <span className="font-bold text-[#0b8241]">{order.total >= 20000 ? "FREE" : "₦2,000"}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                <span className="text-gray-500 font-bold">Grand Total</span>
                <span className="text-2xl font-black text-gray-900 leading-none">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Shipping & Contact</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{order.shippingAddress || "No address provided"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Phone</p>
                <p className="text-sm text-gray-700 font-bold">{order.contactPhone || "N/A"}</p>
              </div>
            </div>
          </section>

          <section className="bg-[#0b8241] rounded-3xl p-8 text-white shadow-lg shadow-[#0b8241]/20">
            <h2 className="text-lg font-bold mb-4">Payment Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Method</p>
                <p className="text-sm font-bold">Paystack Online</p>
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Reference</p>
                <p className="text-xs font-mono break-all opacity-90">{order.paystackReference || "N/A"}</p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                 <span className="text-xs font-bold">Secure Transaction</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
