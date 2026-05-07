import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { isActive } = await req.json();

  try {
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(updatedVendor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}
