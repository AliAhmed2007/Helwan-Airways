import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  const url = new URL(req.url);
  const roleIntent = url.searchParams.get("role");

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // If already processed
  if (user.publicMetadata?.role) {
     return NextResponse.redirect(new URL(user.publicMetadata.role === "staff" ? "/staff" : "/", req.url));
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
     return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Check if they exist in Staff DB
  const staff = await prisma.staff.findUnique({
    where: { email },
  });

  if (staff) {
    await prisma.staff.update({
      where: { email },
      data: { clerkUserId: userId },
    });
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "staff" },
    });
    return NextResponse.redirect(new URL("/staff", req.url));
  }

  // 2. Check if they exist in Passenger DB
  const passenger = await prisma.passenger.findUnique({
    where: { email },
  });

  if (passenger) {
    await prisma.passenger.update({
      where: { email },
      data: { clerkUserId: userId },
    });
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "passenger" },
    });
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. User is totally new. Create them based on intent!
  if (roleIntent === "staff") {
    await prisma.staff.create({
      data: {
        clerkUserId: userId,
        email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        role: "AGENT",
      },
    });
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "staff" },
    });
    return NextResponse.redirect(new URL("/staff", req.url));
  } else {
    // Default passenger
    await prisma.passenger.create({
      data: {
        clerkUserId: userId,
        email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      },
    });
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "passenger" },
    });
    return NextResponse.redirect(new URL("/", req.url));
  }
}
