import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  // Fetch stats
  const [totalSales, activeProducts, pendingOrders, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { vendorId: vendor.id, status: "PAID" },
      _sum: { total: true },
    }),
    prisma.product.count({
      where: { vendorId: vendor.id },
    }),
    prisma.order.count({
      where: { vendorId: vendor.id, status: "PENDING" },
    }),
    prisma.order.findMany({
      where: { vendorId: vendor.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    }),
  ]);

  // Mock sales data for the chart (last 7 days)
  const salesData = [
    { day: "Mon", sales: 4000 },
    { day: "Tue", sales: 3000 },
    { day: "Wed", sales: 5000 },
    { day: "Thu", sales: 2780 },
    { day: "Fri", sales: 1890 },
    { day: "Sat", sales: 2390 },
    { day: "Sun", sales: 3490 },
  ];

  return NextResponse.json({
    stats: {
      totalSales: totalSales._sum.total || 0,
      activeProducts,
      pendingOrders,
    },
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      customer: o.user.name,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    })),
    salesData,
  });
}
