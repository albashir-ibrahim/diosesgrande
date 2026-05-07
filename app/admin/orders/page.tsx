import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      vendor: { select: { name: true } },
      _count: { select: { orderItems: true } }
    },
    orderBy: { createdAt: "desc" }
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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50">
        <h3 className="text-lg font-bold text-slate-800">Platform Orders</h3>
        <p className="text-xs text-slate-400 mt-1">Global view of all transactions across all vendors</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-5">
                  <p className="font-mono text-[11px] font-bold text-slate-900">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="font-bold text-slate-700">{order.user.name}</p>
                  <p className="text-[11px] text-slate-400">{order.user.email}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-slate-500 font-bold">{order.vendor.name}</span>
                </td>
                <td className="px-8 py-5 text-center font-bold text-slate-700">
                  {order._count.orderItems}
                </td>
                <td className="px-8 py-5 text-right font-black text-slate-900">
                  ₦{order.total.toLocaleString()}
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
