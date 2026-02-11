import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

import routesConfig from "./routes.config.json";

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

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
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
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in database
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: routesConfig.defaultRole as "admin" | "collector" | "user",
    },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
}
