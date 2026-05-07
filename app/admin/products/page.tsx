import { prisma } from "@/lib/prisma";
import ProductDeleteButton from "./ProductDeleteButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      vendor: { select: { name: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Manage Products</h3>
          <p className="text-xs text-slate-400 mt-1">Review and delete marketplace items</p>
        </div>
        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          {products.length} Items Total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                       <img src={product.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {product.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                    {product.category.name}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-slate-600 font-bold">{product.vendor.name}</p>
                </td>
                <td className="px-8 py-5 font-black text-slate-900">
                  ₦{product.price.toLocaleString()}
                </td>
                <td className="px-8 py-5">
                   <span className={`font-bold ${product.stock < 5 ? "text-red-500" : "text-slate-500"}`}>
                     {product.stock}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <ProductDeleteButton id={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
