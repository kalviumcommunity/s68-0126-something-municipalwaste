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

Screenshot of worki<img width="1470" height="956" alt="Screenshot 2026-01-22 at 12 42 19 PM" src="https://github.com/user-attachments/assets/43cc9a0b-a1ad-4b50-b2a0-309ff1643253" />
ng:
