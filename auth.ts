import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcrypt";

import routesConfig from "./routes.config.json";

// This would normally connect to a database
// For now, we'll use a mock user store
export const users: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}> = [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error("Please provide both email and password");
        }

        // Find user
        const user = users.find((u) => u.email === email);

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  debug: true, // Enable debug mode to see more error details
  session: {
    strategy: "jwt" as const,
  },
});

// Helper function to register new users
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  // Check if user already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password: hashedPassword,
    role: routesConfig.defaultRole,
  };

  users.push(newUser);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
}

// Get all users (without passwords)
export function getUsers() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return users.map(({ password, ...user }) => user);
}

// Find a user by ID (without password)
export function getUserById(id: string) {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}

// Update a user's role (returns the updated user without password)
export function updateUserRole(userId: string, newRole: string) {
  if (!routesConfig.roles.includes(newRole)) {
    throw new Error(
      `Invalid role. Must be one of: ${routesConfig.roles.join(", ")}`
    );
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.role = newRole;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}

// Seed a default admin account (runs once on startup)
async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ecowaste.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  const exists = users.find((u) => u.email === adminEmail);
  if (exists) return;

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  users.push({
    id: crypto.randomUUID(),
    name: "Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });

  // eslint-disable-next-line no-console
  console.log(`[Auth] Seeded admin account: ${adminEmail}`);
}

// eslint-disable-next-line no-console
seedAdmin().catch(console.error);
