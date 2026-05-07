import { prisma } from "@/lib/prisma";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, reviews: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50">
        <h3 className="text-lg font-bold text-slate-800">Manage Users</h3>
        <p className="text-xs text-slate-400 mt-1">View and monitor registered customers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Orders</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reviews</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                      {user.image ? <img src={user.image} className="w-full h-full rounded-full object-cover" /> : user.name?.[0] ?? "?"}
                    </div>
                    <span className="font-bold text-slate-900">{user.name ?? "Anonymous"}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-slate-500 font-medium">{user.email}</td>
                <td className="px-8 py-5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                    user.role === 'ADMIN' ? "bg-slate-900 text-white border-slate-900" :
                    user.role === 'VENDOR' ? "bg-green-50 text-green-700 border-green-100" :
                    "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5 text-center font-bold text-slate-700">{user._count.orders}</td>
                <td className="px-8 py-5 text-center font-bold text-slate-700">{user._count.reviews}</td>
                <td className="px-8 py-5 text-slate-400 text-[11px]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <DeleteUserButton userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
