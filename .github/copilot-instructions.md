# Copilot Instructions - Municipal Waste Management System

## Architecture Overview

This is a **Next.js 16 App Router** backend project for municipal waste management. Key architectural decisions:

- **No `src/` folder** - All application code lives directly in `app/`
- **API routes** use Next.js Route Handlers at `app/api/<resource>/route.ts`
- **In-memory storage** via singleton pattern in [lib/userStore.ts](../lib/userStore.ts) - no database yet
- **JWT-based auth** with bcryptjs for password hashing

## Project Structure

```
app/api/           → Backend API routes (Route Handlers)
lib/               → Shared utilities and stores (singleton patterns)
types/             → TypeScript interfaces and types
```

## Code Patterns

### API Route Pattern
Export HTTP method functions directly from `route.ts`:
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ... validation and logic
  return NextResponse.json({ ... }, { status: 200 });
}
```

### Type Definitions
Define request/response types in `types/` - see [types/user.ts](../types/user.ts):
- `User` - full entity with password
- `SignupRequest` / `SignupResponse` - API contract types (response excludes password)

### Error Response Format
All API errors follow this structure:
```typescript
{ error: "Error type", message: "Human readable description" }
```
Status codes: `400` (validation), `401` (auth), `409` (conflict), `500` (server error)

### Path Aliases
Use `@/` alias for imports: `import { userStore } from "@/lib/userStore"`

## Validation Rules (Domain-Specific)

- **Roles**: Must be `"Admin" | "Worker" | "Supervisor"`
- **Mobile**: 10-digit format validated with `/^[0-9]{10}$/`
- **Password**: Minimum 6 characters
- **Required signup fields**: `fullName, email, mobileNumber, password, role, assignedWardOrZone`

## Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Linting & Formatting

- ESLint enforces: `"no-console": "warn"`, semicolons required, double quotes
- Prettier runs via lint-staged on commit (husky)
- Use `// eslint-disable-next-line no-console` when console logging is intentional (e.g., error logging)

## Current Limitations

- **In-memory storage** - data resets on server restart; database integration pending
- **JWT secret** - uses env fallback; ensure `JWT_SECRET` is set in production
