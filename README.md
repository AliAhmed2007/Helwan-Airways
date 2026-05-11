<div align="center">
  <h1>✈️ Helwan Airways</h1>
  <p><strong>A modern, premium airline reservation and management system built with Next.js</strong></p>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/React_Hook_Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white" alt="React Hook Form" />
</div>

<br />

## ✨ Features

- **Passenger Portal**:
  - **Flight Search**: Dynamic search with origin, destination, dates, and flexible filtering.
  - **Seat Selection**: Visual, interactive seat mapping to choose the perfect spot.
  - **Reservations**: Streamlined, secure booking flow with passenger data validation.
  - **User Dashboard**: Track upcoming trips and view flight history in a personal dashboard.

- **Staff Administration Dashboard**:
  - **KPIs & Analytics**: High-level visibility into system performance with analytics cards.
  - **Flights Management**: CRUD operations for flights, schedules, and statuses.
  - **Passenger & Reservation Management**: Comprehensive directory for managing users and bookings.
  - **Fleet & Infrastructure**: Manage aircraft, seating capacities, airports, and baggage.

- **Authentication & Security**:
  - Secure authentication flow powered by **Clerk**.
  - Robust **Role-Based Access Control (RBAC)** separating "Passenger" and "Staff" privileges.

- **Premium UI/UX**:
  - Clean, minimal, Apple-inspired design aesthetic using **Shadcn UI**.
  - Buttery smooth micro-animations powered by **Framer Motion**.
  - Strict type safety and client-side form validation via **Zod**.

---

## 🗺️ Pages & Navigation

### 👤 Passenger Portal
| Page | Description |
| :--- | :--- |
| **Home** | Global flight search widget and dynamically featured destinations. |
| **Search Results** | Browse available flights with advanced filtering (price, time, stops). |
| **Booking Flow** | Step-by-step wizard for passenger details, seat selection, and checkout. |
| **My Trips** | Passenger dashboard showing past journeys and upcoming reservations. |

### 👨‍💼 Staff Administration
| Page | Description |
| :--- | :--- |
| **Overview Dashboard** | Central hub displaying critical daily metrics and analytics. |
| **Manage Flights** | Data tables to view, add, edit, or cancel flight schedules. |
| **Manage Passengers** | Directory of registered users and their details. |
| **Manage Reservations** | Oversight of all system bookings and payment statuses. |
| **Manage Fleet/Airports**| Configuration of aircraft types, capacities, and airport locations. |

---

## 📸 Screenshots

### Passenger Experience

<div align="center">
  <img src="docs/screenshots/home-page-placeholder.png" alt="Home Page Placeholder" width="800" style="border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;" />
  <p><em>Home Page with Flight Search Widget</em></p>
</div>

<div align="center">
  <img src="docs/screenshots/flight-search-placeholder.png" alt="Flight Search Placeholder" width="800" style="border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;" />
  <p><em>Flight Search Results and Filtering</em></p>
</div>

<div align="center">
  <img src="docs/screenshots/booking-flow-placeholder.png" alt="Booking Flow Placeholder" width="800" style="border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;" />
  <p><em>Interactive Seat Selection & Booking</em></p>
</div>

### Staff Administration

<div align="center">
  <img src="docs/screenshots/admin-dashboard-placeholder.png" alt="Admin Dashboard Placeholder" width="800" style="border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;" />
  <p><em>Staff Analytics and KPI Dashboard</em></p>
</div>

<div align="center">
  <img src="docs/screenshots/manage-flights-placeholder.png" alt="Manage Flights Placeholder" width="800" style="border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;" />
  <p><em>Flight Management Data Table</em></p>
</div>

---

## 🛠️ Architecture & Services

- **Frontend**: Next.js (App Router), React, Server Components
- **Backend**: Next.js Server Actions (No traditional API routes, maximizing performance)
- **Database**: Prisma ORM mapping to relational database
- **Authentication**: Clerk (with RBAC metadata)
- **Form Validation**: React Hook Form seamlessly integrated with Zod
- **UI Components**: Radix UI primitives styled with Tailwind CSS (Shadcn UI approach)
- **Animations**: Framer Motion

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure environment variables**: Set up your `.env.local` with Clerk keys, Database URLs, etc.
4. **Run database migrations**: `npx prisma db push` (and run the seeder if available)
5. **Start development server**: `npm run dev`
