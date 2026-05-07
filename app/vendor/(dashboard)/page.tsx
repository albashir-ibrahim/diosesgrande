"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalSales: number;
  activeProducts: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/vendor/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setSalesData(data.salesData);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100"></div>
          ))}
        </div>
        <div className="h-96 bg-white rounded-3xl border border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Overview</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Performance & Activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Total Revenue" 
          value={`₦${(stats?.totalSales || 0).toLocaleString()}`} 
          trend="+12.5%" 
          color="green"
        />
        <StatCard 
          label="Active Products" 
          value={stats?.activeProducts.toString() || "0"} 
          trend="In Stock" 
          color="blue"
        />
        <StatCard 
          label="Pending Orders" 
          value={stats?.pendingOrders.toString() || "0"} 
          trend="Action Needed" 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900">Sales Performance</h3>
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-500 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {salesData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className="w-full bg-[#e6f4ea] rounded-t-xl transition-all duration-500 group-hover:bg-[#0b8241] cursor-pointer relative"
                  style={{ height: `${(data.sales / 5000) * 100}%` }}
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     ₦{data.sales}
                   </div>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900">Recent Sales</h3>
            <a href="/vendor/orders" className="text-[#0b8241] text-[10px] font-black uppercase tracking-widest hover:underline">View All</a>
          </div>
          
          <div className="space-y-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm font-medium py-10 text-center">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-[#e6f4ea] group-hover:text-[#0b8241] transition-all">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{order.customer}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₦{order.total.toLocaleString()}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, color }: { label: string; value: string; trend: string; color: 'green' | 'blue' | 'orange' }) {
  const colors = {
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${colors[color]}`}>
          {trend}
        </span>
      </div>
      <p className="text-4xl font-black text-gray-900 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{value}</p>
    </div>
  );
}
