import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverview() {
  // Fetch stats
  const [userCount, vendorCount, productCount, orderCount, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, vendor: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: userCount, icon: "👤", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Vendors", value: vendorCount, icon: "🏪", color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Products", value: productCount, icon: "📦", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Orders", value: orderCount, icon: "🛒", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-slate-400 hover:text-slate-900">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-8 py-4 font-mono text-[11px] font-bold text-slate-900">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-8 py-4 text-sm text-slate-600 font-medium">{order.user.name}</td>
                    <td className="px-8 py-4 text-sm text-slate-400 font-medium">{order.vendor.name}</td>
                    <td className="px-8 py-4 text-sm text-slate-900 font-black text-right">₦{order.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Admin Quick Actions</h3>
          <div className="space-y-4">
            <Link href="/admin/vendors" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition group">
               <div className="flex items-center gap-3">
                 <span className="text-xl">🏪</span>
                 <span className="text-sm font-bold text-slate-700">Approve Vendors</span>
               </div>
               <span className="text-slate-300 group-hover:text-slate-900 transition">→</span>
            </Link>
            <Link href="/admin/products" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition group">
               <div className="flex items-center gap-3">
                 <span className="text-xl">📦</span>
                 <span className="text-sm font-bold text-slate-700">Flag Products</span>
               </div>
               <span className="text-slate-300 group-hover:text-slate-900 transition">→</span>
            </Link>
            <Link href="/admin/categories" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition group">
               <div className="flex items-center gap-3">
                 <span className="text-xl">📂</span>
                 <span className="text-sm font-bold text-slate-700">Manage Categories</span>
               </div>
               <span className="text-slate-300 group-hover:text-slate-900 transition">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
