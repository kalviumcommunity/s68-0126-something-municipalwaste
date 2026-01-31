import { User } from "@/types/user";

// In-memory user storage
class UserStore {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  // Find user by email
  findByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Find user by mobile number
  findByMobileNumber(mobileNumber: string): User | undefined {
    return Array.from(this.users.values()).find(
      (user) => user.mobileNumber === mobileNumber
    );
  }

  // Add new user
  addUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // Get all users (for debugging)
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Get user by ID
  findById(id: string): User | undefined {
    return this.users.get(id);
  }
}

// Export singleton instance
export const userStore = new UserStore();
