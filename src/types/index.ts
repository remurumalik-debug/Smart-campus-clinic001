export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "student";
  matricNo?: string;
  department?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdmin {
  _id?: string;
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "clinic_staff";
  securityKey: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAppointment {
  _id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessage {
  _id?: string;
  userId: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}

export interface IDepartment {
  _id?: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IDoctor {
  _id?: string;
  name: string;
  email: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  isAvailable: boolean;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  createdAt?: Date;
}
