export type UserRole = "client" | "knight" | "ally" | "admin";

export type TaskStatus =
  | "draft"
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type TaskCategory =
  | "pilgrimage"
  | "delivery"
  | "photography"
  | "documents"
  | "tech"
  | "research"
  | "representation"
  | "other";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  telegram_id: number | null;
  stripe_account_id: string | null;
  created_at: string;
}

export interface Knight {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  skills: string[];
  languages: string[];
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  radius_km: number | null;
  pilgrim_id: string | null;
  verification_status: VerificationStatus;
  rating: number;
  completed_count: number;
}

export interface Task {
  id: string;
  client_id: string;
  knight_id: string | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  location_name: string | null;
  is_remote: boolean;
  budget: number | null;
  currency: string;
  status: TaskStatus;
  deadline: string | null;
  visibility: "public" | "private" | "api_only";
  created_at: string;
  updated_at: string;
  // Joined
  client?: Pick<Profile, "id" | "display_name" | "avatar_url">;
  knight?: Pick<Knight, "id" | "display_name" | "avatar_url" | "rating">;
  offers?: Offer[];
}

export interface Offer {
  id: string;
  task_id: string;
  knight_id: string;
  price: number;
  message: string | null;
  eta_hours: number | null;
  status: OfferStatus;
  created_at: string;
  knight?: Pick<Knight, "id" | "display_name" | "avatar_url" | "rating" | "completed_count">;
}

export interface Transaction {
  id: string;
  task_id: string;
  amount: number;
  platform_fee: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  status: "pending" | "held" | "released" | "refunded";
  created_at: string;
}

// API types for AI agents
export interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  location_name: string | null;
  is_remote: boolean;
  budget: number | null;
  currency: string;
  status: TaskStatus;
  deadline: string | null;
  created_at: string;
}

export interface ApiKnight {
  id: string;
  display_name: string;
  skills: string[];
  languages: string[];
  location_name: string | null;
  rating: number;
  completed_count: number;
  verification_status: VerificationStatus;
}
