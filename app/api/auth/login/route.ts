import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userStore } from "@/lib/userStore";

// JWT secret key (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, mobileNumber, password } = body;

    // Validate that either email or mobileNumber is provided
    if ((!email && !mobileNumber) || !password) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Email or mobile number and password are required",
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            error: "Validation failed",
            message: "Invalid email format",
          },
          { status: 400 }
        );
      }
    }

    // Find user by email or mobile number
    let user;
    if (email) {
      user = userStore.findByEmail(email);
    } else if (mobileNumber) {
      user = userStore.findByMobileNumber(mobileNumber);
    }

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "Email/mobile number or password is incorrect",
        },
        { status: 401 }
      );
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          message: "Email/mobile number or password is incorrect",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        assignedWardOrZone: user.assignedWardOrZone,
      },
      JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Return success response with token and user info
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
          assignedWardOrZone: user.assignedWardOrZone,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred during login",
      },
      { status: 500 }
    );
  }
}
