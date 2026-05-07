import { prisma } from "@/lib/prisma";
import VendorStatusToggle from "./VendorStatusToggle";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { products: true, orders: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50">
        <h3 className="text-lg font-bold text-slate-800">Manage Vendors</h3>
        <p className="text-xs text-slate-400 mt-1">Suspend or activate vendor accounts</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Products</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Orders</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-400">
                      {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : vendor.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{vendor.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">ID: {vendor.id.slice(-6)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-slate-600 font-medium">{vendor.user.email}</p>
                  <p className="text-[11px] text-slate-400">{vendor.phone || "No phone"}</p>
                </td>
                <td className="px-8 py-5 text-center font-bold text-slate-700">{vendor._count.products}</td>
                <td className="px-8 py-5 text-center font-bold text-slate-700">{vendor._count.orders}</td>
                <td className="px-8 py-5">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    vendor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {vendor.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <VendorStatusToggle id={vendor.id} isActive={vendor.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
