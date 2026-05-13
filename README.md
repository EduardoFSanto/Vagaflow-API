# VagaFlow API

VagaFlow API is the backend that powers the VagaFlow job platform.

This project was built with a strong focus on architecture and data modeling. The domain is split into clear entities for authentication, candidates, companies, jobs, applications, screening questions, and answers. The goal was to keep the model normalized, role-aware, and easy to extend as the product grows.

## What this API handles

- Authentication with JWT
- Role-based access for candidates and companies
- Profile management for both user types
- Job creation, listing, updating, and deletion
- Job application flow
- Company application review
- Job screening questions and application answers

## Architecture

The API follows a simple and explicit structure:

- `src/routes` defines the HTTP layer
- `src/controllers` contains request handlers
- `src/schemas` validates input with Zod
- `src/middlewares` handles authentication and role checks
- `src/lib/prisma.ts` centralizes database access

The code is organized by domain instead of by technical layer alone, which makes the product logic easier to understand and maintain.

## Data model

The data model was one of the main parts of the project.

The core idea is a single `User` table for authentication, with one-to-one profile tables for each role:

- `User` stores login data and role information
- `Candidate` stores candidate profile data
- `Company` stores company profile data

From there, the hiring flow is modeled through:

- `Job` for published vacancies
- `Application` for candidate submissions
- `JobQuestion` for screening questions attached to a job
- `ApplicationAnswer` for answers submitted with an application

This structure keeps authentication separated from profile data and lets the platform grow without turning the schema into a single oversized table.

## Tech stack

- Fastify
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Zod
- bcryptjs

## Main endpoints

Auth:

- `POST /auth/register`
- `POST /auth/login`

Candidate profile:

- `GET /candidate/profile`
- `PATCH /candidate/profile`
- `DELETE /candidate/profile`

Company profile:

- `GET /company/profile`
- `PATCH /company/profile`
- `DELETE /company/profile`

Jobs:

- `GET /jobs`
- `GET /jobs/:id`
- `POST /jobs`
- `PATCH /jobs/:id`
- `DELETE /jobs/:id`

Applications:

- `POST /applications/:jobId`
- `GET /applications`
- `GET /applications/company`
- `PATCH /applications/:id`

## Authentication and authorization

The API uses JWT for authentication and checks access by role.

- Candidates can access candidate-specific routes and apply to jobs
- Companies can manage jobs and review applications

## Environment variables

Create a `.env` file based on the example below:

```bash
POSTGRES_DB=vagaflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_PORT=5432

DATABASE_URL="postgresql://postgres:your_password@localhost:5432/vagaflow?schema=public"
JWT_SECRET=your_secret_here
ALLOWED_ORIGINS=http://localhost:3000
PORT=3333
NODE_ENV=development
```

## Local setup

Start PostgreSQL:

```bash
docker compose up -d
```

Install dependencies:

```bash
npm install
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the API:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Project notes

This backend was designed to support a real hiring workflow rather than a demo-only flow. The main work here was not just exposing endpoints, but modeling the relationships correctly and keeping the responsibilities separated across auth, profiles, jobs, and applications.
