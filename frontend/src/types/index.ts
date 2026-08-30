// All shared TypeScript types for the Dresync frontend

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// ── Clothing ──────────────────────────────────────────────

export type ClothingCategory = 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory';

export type ClothingPattern =
  | 'solid' | 'striped' | 'checkered' | 'floral'
  | 'geometric' | 'animal_print' | 'abstract' | 'other';

export type UsageStatus = 'active' | 'archived';

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  primary_color: string;
  secondary_colors: string[];
  pattern: ClothingPattern;
  styles: string[];
  seasons: string[];
  occasions: string[];
  notes?: string;
  image_url?: string;
  usage_status: UsageStatus;
  wear_count: number;
  last_worn?: string;
  created_at: string;
  updated_at: string;
}

export interface ClothingItemCreate {
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  primary_color: string;
  secondary_colors?: string[];
  pattern?: ClothingPattern;
  styles?: string[];
  seasons?: string[];
  occasions?: string[];
  notes?: string;
  usage_status?: UsageStatus;
}

// ── Outfit ────────────────────────────────────────────────

export interface RecommendationReason {
  type: 'color' | 'style' | 'occasion' | 'season' | 'category';
  description: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name?: string;
  top?: ClothingItem;
  bottom?: ClothingItem;
  outerwear?: ClothingItem;
  shoes?: ClothingItem;
  accessory_ids: string[];
  compatibility_score: number;
  recommendation_reasons: RecommendationReason[];
  occasion?: string;
  season?: string;
  is_favorite: boolean;
  is_ai_generated: boolean;
  created_at: string;
}

export interface OutfitGenerateRequest {
  occasion?: string;
  season?: string;
  count?: number;
}

export interface OutfitHistory {
  id: string;
  outfit_id: string;
  worn_date: string;
  rating?: number;
  notes?: string;
  outfit?: Outfit;
  created_at: string;
}

// ── Planner ───────────────────────────────────────────────

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start: string;
  monday?: Outfit;
  tuesday?: Outfit;
  wednesday?: Outfit;
  thursday?: Outfit;
  friday?: Outfit;
  saturday?: Outfit;
  sunday?: Outfit;
  created_at: string;
  updated_at: string;
}

// ── Stats ─────────────────────────────────────────────────

export interface WardrobeStats {
  total_items: number;
  by_category: Record<string, number>;
  total_outfits: number;
  total_worn: number;
}

// ── Shared ────────────────────────────────────────────────

export type DayOfWeek =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: 'Top',
  bottom: 'Bottom',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessory',
};

export const CATEGORY_EMOJIS: Record<ClothingCategory, string> = {
  top: '👕',
  bottom: '👖',
  outerwear: '🧥',
  shoes: '👟',
  accessory: '👜',
};

export const STYLE_OPTIONS = [
  'casual', 'smart_casual', 'business_casual', 'formal',
  'streetwear', 'sporty', 'athleisure', 'bohemian',
  'vintage', 'preppy', 'minimalist', 'edgy',
];

export const SEASON_OPTIONS = ['spring', 'summer', 'fall', 'winter', 'all'];

export const OCCASION_OPTIONS = [
  'casual', 'work', 'business', 'formal', 'date', 'dinner',
  'outdoor', 'sporty', 'gym', 'party', 'evening', 'weekend',
  'travel', 'beach', 'wedding', 'semi_formal',
];

export const PATTERN_OPTIONS: ClothingPattern[] = [
  'solid', 'striped', 'checkered', 'floral', 'geometric', 'animal_print', 'abstract', 'other',
];
