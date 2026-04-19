import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return new Response("No email provided", { status: 400 });
    }

    const client = await clerkClient();

    // 1. Check if user belongs to Staff
    const staff = await prisma.staff.findUnique({
      where: { email },
    });

    if (staff) {
      await prisma.staff.update({
        where: { email },
        data: { clerkUserId: id },
      });

      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: "staff",
        },
      });

      return NextResponse.json({ success: true, role: "staff" });
    }

    // 2. Otherwise, check Passenger
    const passenger = await prisma.passenger.findUnique({
      where: { email },
    });

    if (passenger) {
      await prisma.passenger.update({
        where: { email },
        data: { clerkUserId: id },
      });
      
      await client.users.updateUserMetadata(id, {
        publicMetadata: { role: "passenger" },
      });

      return NextResponse.json({ success: true, role: "passenger" });
    }

    // Default to the explicitly requested role in unsafeMetadata
    const requestedRole = evt.data.unsafe_metadata?.role as string;
    let finalRole = "passenger";

    if (requestedRole === "staff") {
       await prisma.staff.create({
         data: {
           clerkUserId: id,
           email,
           firstName: first_name ?? "",
           lastName: last_name ?? "",
           role: "AGENT",
         }
       });
       finalRole = "staff";
    } else {
       await prisma.passenger.create({
         data: {
           clerkUserId: id,
           email,
           firstName: first_name ?? "",
           lastName: last_name ?? "",
         },
       });
       finalRole = "passenger";
    }

    await client.users.updateUserMetadata(id, {
      publicMetadata: { role: finalRole },
    });

    return NextResponse.json({ success: true, role: finalRole });
  }

  return NextResponse.json({ success: true });
}
