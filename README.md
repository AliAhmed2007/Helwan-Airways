✈️ AeroBook: Modern Airline Flight & Reservation System

A production-grade, full-stack Next.js application for airline flight management and passenger ticketing. Built with a focus on clean architecture and a premium, minimalist (Apple-inspired) user experience.

This system provides a comprehensive three-sided portal serving Customers, Operations Staff, and System Administrators, handling everything from multi-passenger bookings to real-time flight dispatching.
✨ Core Features
🛂 Customer Portal (/customer)

    Dynamic Flight Search: Query flights by departure/arrival hubs and dates.

    Complex Booking Flow: Multi-step wizard supporting simultaneous multi-passenger ticketing.

    Interactive Seat Selection: Visual aircraft mapping to select available seats.

    Passenger Dashboard: Manage upcoming trips and access digital boarding passes.

🏢 Operations Dashboard (/staff)

    Real-Time Analytics: Visualize daily revenue, occupancy rates, and operational bottlenecks.

    Flight Dispatch & Status: Update flight statuses (Scheduled, Boarding, Delayed, Departed) seamlessly.

    Passenger Manifests: Manage gate check-ins, verify documentation, and process baggage weights.

🛠️ Tech Stack & Architecture

This project leverages the modern React ecosystem with strict end-to-end type safety:

    Framework: Next.js 14+ (App Router, Server Actions, Server Components)

    Language: TypeScript

    Database: MySQL (Relational architecture for robust data integrity)

    Authentication: Clerk (Role-Based Access Control for Customers vs. Staff)

    Styling: Tailwind CSS + Shadcn UI (Monochromatic, high-contrast, ample whitespace)

    State & Validation: React Hook Form heavily integrated with Zod schemas

    Data Visualization: Recharts

    Animations: Framer Motion (Smooth, native-feeling micro-interactions)

🚀 Getting Started
Prerequisites

    Node.js 18+

    A running MySQL instance

    A  account for authentication

Installation

    Clone the repository

    Install dependencies

    Environment Setup
    Create a .env.local file in the root directory and add your keys:

    Initialize the Database
    Run the provided SQL seed scripts located in the /prisma or /db folder to populate the independent infrastructure (Airports, Aircrafts).

    Start the Development Server

    Navigate to http://localhost:3000 to view the application.

📐 Design Philosophy

The UI is strictly engineered to feel native and premium. We prioritize stark contrast, soft border radii, and generous whitespace over heavy drop shadows and borders. All data mutations provide immediate feedback via toast notifications and optimistic UI updates.
