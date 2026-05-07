"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: { name: string };
  images: any; // Can be array or Json string
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/vendor/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/vendor/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="aspect-[4/5] bg-white rounded-[2rem] border border-gray-100"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage your inventory</p>
        </div>
        
        <div className="flex flex-1 max-w-md mx-0 md:mx-8">
           <div className="relative w-full">
             <input 
               type="text" 
               placeholder="Search products..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-white border border-gray-100 rounded-2xl px-12 py-4 text-sm font-medium outline-none focus:border-[#0b8241] transition-all shadow-sm"
             />
             <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
        </div>

        <Link 
          href="/vendor/products/new" 
          className="bg-[#0b8241] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#096b35] transition-all shadow-lg shadow-[#0b8241]/20 active:scale-95 text-center"
        >
          Add New Product
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <p className="text-lg font-black text-gray-900">{search ? "No products match your search" : "No products found"}</p>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">{search ? "Try a different keyword" : "Start by adding your first item"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {product.images?.[0] ? (
                  <img src={Array.isArray(product.images) ? product.images[0] : JSON.parse(product.images as string)[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black text-xs tracking-widest">No Image</div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                   <p className="text-xs font-black text-gray-900">₦{product.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-black text-[#0b8241] uppercase tracking-widest">{product.category?.name || "Uncategorized"}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? "text-blue-500" : "text-red-500"}`}>
                    {product.stock} left
                  </p>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-6 truncate">{product.name}</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/vendor/products/${product.id}/edit`} 
                    className="bg-gray-50 text-gray-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-100 transition-colors"
                  >
                    Edit Item
                  </Link>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-50 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
