import { SignUp } from "@clerk/nextjs";
import { Plane } from "lucide-react";
import { authAppearance } from "@/lib/clerk-appearance";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Visual / Marketing Column */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-900 text-white p-10 relative overflow-hidden order-2">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop')" }} />
        
        <div className="relative z-10 flex items-center justify-end gap-2 text-right">
          <span className="font-semibold tracking-wide uppercase text-sm">Helwan Airways</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Plane className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="relative z-10 mt-auto text-right flex flex-col items-end">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-lg">
            Experience the world in premium comfort.
          </h1>
          <p className="text-zinc-300 max-w-sm text-sm lg:text-base">
            Create an account to book your next adventure, unlock faster check-ins, and manage itineraries instantly.
          </p>
        </div>
      </div>

      {/* Auth Column */}
      <div className="relative flex flex-col justify-center items-center bg-background order-1">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          <SignUp 
            appearance={authAppearance}
            path="/sign-up" 
            routing="path" 
            signInUrl="/sign-in" 
            unsafeMetadata={{ role: "passenger" }}
          />
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50 backdrop-blur-sm shadow-sm inline-flex items-center gap-2">
              Are you an employee? 
              <Link href="/employee-sign-up" className="font-semibold text-foreground hover:text-primary transition-colors">
                Sign up as Staff →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
