export type TestType = 'prep' | 'pin' | 'custom';

export type SessionStatus = 'scheduled' | 'cancelled' | 'completed';
export type BookingStatus = 'pending' | 'submitted_for_approval' | 'approved' | 'confirmed' | 'rejected' | 'cancelled' | 'refunded';
export type UserRole = 'session_manager' | 'instructor' | 'admin';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  facilities?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Instructor {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  bio?: string;
  certifications?: string[];
  specialties?: string[];
  rating?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  test_type: TestType;
  title: string;
  description?: string;
  location_id: string;
  instructor_id?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  price_cents: number;
  currency: string;
  status: SessionStatus;
  requirements?: string[];
  equipment_provided?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  location?: Location;
  instructor?: Instructor;
  availability?: SessionAvailability;
}

export interface SessionAvailability {
  total_capacity: number;
  booked_count: number;
  available_spots: number;
  waitlist_count: number;
  session_status?: string;
}

export interface SessionInstructor {
  id: string;
  session_id: string;
  instructor_id: string;
  role: string;
  created_at: string;
  
  // Joined data
  instructor?: Instructor;
}

export interface Booking {
  id: string;
  user_id: string;
  session_id: string;
  status: BookingStatus;
  amount_cents: number;
  currency: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Payment fields
  payment_intent_id?: string;
  payment_status?: string;
  payment_method?: string;
  transaction_id?: string;
  receipt_url?: string;
  
  // Waiver fields
  waiver_id?: string;
  
  // Admin approval fields
  admin_reviewed_by?: string;
  admin_reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  
  // Joined data
  session?: PracticeSession;
  attendance?: Attendance;
  waiver?: any; // Will be defined when needed
}

export interface Waitlist {
  id: string;
  user_id: string;
  session_id: string;
  position: number;
  notified: boolean;
  created_at: string;
  
  // Joined data
  session?: PracticeSession;
}

export interface Attendance {
  id: string;
  booking_id: string;
  checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  notes?: string;
  created_at: string;
}

export interface UserAppRole {
  id: string;
  user_id: string;
  role: 'session_manager' | 'instructor' | 'admin';
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WaiverData {
  // Personal Information
  full_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  province?: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Medical Information (Optional)
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  
  // Legal Acknowledgments
  medically_fit: boolean;
  understand_risks: boolean;
  release_liability: boolean;
  consent_emergency_care: boolean;
  agree_policies: boolean;
  
  // Signature
  signature_data: string; // Base64 encoded signature
  typed_legal_name: string;
  signature_timestamp: string;
  
  // Versioning
  waiver_version: string;
}

export interface BookingFormData {
  session_id: string;
  waiver_data: WaiverData;
  payment_intent_id?: string;
}

export interface CreateSessionData {
  test_type: TestType;
  title: string;
  description?: string;
  location_id: string;
  instructor_id?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  price_cents: number;
  requirements?: string[];
  equipment_provided?: string[];
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  status?: SessionStatus;
}

export interface SessionFilters {
  test_type?: TestType;
  date_from?: string;
  date_to?: string;
  location_id?: string;
  instructor_id?: string;
  available_only?: boolean;
}

export interface BookingFilters {
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
  test_type?: TestType;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Stripe types
export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface CreatePaymentIntentData {
  session_id: string;
  amount_cents: number;
  currency: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  session: PracticeSession;
  isBooked: boolean;
  isWaitlisted: boolean;
}

export interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
}

// Notification types
export interface NotificationData {
  type: 'booking_confirmation' | 'booking_reminder' | 'session_cancelled' | 'waitlist_available';
  title: string;
  body: string;
  data?: Record<string, any>;
}

// QR Code types
export interface QRCodeData {
  booking_id: string;
  session_id: string;
  user_id: string;
  timestamp: number;
}

// Error types
export interface BookingError {
  code: 'session_full' | 'already_booked' | 'session_cancelled' | 'payment_failed' | 'waiver_required' | 'invalid_session';
  message: string;
  details?: any;
}
