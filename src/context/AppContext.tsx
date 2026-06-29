import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import {
  WeekMenu,
  WeekDay,
  MealType,
  UserPreferences,
  ShoppingItem,
  ShoppingCategory,
  Recipe,
  WEEK_DAYS,
  MEAL_TYPES,
} from '../types';
import { RECIPES } from '../data/recipes';
import { STORES } from '../data/stores';

const EMPTY_DAY = { breakfast: undefined, lunch: undefined, dinner: undefined };

const DEFAULT_MENU: WeekMenu = {
  lundi: { ...EMPTY_DAY },
  mardi: { ...EMPTY_DAY },
  mercredi: { ...EMPTY_DAY },
  jeudi: { ...EMPTY_DAY },
  vendredi: { ...EMPTY_DAY },
  samedi: { ...EMPTY_DAY },
  dimanche: { ...EMPTY_DAY },
};

const DEFAULT_PREFS: UserPreferences = {
  dietaryTags: [],
  storeId: 'leclerc',
  weeklyBudget: 150,
  servings: 4,
};

interface AppState {
  weekMenu: WeekMenu;
  preferences: UserPreferences;
  customRecipes: Recipe[];
}

type Action =
  | { type: 'SET_MEAL'; day: WeekDay; mealType: MealType; recipeId: string }
  | { type: 'CLEAR_MEAL'; day: WeekDay; mealType: MealType }
  | { type: 'SET_PREFERENCES'; preferences: UserPreferences }
  | { type: 'RESET_MENU' }
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'DELETE_RECIPE'; recipeId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MEAL':
      return {
        ...state,
        weekMenu: {
          ...state.weekMenu,
          [action.day]: { ...state.weekMenu[action.day], [action.mealType]: action.recipeId },
        },
      };
    case 'CLEAR_MEAL':
      return {
        ...state,
        weekMenu: {
          ...state.weekMenu,
          [action.day]: { ...state.weekMenu[action.day], [action.mealType]: undefined },
        },
      };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.preferences };
    case 'RESET_MENU':
      return { ...state, weekMenu: DEFAULT_MENU };
    case 'ADD_RECIPE':
      return { ...state, customRecipes: [...state.customRecipes, action.recipe] };
    case 'DELETE_RECIPE':
      return { ...state, customRecipes: state.customRecipes.filter(r => r.id !== action.recipeId) };
    default:
      return state;
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem('menuCoursesApp');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        weekMenu: parsed.weekMenu ?? DEFAULT_MENU,
        preferences: parsed.preferences ?? DEFAULT_PREFS,
        customRecipes: parsed.customRecipes ?? [],
      };
    }
  } catch {
    // ignore
  }
  return { weekMenu: DEFAULT_MENU, preferences: DEFAULT_PREFS, customRecipes: [] };
}

interface AppContextValue {
  weekMenu: WeekMenu;
  preferences: UserPreferences;
  customRecipes: Recipe[];
  allRecipes: Recipe[];
  shoppingList: ShoppingItem[];
  totalCost: number;
  plannedMeals: number;
  setMeal: (day: WeekDay, mealType: MealType, recipeId: string) => void;
  clearMeal: (day: WeekDay, mealType: MealType) => void;
  setPreferences: (prefs: UserPreferences) => void;
  resetMenu: () => void;
  addRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem('menuCoursesApp', JSON.stringify(state));
  }, [state]);

  const allRecipes = useMemo(
    () => [...RECIPES, ...state.customRecipes],
    [state.customRecipes]
  );

  const store = useMemo(
    () => STORES.find(s => s.id === state.preferences.storeId) ?? STORES[0],
    [state.preferences.storeId]
  );

  const { shoppingList, totalCost, plannedMeals } = useMemo(() => {
    const itemMap = new Map<string, ShoppingItem>();
    let meals = 0;

    for (const day of WEEK_DAYS) {
      for (const mealType of MEAL_TYPES) {
        const recipeId = state.weekMenu[day][mealType];
        if (!recipeId) continue;
        meals++;

        const recipe = allRecipes.find(r => r.id === recipeId);
        if (!recipe) continue;

        const scale = state.preferences.servings / recipe.servings;

        for (const ing of recipe.ingredients) {
          const key = `${ing.name}__${ing.unit}`;
          const scaledQty = ing.quantity * scale;
          const scaledPrice = ing.pricePerUnit * ing.quantity * scale * store.priceMultiplier;

          const existing = itemMap.get(key);
          if (existing) {
            existing.totalQuantity += scaledQty;
            existing.totalPrice += scaledPrice;
            if (!existing.fromRecipes.includes(recipe.name)) {
              existing.fromRecipes.push(recipe.name);
            }
          } else {
            itemMap.set(key, {
              name: ing.name,
              totalQuantity: scaledQty,
              unit: ing.unit,
              category: ing.category,
              totalPrice: scaledPrice,
              fromRecipes: [recipe.name],
            });
          }
        }
      }
    }

    const list = Array.from(itemMap.values());
    const CATEGORY_ORDER: ShoppingCategory[] = [
      'Fruits & Légumes',
      'Viandes',
      'Poissons',
      'Produits laitiers & Œufs',
      'Boulangerie',
      'Épicerie',
    ];
    list.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.category);
      const ib = CATEGORY_ORDER.indexOf(b.category);
      if (ia !== ib) return ia - ib;
      return a.name.localeCompare(b.name);
    });

    const total = list.reduce((sum, i) => sum + i.totalPrice, 0);
    return { shoppingList: list, totalCost: total, plannedMeals: meals };
  }, [state.weekMenu, state.preferences.servings, store, allRecipes]);

  const value: AppContextValue = {
    weekMenu: state.weekMenu,
    preferences: state.preferences,
    customRecipes: state.customRecipes,
    allRecipes,
    shoppingList,
    totalCost,
    plannedMeals,
    setMeal: (day, mealType, recipeId) => dispatch({ type: 'SET_MEAL', day, mealType, recipeId }),
    clearMeal: (day, mealType) => dispatch({ type: 'CLEAR_MEAL', day, mealType }),
    setPreferences: (preferences) => dispatch({ type: 'SET_PREFERENCES', preferences }),
    resetMenu: () => dispatch({ type: 'RESET_MENU' }),
    addRecipe: (recipe) => dispatch({ type: 'ADD_RECIPE', recipe }),
    deleteRecipe: (recipeId) => dispatch({ type: 'DELETE_RECIPE', recipeId }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
