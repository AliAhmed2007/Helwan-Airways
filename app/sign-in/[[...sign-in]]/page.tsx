import { SignIn } from "@clerk/nextjs";
import { Plane } from "lucide-react";
import { authAppearance } from "@/lib/clerk-appearance";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Visual / Marketing Column */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-900 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')" }} />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Plane className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-wide uppercase text-sm">Helwan Airways</span>
        </div>

        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Welcome back aboard.
          </h1>
          <p className="text-zinc-300 max-w-sm text-sm lg:text-base mb-6">
            Log in to manage your reservations, track flights, and access your premium benefits.
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-900" />
              <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-zinc-900" />
              <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-zinc-900" />
            </div>
            <p className="text-xs text-zinc-400">Join over 1M+ passengers</p>
          </div>
        </div>
      </div>

      {/* Auth Column */}
      <div className="relative flex flex-col justify-center items-center p-8 bg-background">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="w-full max-w-ma relative z-10 flex justify-center">
          <SignIn 
            appearance={authAppearance}
            path="/sign-in" 
            routing="path" 
            signUpUrl="/sign-up" 
            fallbackRedirectUrl="/api/auth/sync"
            forceRedirectUrl="/api/auth/sync"
          />
        </div>

        {/* Staff Sign Up Link Hint */}
        <p className="mt-8 text-xs text-muted-foreground z-10">
          Staff member? <Link href="staff-sign-in" className="font-medium underline underline-offset-4 hover:text-foreground">Access staff portal</Link>
        </p>
      </div>
    </div>
  );
}
