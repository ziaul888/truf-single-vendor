// Global type definitions for the Turf Admin Panel

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ground {
  id: string;
  branchId: string;
  name: string;
  type: "cricket" | "football" | "hockey" | "badminton" | "tennis" | "basketball" | "other";
  size: string;
  capacity: number;
  photos: string[];
  amenities: string[];
  pricePerHour: number;
  openingTime: string; // "06:00"
  closingTime: string; // "23:00"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalBookings: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  customerId: string;
  groundId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: "card" | "upi" | "cash" | "bank_transfer";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  createdAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "attendant" | "maintenance";
  branchId?: string;
  groundId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "manager";
  avatar?: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CalendarSlot {
  id: string;
  groundId: string;
  groundName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  status: "booked" | "partial" | "blocked";
  customerName?: string;
  customerPhone?: string;
  amount?: number;
  advancePaid?: number;
  note?: string;
}

export interface CalendarGround {
  id: string;
  name: string;
  type: string;
  color: "emerald" | "sky" | "violet" | "rose";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
