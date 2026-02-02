# Municipal waste management system

Here we are using the proper folder structure without the need for and src folder. we are just using it inside the app folder. An api folder will be created in the future for the use of backend logic and routes.

## Project layout overview
- app: Next.js App Router code; each folder under app/ maps to a route; layout.tsx provides the shared shell; page.tsx is the root page; globals.css holds global styles.
- public: Static assets served at the site root (/). Good for images, icons, robots.txt.
- eslint.config.mjs, postcss.config.mjs, next.config.ts, tsconfig.json: Tooling and framework configuration for linting, CSS processing, Next.js runtime, and TypeScript.
- package.json: Dependencies, scripts, and project metadata.
- README.md: High-level project notes; future api folder planned for backend routes.

## Naming conventions
- Routes: lowercase, hyphenated folder names (app/admin-dashboard/page.tsx -> /admin-dashboard).
- Components: PascalCase for React components and filenames (NavBar.tsx), co-locate shared pieces under app/(components) or app/components.
- API routes: app/api/<resource>/route.ts with HTTP method exports.
- Styles: globals in app/globals.css; route- or component-scoped styles as CSS modules (Component.module.css).

## Scalability and clarity
- Route colocation: Each feature keeps UI, styles, and server actions together to reduce cross-folder hopping.
- Incremental routing: Add a page by adding a folder with page.tsx; shared layouts keep shells consistent without duplication.
- Clear separation: public for static assets; app for runtime code; configs at root to avoid ambiguity.
- Future API layer: app/api will keep backend logic near consumers for better discoverability and simpler contracts.
- Standardized tooling: Root configs enforce consistent linting, type-checking, and builds as the app grows.
## TypeScript & ESLint Configuration Learning Unit

### Why Strict TypeScript Mode Reduces Runtime Bugs
Strict mode in TypeScript (`"strict": true` in tsconfig.json) enables a comprehensive set of type-checking options that catch potential runtime errors during development:
- **Null/undefined safety**: Prevents accessing properties on null or undefined values, eliminating common "Cannot read property of undefined" errors
- **Type inference**: Forces explicit typing where ambiguity exists, reducing implicit 'any' types that bypass type checking
- **Stricter function checks**: Ensures functions are called with correct parameters and return types, preventing argument mismatches
- **Property initialization**: Requires class properties to be properly initialized, avoiding undefined state bugs
- **This binding**: Catches incorrect 'this' context usage in functions

By catching these issues at compile-time rather than runtime, strict mode significantly reduces production bugs and improves code reliability.

### ESLint + Prettier Rules Enforcement
Our configuration enforces consistent code quality and formatting:

**ESLint Rules** (`.eslintrc.json`):
- `extends: ["next/core-web-vitals", "plugin:prettier/recommended"]` - Leverages Next.js best practices and integrates Prettier for formatting
- `no-console: "warn"` - Warns about console statements to prevent debug code from reaching production
- `semi: ["error", "always"]` - Enforces semicolons for statement clarity and prevents ASI-related bugs
- `quotes: ["error", "double"]` - Standardizes double quotes across the codebase for consistency

**Prettier Configuration** (`.prettierrc`):
- `singleQuote: false` - Uses double quotes to match ESLint rules
- `semi: true` - Automatically adds semicolons
- `tabWidth: 2` - Consistent 2-space indentation
- `trailingComma: "es5"` - Adds trailing commas where valid in ES5 (arrays, objects) for cleaner diffs

These rules work together to ensure every team member writes code in the same style, reducing review friction and improving readability.

### How Pre-commit Hooks Improve Team Consistency
We use Husky with lint-staged to automatically enforce code quality before commits:

**Setup** (`.husky/pre-commit`):
```bash
npx lint-staged
```

**Lint-staged Configuration** (`package.json`):
```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"]
}
```

**Benefits**:
- **Automatic fixes**: ESLint and Prettier automatically fix code style issues before they're committed
- **Prevents bad code**: Blocks commits containing linting errors, ensuring only quality code enters the repository
- **Zero configuration burden**: Developers don't need to remember to run linting manually
- **Consistent git history**: All committed code follows the same standards, making diffs cleaner and reviews easier
- **Catches errors early**: Issues are identified immediately, not during CI/CD or code review
- **Team onboarding**: New developers automatically follow project standards without memorizing rules

This automated workflow ensures that code quality is maintained consistently across the entire team without requiring manual intervention.

## Authentication & Security Learning Unit

### Overview of Authentication Flow

The application implements a modern authentication system with two main endpoints:
- **Signup** (`POST /api/auth/signup`) - User registration with password hashing
- **Login** (`POST /api/auth/login`) - User authentication with JWT token generation

This architecture ensures secure credential management and stateless authentication using industry-standard practices.

### Signup Flow

The signup process registers new users with comprehensive validation:

1. **Request Validation**: All required fields (fullName, email, mobileNumber, password, role, assignedWardOrZone) are validated
2. **Format Validation**:
   - Email format validation using regex
   - Mobile number must be exactly 10 digits
   - Password minimum 6 characters
   - Role must be one of: Admin, Worker, Supervisor
3. **Duplicate Check**: System checks if user exists by email or mobile number
4. **Password Hashing**: Password is hashed using bcryptjs with salt (10 rounds)
5. **User Creation**: User is stored with hashed password (never plaintext)
6. **Response**: Returns user data (excluding password) with HTTP 201 (Created) status

**Bcrypt Password Hashing**:
The system uses bcryptjs with 10 salt rounds to hash passwords. This ensures that passwords are never stored in plaintext. Even if the database is compromised, attackers cannot recover original passwords due to the computational complexity of bcrypt.

**Success Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_1704067200000_abc123def",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "role": "Worker",
    "assignedWardOrZone": "Ward A",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

**Failure Response Example - Duplicate Email (409)**:
```json
{
  "error": "User already exists",
  "message": "A user with this email already exists"
}
```

**Failure Response Example - Invalid Email (400)**:
```json
{
  "error": "Validation failed",
  "message": "Invalid email format"
}
```

### Login Flow

The login process authenticates users and returns JWT tokens:

1. **Credential Collection**: Accept either email OR mobile number with password
2. **User Lookup**: Find user by email or mobile number
3. **Password Verification**: Compare provided password with stored hashed password using bcrypt
4. **Token Generation**: Create JWT token with user claims (userId, email, role, assignedWardOrZone)
5. **Token Expiry**: Token expires in 24 hours
6. **Response**: Return JWT token and user information

**JWT Token Generation & Verification**:
During login, the system verifies the provided password against the stored hashed password using bcrypt comparison. Upon successful verification, a JWT token is generated with user claims (userId, email, role, assignedWardOrZone) and cryptographically signed. The token expires in 24 hours and is returned to the client for subsequent authenticated requests.

**Success Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzE3MDQwNjcyMDBfYWJjMTIzIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IldvcmtlciIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MTUzNjAwfQ.signature",
  "user": {
    "id": "user_1704067200000_abc123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "role": "Worker",
    "assignedWardOrZone": "Ward A"
  }
}
```

**Failure Response - Invalid Credentials (401)**:
```json
{
  "error": "Invalid credentials",
  "message": "Email/mobile number or password is incorrect"
}
```

**Failure Response - Missing Fields (400)**:
```json
{
  "error": "Validation failed",
  "message": "Email or mobile number and password are required"
}
```

### Token Management & Security Reflection

#### Token Expiry and Refresh Logic
- **Current Implementation**: Tokens expire in 24 hours (`expiresIn: "24h"`)
- **Security Benefit**: Short-lived tokens reduce the window of exposure if a token is compromised
- **Refresh Strategy**: For production, implement a refresh token mechanism:
  - Access token: Short-lived (15 minutes) for API requests
  - Refresh token: Long-lived (7 days), stored securely, used to obtain new access tokens
  - Refresh endpoint: `POST /api/auth/refresh` to exchange refresh token for new access token
- **Implementation Consideration**: Refresh tokens should be HttpOnly cookies or securely stored, never exposed to JavaScript

#### Token Storage Options: Cookie vs localStorage

**localStorage Storage** (Current Frontend Pattern):
- **Pros**: Easy to implement, accessible across tabs, straightforward in SPA applications
- **Cons**: Vulnerable to XSS (Cross-Site Scripting) attacks; malicious script can steal token; exposed to localStorage inspection

**HttpOnly Cookie Storage** (More Secure):
- **Pros**: HttpOnly flag prevents JavaScript access, immune to XSS attacks, automatic cookie transmission, SameSite prevents CSRF
- **Cons**: Slightly more complex to implement, requires backend cookie handling
- **Recommendation**: Use HttpOnly cookies for authentication tokens in production environments

#### How Authentication Strengthens App Security

1. **Password Hashing with Bcryptjs**:
   - Bcrypt uses salt + hash iterations (10 rounds) to make password cracking computationally infeasible
   - Even with database breach, original passwords cannot be recovered
   - Protects against rainbow table attacks and brute force attempts

2. **JWT-Based Stateless Authentication**:
   - No server-side session storage required; reduces session hijacking risks
   - Token includes user claims (role, assignedWardOrZone) enabling role-based access control (RBAC)
   - Cryptographic signature ensures token hasn't been tampered with
   - Token expiry forces re-authentication, limiting breach window

3. **Input Validation & Sanitization**:
   - Email format validation prevents injection attacks
   - Mobile number validation ensures data integrity
   - Password length requirement (minimum 6 chars) prevents weak credentials
   - Role validation restricts invalid user roles

4. **Duplicate User Prevention**:
   - Email and mobile number uniqueness checks prevent account takeover
   - Ensures data consistency and prevents privilege escalation

5. **Secure Error Messages**:
   - Generic "Invalid credentials" message prevents user enumeration attacks
   - Attackers cannot determine if email exists or just password is wrong
   - Protects user privacy and prevents account discovery

6. **HTTPS Requirement** (Production):
   - JWT and passwords must be transmitted over HTTPS
   - Prevents man-in-the-middle attacks during token transmission
   - Essential for production deployments

7. **Role-Based Access Control (RBAC)**:
   - User role (Admin, Worker, Supervisor) embedded in JWT token
   - Backend routes can verify role before authorizing sensitive operations
   - Prevents privilege escalation and unauthorized data access

**Best Practices for Production**:
- Store `JWT_SECRET` in environment variables (never hardcode)
- Use HTTPS only for token transmission
- Implement token refresh mechanism for extended sessions
- Add rate limiting on login/signup endpoints to prevent brute force
- Log authentication events for security audit trails
- Implement password strength requirements (uppercase, numbers, special chars)
- Consider two-factor authentication (2FA) for admin roles

## Environment Variable Management Learning Unit

### Secure Environment Variable Configuration

We maintain a secure and collaborative environment variable setup using the following structure:

**Files & Configuration**:
- `.env.example` - Committed to git; contains template variables with example/dummy values for reference (NO secrets)
- `.env.local` - Git-ignored; contains actual secrets and sensitive data (each developer has their own)
- `.gitignore` protection - Configured to ignore `.env` but explicitly track `.env.example`

**Configuration Details** (`.gitignore`):
```ignore
# env files (can opt-in for committing if needed)
.env
!.env.example
```

This pattern ensures:
- Actual secrets in `.env` and `.env.local` are never accidentally committed
- `.env.example` serves as onboarding documentation for new developers
- Team members can quickly set up their local environment by copying `.env.example` to `.env.local`

### Safe process.env Usage

All environment variables in Next.js are accessed safely through `process.env`:

**Benefits**:
- Variables are resolved at build time for security
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Sensitive keys remain server-side only
- Type-safe with proper TypeScript configuration

**Example**:
```typescript
// Safe - server-side only
const apiSecret = process.env.API_SECRET;

// Safe - explicitly exposed to browser when needed
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
```

This approach protects sensitive credentials while allowing necessary public configuration to reach the frontend.

## Team Branching & PR Workflow Setup Learning Unit

### Branching Strategy & Naming Conventions

We use a **feature branch strategy where each team member has a dedicated branch**:

**Branch Structure**:
- `main` - Production-ready code (default branch)
- `DevMayur` - Mayur's development branch
- `DevJathin` - Jathin's development branch
- `DevAnil` - Anil's development branch

**Benefits of This Strategy**:
- **Isolation**: Each developer works independently without interfering with others' code
- **Clear ownership**: Branch names clearly indicate who's responsible for changes
- **Easy merging**: PRs are created from individual branches to `main`, keeping the merge history clean
- **Parallel development**: Multiple features can be developed simultaneously
- **Simple conflict resolution**: Most conflicts are resolved during PR review rather than during branch merges

### Pull Request Process

Every feature or fix goes through a structured PR workflow:

**PR Template** (`.github/pull_request_template.md`):

The template guides authors through a comprehensive submission process:

1. **Summary** - Clear explanation of the PR's purpose and what problem it solves
2. **Type of Change** - Categorizes the PR (bug fix, new feature, breaking change, documentation, refactoring)
3. **Changes Made** - Detailed list of modifications and reasoning
4. **Screenshots / Evidence** - Visual proof and build/lint output showing all checks pass
5. **Pre-Submission Checklist** - Author verifies:
   - Build passes (`npm run build`)
   - Linting passes (`npm run lint`)
   - Type checking succeeds (`npm run type-check`)
   - No debug code or secrets left behind
   - Code follows project conventions

6. **Review Checklist** - Reviewers verify:
   - At least one teammate approval
   - All review comments resolved
   - PR linked to corresponding issue
   - Clear commit messages
   - No merge conflicts

7. **Additional Context** - Extra information like related issues, dependencies, or security considerations

This detailed template ensures every PR meets team standards before merging.

### Code Review Checklist

When reviewing PRs, team members verify:

1. **Code Quality**
   - Code follows naming conventions and project standards
   - No console.log or debug code left behind
   - Functions are properly typed with TypeScript
   - No hardcoded secrets or sensitive data

2. **Testing & Builds**
   - Code builds without errors
   - ESLint and Prettier checks pass
   - All type checks pass (`tsc --noEmit`)

3. **Documentation**
   - Changes are documented if they affect usage
   - Comments explain complex logic
   - Commit messages are clear and descriptive

4. **Collaboration**
   - At least one other team member has reviewed and approved
   - All review comments are resolved
   - The PR is linked to the corresponding issue

### How This Workflow Maintains Code Quality, Collaboration & Velocity

**Code Quality**:
- Pre-commit hooks prevent bad code from being committed
- PR reviews catch issues before merge
- Automated linting and type checks ensure consistency
- Team standards are enforced at every step

**Collaboration**:
- Dedicated branches prevent developers from stepping on each other's toes
- PR discussions provide context for decisions
- Code reviews distribute knowledge across the team
- Clear naming conventions make navigation easy

**Velocity**:
- Developers can work independently without waiting for others
- Parallel development on separate branches speeds up feature delivery
- Automated checks eliminate manual verification tasks
- Clear workflow reduces back-and-forth communication

### Real PR Example

When a developer completes work on their feature branch (e.g., `DevMayur`), they:

1. Push their changes to their branch
2. Create a PR from their branch to `main`
3. GitHub automatically runs lint and type checks
4. Teammates review the PR using the checklist
5. After approval and all checks pass, the PR is merged to `main`


## Docker & Compose Setup for Local Development

### Dockerfile Explanation

Our `Dockerfile` is designed for a Next.js app:

- **Base image**: Uses `node:20-alpine` for a lightweight, production-ready Node.js environment.
- **WORKDIR**: Sets `/app` as the working directory inside the container.
- **Dependency install**: Copies `package.json` and `package-lock.json` (if present) and runs `npm install` for reproducible installs.
- **App copy & build**: Copies the rest of the project and runs `npm run build` to generate the Next.js production build.
- **Expose port**: Opens port 3000 (the default for Next.js).
- **Start command**: Runs `npm run start` to launch the app in production mode.

### docker-compose.yml Explanation

Our `docker-compose.yml` defines three services and their relationships:

- **app**: The Next.js application, built from the Dockerfile. Depends on `db` and `redis` services. Exposes port 3000. Environment variables connect it to the database and cache.
- **db**: A PostgreSQL 15 database. Uses a named volume (`db_data`) for persistent storage. Exposes port 5432. Credentials and DB name are set via environment variables.
- **redis**: A Redis 7 cache. Exposes port 6379 for fast in-memory data storage.

#### Networks
- All services are connected to a custom bridge network `localnet` for secure, isolated communication.

#### Environment Variables
- The app uses `DATABASE_URL` and `REDIS_URL` to connect to the database and cache. The `db` service uses standard Postgres environment variables for setup.

#### Volumes
- `db_data` is a named volume that persists Postgres data across container restarts, preventing data loss.

### Example: Build & Run Logs

```
docker compose up --build
...
nextjs_app  | Ready on http://localhost:3000
postgres_db | database system is ready to accept connections
redis_cache | Ready to accept connections
```

You can verify running containers with:
```
docker ps
```

### Troubleshooting & Reflections

- **Port conflicts**: If ports 3000, 5432, or 6379 are in use, stop the conflicting processes or change the ports in `docker-compose.yml`.
- **Permission errors**: On some systems, volume permissions may cause Postgres to fail. Fix by adjusting local folder permissions or running Docker with elevated privileges.
- **Slow builds**: Ensure `node_modules` is not copied into the image by using a `.dockerignore` file. This keeps builds fast and images small.
- **Service startup order**: The `depends_on` field ensures the app waits for db and redis to start, but you may still need to handle retry logic in your app for production.

This setup enables fast, reproducible local development with isolated dependencies and persistent data.

## Reflection: Consistent REST API Naming for Municipal Waste Management Systems

### Why Naming Matters

In a municipal waste management reporting system, consistent REST API naming is foundational to long-term maintainability. When multiple teams—field workers, supervisors, administrators, and third-party integrators—interact with the same API, predictable naming conventions reduce cognitive load and prevent errors.

### Key Principles Applied

**1. Resource-Based Naming**
Using nouns that represent domain entities makes APIs intuitive:
- `/api/reports/waste-segregation` — clearly identifies the resource
- `/api/communities/{id}/reports` — shows hierarchical relationships

This is evident in the project structure where `app/api/reports/waste-segregation/route.ts` follows Next.js conventions while maintaining REST principles.

**2. Plural Nouns for Collections**
Using `/reports` instead of `/report` signals that the endpoint handles collections, making it clear that:
- `GET /reports` returns multiple items (with pagination)
- `POST /reports` creates a single new item within that collection

**3. Hierarchical Consistency**
In waste management, data flows through hierarchies (zones → wards → communities → reports). Consistent naming reflects this:
```
/api/zones/{zoneId}/wards
/api/wards/{wardId}/communities
/api/communities/{communityId}/reports
```

**4. Query Parameters for Filtering**
Rather than creating multiple endpoints (`/pending-reports`, `/verified-reports`), using query parameters maintains a single source of truth:
```
GET /api/reports/waste-segregation?status=pending&ward=Ward5&minScore=80
```

### Maintainability Benefits

| Aspect | Impact |
|--------|--------|
| **Onboarding** | New developers understand endpoints without documentation |
| **Debugging** | Predictable URLs make log analysis straightforward |
| **Testing** | Consistent patterns enable reusable test utilities |
| **Versioning** | Clear structure simplifies `/v2/` migrations |
| **Integration** | Third-party systems (municipal dashboards, mobile apps) integrate faster |

### Real-World Example

In this waste management system, when a field worker submits a segregation report, the flow is clear:
1. `POST /api/reports/waste-segregation` — creates the report
2. `GET /api/reports/waste-segregation?status=pending` — supervisors review pending reports
3. `PATCH /api/reports/waste-segregation/{id}` — updates status to "verified"

Each endpoint's purpose is self-documenting, reducing the need for extensive API documentation and minimizing integration errors across the municipal system.

### Conclusion

Consistent REST API naming isn't just about aesthetics—it's a form of documentation that lives in the code itself. For municipal systems that may span years of maintenance and multiple development teams, this consistency pays dividends in reduced bugs, faster feature development, and smoother handoffs.
