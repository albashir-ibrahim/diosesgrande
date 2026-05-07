import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      vendor: { select: { name: true } },
      orderItems: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-gray-500">Track and manage your marketplace purchases</p>
        </div>
        <Link href="/products" className="bg-[#0b8241] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#096b35] transition shadow-sm">
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-20 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8">When you buy items, they will appear here.</p>
          <Link href="/products" className="text-[#0b8241] font-bold hover:underline">
            Browse our products →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-[#0b8241]/30 transition-all duration-200">
              <div className="px-6 py-4 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Order Placed</p>
                    <p className="font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total</p>
                    <p className="font-bold text-gray-900">₦{order.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Vendor</p>
                    <p className="font-bold text-[#0b8241]">{order.vendor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <Link href={`/dashboard/orders/${order.id}`} className="text-xs font-bold text-[#0b8241] hover:underline">
                    View Details
                  </Link>
                </div>
              </div>

              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex -space-x-4 overflow-hidden shrink-0">
                  {order.orderItems.slice(0, 3).map((item, i) => (
                    <div key={item.id} className="w-16 h-16 rounded-xl border-2 border-white bg-gray-50 overflow-hidden shadow-sm">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-16 h-16 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {order.orderItems.map(i => i.product.name).join(", ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Order ID: {order.id}</p>
                </div>

                <div className="shrink-0 flex gap-2">
                   {order.status === "DELIVERED" && (
                     <button className="bg-[#0b8241] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#096b35] transition">
                       Buy Again
                     </button>
                   )}
                   <Link href={`/dashboard/orders/${order.id}`} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition">
                      Manage Order
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
