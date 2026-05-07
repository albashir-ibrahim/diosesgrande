import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id }
  });

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl font-black mb-4">Vendor Access Required</h1>
        <p className="text-gray-500 mb-8 font-bold uppercase tracking-widest text-xs">You need a vendor account to view this page.</p>
        <Link href="/vendor/register" className="bg-[#0b8241] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#0b8241]/20">
          Register as Vendor
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "PAID": return "bg-blue-50 text-blue-600 border-blue-100";
      case "PROCESSING": return "bg-purple-50 text-purple-600 border-purple-100";
      case "SHIPPED": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "DELIVERED": return "bg-green-50 text-green-600 border-green-100";
      case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Track and process your sales</p>
        </div>
        <div className="flex gap-4">
          <QuickStat label="Pending" value={orders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length} color="orange" />
          <QuickStat label="Completed" value={orders.filter(o => o.status === 'DELIVERED').length} color="green" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reference</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Revenue</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <p className="text-lg font-black text-gray-900">No orders yet</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">When customers buy your products, they'll appear here</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900 font-mono tracking-tighter">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900">{order.user.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{order.user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex -space-x-3">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-gray-50 overflow-hidden shadow-sm" title={item.product.name}>
                            <img src={Array.isArray(item.product.images) ? item.product.images[0] : JSON.parse(item.product.images as string)[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div className="w-10 h-10 rounded-2xl border-4 border-white bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                            +{order.orderItems.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900">₦{order.total.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link href={`/vendor/orders/${order.id}`} className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0b8241] transition-all active:scale-95">
                        Manage
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: number; color: 'orange' | 'green' }) {
  const colors = {
    orange: "text-orange-600 bg-orange-50",
    green: "text-green-600 bg-green-50",
  };
  return (
    <div className={`px-6 py-4 rounded-[1.5rem] border border-gray-100 flex items-center gap-4 bg-white shadow-sm`}>
       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${colors[color]}`}>
         {value}
       </div>
       <div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
       </div>
    </div>
  );
}
}
