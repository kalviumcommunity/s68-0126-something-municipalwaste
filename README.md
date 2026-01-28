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
Screenshot of worki<img width="1470" height="956" alt="Screenshot 2026-01-22 at 12 42 19 PM" src="https://github.com/user-attachments/assets/43cc9a0b-a1ad-4b50-b2a0-309ff1643253" />
ng:
