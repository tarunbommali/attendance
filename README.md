# Attendance Management System

## Overview
This project is an Attendance Management System designed for educational institutions. It allows faculty to track student attendance across various courses and classes, generate reports, and analyze attendance statistics. The system has different user roles (student, faculty, admin) with role-based permissions.

## System Architecture
The application follows a modern full-stack architecture with a separated client and server:

1.  **Frontend (Client)**: React-based single-page application built with Vite. Styled with TailwindCSS and shadcn/ui components.
2.  **Backend (Server)**: Express.js API server providing RESTful endpoints.
3.  **Database**: PostgreSQL, accessed via Drizzle ORM on the server-side.
4.  **Authentication**: Session-based authentication handled by the server using Passport.js.

TypeScript is used across both client and server for type safety.

## Key Components

### Frontend (Client - located in the `client` directory)
-   **React**: Main UI library.
-   **Vite**: Build tool and development server for the client.
-   **TailwindCSS**: Utility-first CSS framework for styling.
-   **shadcn/ui**: Component library built on Radix UI primitives.
-   **React Query**: Data fetching and state management.
-   **Recharts**: Charting library for attendance visualizations.
-   **React Hook Form**: Form handling with Zod schema validation.
-   **Wouter**: Client-side routing.

### Backend (Server - located in the `server` directory)
-   **Express.js**: Web server framework.
-   **Passport.js**: Authentication middleware.
-   **Drizzle ORM**: Database query builder and migration tool for PostgreSQL.
-   **Zod**: Schema validation for request/response payloads.
-   **tsx**: For running TypeScript directly in development.
-   **esbuild**: For building the server for production.

### Database Schema (Managed by the Server)
The database schema includes the following main tables:
-   `users`: Stores information about students, faculty, and administrators.
-   `courses`: Contains course information (name, code, description).
-   `classes`: Scheduled classes for courses.
-   `enrollments`: Records which students are enrolled in which courses.
-   `attendance`: Records attendance status for students in specific classes.

(Schema definitions are typically located within the `server` directory, e.g., `server/src/db/schema.ts`)

## Data Flow

1.  **Authentication Flow**:
    -   User logs in via the client with username/password.
    -   Client sends credentials to the server's API (`/api/auth/login`).
    -   Server validates credentials with Passport.js.
    -   A session is established, and a session cookie is set for the client.
    -   Protected API routes on the server check session validity.

2.  **Attendance Marking Flow**:
    -   Faculty selects course and class date on the client.
    -   Client requests enrolled students from the server's API.
    -   Faculty marks attendance (present, absent, late) on the client.
    -   Client sends attendance data to the server's API.
    -   Server saves data to the PostgreSQL database via Drizzle ORM.
    -   Reports are available for analysis by requesting data from the server.

3.  **Reporting Flow**:
    -   Users interact with filters on the client (date range, course, student).
    -   Client requests filtered attendance data from the server's API.
    -   Server queries the database and returns data.
    -   Client generates reports and visualizations (e.g., using Recharts).
    -   Data can be exported if the functionality is implemented.

## External Dependencies (Key Examples)

### Frontend Dependencies
-   React and React DOM
-   Vite
-   TailwindCSS
-   Radix UI component primitives (via shadcn/ui)
-   React Query
-   React Hook Form
-   Recharts
-   Lucide React (icons)
-   Wouter

### Backend Dependencies
-   Express
-   Passport.js
-   Drizzle ORM
-   @neondatabase/serverless (or `pg` for standard PostgreSQL)
-   Zod
-   Express Session & Connect PG Simple (for session storage)
-   tsx, esbuild

7.  **Install Client Dependencies:**
    ```bash
    cd client
    npm install
    ```

8.  **Run the Frontend Client:**
    -   From the `client` directory:
        ```bash
        npm run dev
        ```
 
