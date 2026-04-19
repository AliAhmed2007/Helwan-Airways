import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isStaffRoute = createRouteMatcher(["/staff(.*)"]);
const isCustomerProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/booking(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Staff routes: must be authenticated + have role === 'staff'
  if (isStaffRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Try to get from session claims first (requires Clerk Dashboard JWT template setup)
    let role = (sessionClaims?.metadata as { role?: string })?.role;
    
    // If not in session claims, fall back to fetching directly from Clerk
    if (!role) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = user.publicMetadata?.role as string | undefined;
    }

    if (role !== "staff") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Customer protected routes: must be authenticated
  if (isCustomerProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
