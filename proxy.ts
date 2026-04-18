import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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

    const role = (sessionClaims?.metadata as { role?: string })?.role;
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
