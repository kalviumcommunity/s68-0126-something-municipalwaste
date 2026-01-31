export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: "Admin" | "Worker" | "Supervisor";
  assignedWardOrZone: string;
  createdAt: Date;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: "Admin" | "Worker" | "Supervisor";
  assignedWardOrZone: string;
}

export interface SignupResponse {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "Admin" | "Worker" | "Supervisor";
  assignedWardOrZone: string;
  createdAt: Date;
}
