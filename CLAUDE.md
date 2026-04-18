# Project: Airline Flight & Reservation System

## System Overview
A Next.js fullstack web application serving two distinct user bases:
1.  **Customers (`/app/(customer)`):** Public portal for searching flights, booking multi-passenger reservations, and viewing digital boarding passes.
2.  **Staff (`/app/(staff)`):** Operational dashboard for managing flight statuses, passenger check-ins, and analytics.

## Tech Stack
* Next.js App Router (React 18+)
* TypeScript
* Tailwind CSS + Shadcn UI
* React Hook Form + Zod
* Clerk (Authentication & RBAC)
* Recharts (Staff Analytics)
* Framer Motion (UI Animations)

## Core Coding Rules
* **Server First:** Default to React Server Components (RSC). Only add `"use client"` at the lowest possible level in the component tree.
* **Data Fetching:** Use Server Components for reading data. Use Next.js Server Actions for mutations (Create, Update, Delete).
* **Forms:** All forms must have a corresponding Zod schema. Validation must happen on the client (via RHF resolver) AND on the server (inside the Server Action) using the exact same schema.
* **Styling:** Adhere to a minimalist, high-end Apple-style aesthetic. Use Tailwind utility classes. Use `cn()` utility for conditional class merging. Do not write custom CSS unless absolutely unavoidable.
* **Database:** Assume a MySQL relational database structure. 

## UI/UX Rules
* **Whitespace is key:** Use generous padding (`p-6`, `p-8`).
* **Minimalist components:** No heavy shadows. Use soft radiuses (`rounded-xl`).
* **Feedback:** Always provide loading states (skeletons) and mutation feedback (toast notifications using Shadcn Sonner).