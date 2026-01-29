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

Example PR workflow showing:
- ✅ All checks passing (ESLint, TypeScript, Build)
- ✅ At least one approval from a teammate
- ✅ Clear commit history from the feature branch
- ✅ Resolved review comments before merge
