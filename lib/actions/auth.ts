'use server';

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function register(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const role = formData.get("role") as string || "CUSTOMER";

  if (!email || !password || !name) {
    return { error: "Missing required fields" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as any,
    },
  });

  // If registering as a vendor, ensure they have a minimal profile if needed
  // or redirect them to the vendor setup page.
  const defaultRedirect = role === "VENDOR" ? "/vendor/register" : "/dashboard/orders";
  const callbackUrl = formData.get("callbackUrl") as string || defaultRedirect;
  formData.set("redirectTo", callbackUrl);

  return await login(prevState, formData);
}

import { revalidatePath } from "next/cache";

export async function login(prevState: any, formData: FormData) {
  try {
    revalidatePath("/", "layout");
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "An error occurred during sign in." };
      }
    }
    throw error;
  }
}
