# Municipal Waste Management System - Setup Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (v12 or higher)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd s68-0126-something-municipalwaste
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE municipalwaste;

# Exit psql
\q
```

### 4. Configure Environment Variables

Update the `.env.local` file with your database credentials:

```env
# Database - Update with your credentials
DATABASE_URL="postgresql://username:password@localhost:5432/municipalwaste"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-change-in-production"

# GitHub OAuth (if using)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

To generate a secure `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create database schema
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Test Accounts

After seeding the database, you can log in with these test accounts:

### Admin Account
- **Email:** admin@ecowaste.com
- **Password:** admin123
- **Role:** Full system access, user management, settings

### Collector Account
- **Email:** collector1@ecowaste.com
- **Password:** collector123
- **Role:** Manage collections, update status, view routes

### User Account
- **Email:** user1@example.com
- **Password:** user123
- **Role:** Request collections, submit reports, view schedule

## Project Structure

```
├── app/                      # Next.js 16 App Router pages
│   ├── api/                  # API routes
│   │   ├── collections/      # Collection management
│   │   ├── reports/          # Issue reporting
│   │   ├── notifications/    # Notifications
│   │   ├── dashboard/        # Dashboard stats
│   │   ├── profile/          # User profile
│   │   ├── rewards/          # Rewards system
│   │   └── schedule/         # Collection schedules
│   ├── collections/          # Collection pages
│   ├── reports/              # Report pages
│   ├── notifications/        # Notifications page
│   ├── schedule/             # Schedule page
│   ├── profile/              # Profile page
│   ├── users/                # User management (admin)
│   ├── settings/             # Settings (admin)
│   └── components/           # Page-specific components
├── components/               # Shared UI components
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx            # Navigation bar
│   └── theme-provider.tsx    # Theme management
├── lib/                      # Utilities and helpers
│   ├── validations/          # Zod validation schemas
│   ├── utils/                # Utility functions
│   └── db.ts                 # Prisma client
├── prisma/                   # Database
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── public/                   # Static assets
```

## Key Features

### User Features
- 🔐 Secure authentication with NextAuth v5
- ♻️ Request waste collections
- 📝 Submit issue reports
- 📅 View collection schedules
- 🎁 Earn and redeem reward points
- 🔔 Real-time notifications
- 👤 Profile management

### Collector Features
- 🚛 View assigned collections
- ✅ Update collection status
- 🗺️ Manage collection routes
- 📊 View collection history

### Admin Features
- 👥 User management and role assignment
- ⚙️ System settings configuration
- 📊 Analytics and reporting
- 🗓️ Schedule management
- 🎁 Rewards management

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database
npx prisma studio        # Open Prisma Studio (database GUI)

# Code Quality
npm run lint             # Run ESLint
```

## Database Management

### Prisma Studio
View and edit database records with Prisma Studio:
```bash
npx prisma studio
```
Access at [http://localhost:5555](http://localhost:5555)

### Reset Database
To reset the database (⚠️ will delete all data):
```bash
npx prisma migrate reset
```

### View Database Schema
```bash
npx prisma db pull       # Pull schema from database
npx prisma format        # Format schema file
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `psql -U postgres`
- Check `DATABASE_URL` in `.env.local`
- Ensure database exists: `psql -l`

### Migration Errors
```bash
# Reset migrations (⚠️ deletes data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name fix-schema
```

### Seed Errors
```bash
# If seed fails, check:
npx prisma generate     # Ensure Prisma Client is generated
npm install ts-node -D  # Install ts-node if missing
```

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and restart server

## API Documentation

### Collections API
- `GET /api/collections` - List all collections
- `POST /api/collections` - Create new collection
- `GET /api/collections/[id]` - Get collection details
- `PATCH /api/collections/[id]` - Update collection status
- `DELETE /api/collections/[id]` - Delete collection

### Reports API
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `PATCH /api/reports/[id]` - Update report status

### Notifications API
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Dashboard API
- `GET /api/dashboard/stats` - Get dashboard statistics

### Profile API
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile

### Rewards API
- `GET /api/rewards` - List available rewards
- `POST /api/rewards/[id]/redeem` - Redeem a reward

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth v5 (beta)
- **UI Library:** Radix UI + Tailwind CSS
- **Form Validation:** React Hook Form + Zod
- **Theme:** next-themes (light/dark mode)
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Deployment

### Environment Variables for Production
Ensure these are set in your production environment:
- `DATABASE_URL` - Production database URL
- `NEXTAUTH_URL` - Production domain
- `NEXTAUTH_SECRET` - Strong secret key
- `GITHUB_ID` & `GITHUB_SECRET` (if using OAuth)

### Build Steps
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start server
npm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of an academic assignment.

## Support

For issues or questions, please contact the development team or create an issue in the repository.
