import { SignUp } from "@clerk/nextjs";
import { Plane, ShieldCheck } from "lucide-react";
import { authAppearance } from "@/lib/clerk-appearance";
import Link from "next/link";

export default function StaffSignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-zinc-950">
      {/* Auth Column */}
      <div className="relative flex flex-col justify-center items-center bg-zinc-950 order-1">

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          <div className="mb-8 text-center flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Staff Portal Registration</h2>
            <p className="text-zinc-400 text-sm mt-2">Use your authorized employee email address</p>
          </div>

          {/* We must inject a dark version for Clerk if available, but AuthAppearance supports System themes. Let's rely on standard Clerk dark mode or rely on the custom AuthAppearance variables assuming the app is dark by default here, or we force variables. */}
          <div className="dark">
            <SignUp
              appearance={{
                ...authAppearance,
                elements: {
                  ...authAppearance.elements,
                  card: "bg-zinc-900 shadow-none border border-zinc-800 rounded-3xl",
                  headerTitle: "text-2xl font-bold tracking-tight text-white",
                  headerSubtitle: "text-sm text-zinc-400 mt-1",
                  formFieldLabel: "text-xs font-semibold text-zinc-300 tracking-tight",
                  formFieldInput: "flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-2 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                  socialButtonsBlockButton: "h-11 rounded-xl border border-zinc-800 bg-transparent text-white hover:bg-zinc-800 transition-colors font-medium shadow-sm",
                  dividerLine: "bg-zinc-800",
                  footerActionLink: "text-sm text-primary hover:text-primary/90 font-semibold transition-colors",
                  footerActionText: "text-sm text-zinc-400",
                  identityPreviewText: "text-white font-medium",
                }
              }}
              path="/employee-sign-up"
              routing="path"
              signInUrl="/sign-in"
              unsafeMetadata={{ role: "staff" }}
            />
          </div>
        </div>
      </div>

      {/* Visual / Marketing Column */}
      <div className="hidden md:flex flex-col bg-zinc-900 text-white p-10 relative overflow-hidden order-2">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className="flex justify-between">
          <Link href="/sign-up" className="z-20 text-sm font-medium cursor-pointer text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
            ←  Back to Passenger Sign Up
          </Link>
          <div className="relative z-10 flex items-center justify-end gap-2 text-right">
            <span className="font-semibold tracking-wide uppercase text-sm">Helwan Airways</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Plane className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto text-right flex flex-col items-end mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-lg">
            Experience the world in premium comfort.
          </h1>
          <p className="text-zinc-300 max-w-sm text-sm lg:text-base">
            Create an account to book your next adventure, unlock faster check-ins, and manage itineraries instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
