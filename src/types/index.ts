export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'halal';

export type ShoppingCategory =
  | 'Fruits & Légumes'
  | 'Viandes'
  | 'Poissons'
  | 'Produits laitiers & Œufs'
  | 'Boulangerie'
  | 'Épicerie';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  pricePerUnit: number; // prix par unité à Carrefour (référence)
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  mealType: MealType;
  dietaryTags: DietaryTag[];
  ingredients: Ingredient[];
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  emoji: string;
}

export interface Store {
  id: string;
  name: string;
  priceMultiplier: number;
  color: string;
  bgColor: string;
}

export interface DayMenu {
  breakfast?: string; // recipe id
  lunch?: string;
  dinner?: string;
}

export type WeekDay = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export type WeekMenu = Record<WeekDay, DayMenu>;

export interface UserPreferences {
  dietaryTags: DietaryTag[];
  storeId: string;
  weeklyBudget: number;
  servings: number;
}

export interface ShoppingItem {
  name: string;
  totalQuantity: number;
  unit: string;
  category: ShoppingCategory;
  totalPrice: number;
  fromRecipes: string[];
}

export const WEEK_DAYS: WeekDay[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
};

export const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🌤️',
  dinner: '🌙',
};

export const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian: 'Végétarien',
  vegan: 'Végétalien',
  'gluten-free': 'Sans gluten',
  'dairy-free': 'Sans lactose',
  halal: 'Halal',
};

export const DIETARY_EMOJIS: Record<DietaryTag, string> = {
  vegetarian: '🥦',
  vegan: '🌱',
  'gluten-free': '🌾',
  'dairy-free': '🥛',
  halal: '☪️',
};

export const CATEGORY_EMOJIS: Record<ShoppingCategory, string> = {
  'Fruits & Légumes': '🥕',
  'Viandes': '🥩',
  'Poissons': '🐟',
  'Produits laitiers & Œufs': '🧀',
  'Boulangerie': '🥖',
  'Épicerie': '🧴',
};
