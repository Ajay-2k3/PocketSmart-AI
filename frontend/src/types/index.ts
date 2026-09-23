export type PlannerType = "home" | "party" | "jewelry";
export type PlanStatus = "pending" | "processing" | "completed" | "failed";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface BudgetSummary {
  currency: string;
  totalBudget: number;
  estimatedCost: number;
  remaining: number;
  savings?: number;
  utilization: number;
}

export interface CategoryAllocation {
  category: string;
  amount: number;
  percentage: number;
  description?: string;
}

export interface ShoppingLink {
  name: string;
  url: string;
  icon?: string;
}

export interface Recommendation {
  id: string;
  planId?: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  quantity?: number;
  source?: string;
  sourceUrl?: string;
  description: string;
  whyRecommended?: string;
  matchScore?: number;
  budgetImpact?: "low" | "medium" | "high";
  imageUrl?: string;
  saved?: boolean;
  style?: string;
  shoppingLinks?: ShoppingLink[];
  metadata?: Record<string, unknown>;
}

export interface OutfitAnalysis {
  colors: string[];
  style: string;
  formality: string;
}

export interface VenueSuggestion {
  name: string;
  type: string;
  location?: string;
  cost?: number;
  website?: string;
  mapUrl?: string;
}

export interface Plan {
  id: string;
  title: string;
  plannerType: PlannerType;
  status: PlanStatus;
  createdAt: string;
  budget: BudgetSummary;
  allocations: CategoryAllocation[];
  aiSummary: string;
  warnings: string[];
  recommendations: Recommendation[];
  partial?: boolean;
  additionalSuggestions?: string[];
  stylingTips?: string[];
  outfitAnalysis?: OutfitAnalysis;
  venueSuggestions?: VenueSuggestion[];
}

export interface PlanListItem {
  id: string;
  title: string;
  plannerType: PlannerType;
  status: PlanStatus;
  createdAt: string;
  totalBudget: number;
  estimatedCost: number;
  currency: string;
}

export interface HomePlannerInput {
  totalBudget: number;
  currency: string;
  flexibility: "strict" | "moderate" | "flexible";
  rooms: Array<{ name: string; quantity: number; notes?: string }>;
  requirements: Array<{
    category: string;
    quantity: number;
    priority: "low" | "medium" | "high";
    preferredStyle?: string;
  }>;
  style?: string;
  colorPreference?: string;
  qualityPreference?: string;
  brandPreference?: string;
  otherRequirements?: string;
}

export interface PartyPlannerInput {
  totalBudget: number;
  currency: string;
  guestCount: number;
  eventType: string;
  venueType: string;
  eventDate: string;
  foodPreference?: string;
  decorationPreference?: string;
  entertainmentPreference?: string;
  location?: string;
  additionalRequirements?: string;
}

export interface JewelryPlannerInput {
  totalBudget: number;
  currency: string;
  occasion: string;
  jewelryType: string;
  style: string;
  metalPreference?: string;
  colorPreference?: string;
  additionalRequirements?: string;
  outfitImageName?: string;
  outfitImageUrl?: string;
  outfitStoragePath?: string;
}
