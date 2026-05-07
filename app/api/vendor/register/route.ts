import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      name,
      slug,
      email,
      phone,
      description,
      logo,
      banner,
    } = body;

    if (!name || !slug || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the slug is already taken
    const existingVendor = await prisma.vendor.findUnique({
      where: { slug },
    });

    if (existingVendor && existingVendor.userId !== userId) {
      return NextResponse.json({ error: "Store slug is already taken" }, { status: 400 });
    }

    // Upsert vendor profile
    const vendor = await prisma.vendor.upsert({
      where: { userId },
      update: {
        name,
        slug,
        email,
        phone,
        description,
        logo,
        banner,
      },
      create: {
        userId,
        name,
        slug,
        email,
        phone,
        description,
        logo,
        banner,
      },
    });

    // Update user role to VENDOR if they are CUSTOMER
    if (session.user.role === "CUSTOMER") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "VENDOR" },
      });
    }

    return NextResponse.json({ success: true, vendor }, { status: 200 });
  } catch (error: any) {
    console.error("Vendor registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
