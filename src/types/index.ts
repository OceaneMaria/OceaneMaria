export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'halal'
  | 'healthy'
  | 'high-protein'
  | 'crohn-friendly';

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
  pricePerUnit: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  mealType: MealType;
  dietaryTags: DietaryTag[];
  ingredients: Ingredient[];
  servings: number;
  prepTime: number;
  cookTime: number;
  emoji: string;
  sourceUrl?: string;
  isCustom?: boolean;
}

export interface Store {
  id: string;
  name: string;
  priceMultiplier: number;
  color: string;
  bgColor: string;
}

export interface DayMenu {
  breakfast?: string;
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
  excludedFoods: string[];
  activeMeals: MealType[];
  batchCookingDay?: WeekDay | null;
}

export interface ShoppingItem {
  name: string;
  totalQuantity: number;
  unit: string;
  category: ShoppingCategory;
  totalPrice: number;
  fromRecipes: string[];
}

export type TimeFilter = 'all' | 'quick' | 'medium' | 'long';

export type Season = 'printemps' | 'été' | 'automne' | 'hiver';

export type SortOption = 'default' | 'time-asc' | 'time-desc' | 'az';

export const SEASON_LABELS: Record<Season, string> = {
  printemps: 'Printemps',
  été: 'Été',
  automne: 'Automne',
  hiver: 'Hiver',
};

export const SEASON_EMOJIS: Record<Season, string> = {
  printemps: '🌸',
  été: '☀️',
  automne: '🍂',
  hiver: '❄️',
};

export const WEEK_DAYS: WeekDay[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Dîner',
  dinner: 'Souper',
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
  healthy: 'Sain & équilibré',
  'high-protein': 'Riche en protéines',
  'crohn-friendly': 'Adapté Crohn',
};

export const DIETARY_EMOJIS: Record<DietaryTag, string> = {
  vegetarian: '🥦',
  vegan: '🌱',
  'gluten-free': '🌾',
  'dairy-free': '🥛',
  halal: '☪️',
  healthy: '💚',
  'high-protein': '💪',
  'crohn-friendly': '🏥',
};

export const DIETARY_DESCRIPTIONS: Record<DietaryTag, string> = {
  vegetarian: 'Pas de viande ni poisson',
  vegan: 'Aucun produit animal',
  'gluten-free': 'Sans blé, seigle, orge',
  'dairy-free': 'Sans lait ni fromage',
  halal: 'Viande certifiée halal',
  healthy: 'Recettes équilibrées et peu transformées',
  'high-protein': 'Riches en viande, poisson, œufs ou légumineuses',
  'crohn-friendly': 'Légumes cuits, fibres douces, faciles à digérer',
};

export const CATEGORY_EMOJIS: Record<ShoppingCategory, string> = {
  'Fruits & Légumes': '🥕',
  Viandes: '🥩',
  Poissons: '🐟',
  'Produits laitiers & Œufs': '🧀',
  Boulangerie: '🥖',
  Épicerie: '🧴',
};
