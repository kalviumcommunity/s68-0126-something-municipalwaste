import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { userStore } from "@/lib/userStore";
import { SignupRequest, SignupResponse, User } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SignupRequest = await request.json();

    // Validate required fields
    const {
      fullName,
      email,
      mobileNumber,
      password,
      role,
      assignedWardOrZone,
    } = body;

    if (
      !fullName ||
      !email ||
      !mobileNumber ||
      !password ||
      !role ||
      !assignedWardOrZone
    ) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message:
            "All fields are required: fullName, email, mobileNumber, password, role, assignedWardOrZone",
        },
        { status: 400 }
      );
    }

    // Validate email format
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

    // Validate mobile number format (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Mobile number must be 10 digits",
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["Admin", "Worker", "Supervisor"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Role must be one of: Admin, Worker, Supervisor",
        },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const existingUserByEmail = userStore.findByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        {
          error: "User already exists",
          message: "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    // Check if user already exists by mobile number
    const existingUserByMobile = userStore.findByMobileNumber(mobileNumber);
    if (existingUserByMobile) {
      return NextResponse.json(
        {
          error: "User already exists",
          message: "A user with this mobile number already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fullName,
      email,
      mobileNumber,
      password: hashedPassword,
      role,
      assignedWardOrZone,
      createdAt: new Date(),
    };

    // Store user
    userStore.addUser(newUser);

    // Prepare response (exclude password)
    const response: SignupResponse = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      role: newUser.role,
      assignedWardOrZone: newUser.assignedWardOrZone,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: response,
      },
      { status: 201 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred during registration",
      },
      { status: 500 }
    );
  }
}
