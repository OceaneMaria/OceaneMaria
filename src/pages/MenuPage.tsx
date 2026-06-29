import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WEEK_DAYS, WeekDay, MealType, MEAL_EMOJIS, MEAL_LABELS } from '../types';
import RecipePickerModal from '../components/RecipePickerModal';
import { STORES } from '../data/stores';

const DAY_SHORTS: Record<WeekDay, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
};

function getTodayDay(): WeekDay | null {
  const map: (WeekDay | null)[] = [null, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  return map[new Date().getDay()] ?? null;
}

export default function MenuPage() {
  const { weekMenu, setMeal, clearMeal, preferences, allRecipes } = useApp();
  const [selectedDay, setSelectedDay] = useState<WeekDay>(getTodayDay() ?? 'lundi');
  const [picker, setPicker] = useState<{ mealType: MealType } | null>(null);
  const store = STORES.find(s => s.id === preferences.storeId) ?? STORES[0];
  const todayDay = getTodayDay();

  function handleSelect(recipeId: string) {
    if (!picker) return;
    setMeal(selectedDay, picker.mealType, recipeId);
    setPicker(null);
  }

  function recipeCost(recipeId: string): number {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return 0;
    const scale = preferences.servings / recipe.servings;
    return recipe.ingredients.reduce((s, i) => s + i.pricePerUnit * i.quantity * scale * store.priceMultiplier, 0);
  }

  const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white">
        <h1 className="text-xl font-bold">Menu de la semaine</h1>
        <p className="text-green-200 text-sm mt-0.5">
          Magasin : {store.name} — {preferences.servings} pers.
        </p>
      </div>

      {/* Day tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {WEEK_DAYS.map((day) => {
            const isToday = day === todayDay;
            const isSelected = day === selectedDay;
            const meals = Object.values(weekMenu[day]).filter(Boolean).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 flex flex-col items-center py-3 px-3 relative ${
                  isSelected ? 'text-green-600' : 'text-slate-500'
                }`}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-green-600' : ''}`}>
                  {DAY_SHORTS[day]}
                </span>
                <span
                  className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-green-600 text-white' : isToday ? 'bg-green-100 text-green-700' : 'text-slate-400'
                  }`}
                >
                  {meals}/3
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal slots */}
      <div className="px-4 py-4 space-y-3">
        {MEAL_TYPES.map((mealType) => {
          const recipeId = weekMenu[selectedDay][mealType];
          const recipe = recipeId ? allRecipes.find(r => r.id === recipeId) : null;

          return (
            <div key={mealType} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span>{MEAL_EMOJIS[mealType]}</span>
                <span className="text-sm font-semibold text-slate-600">{MEAL_LABELS[mealType]}</span>
              </div>

              {recipe ? (
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-3xl">{recipe.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{recipe.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ⏱ {recipe.prepTime + recipe.cookTime} min
                      {' · '}
                      <span className="font-semibold text-green-700">
                        {recipeCost(recipeId!).toFixed(2)} €
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPicker({ mealType })}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm"
                      title="Changer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => clearMeal(selectedDay, mealType)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 text-sm"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPicker({ mealType })}
                  className="w-full px-4 py-5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="text-xl">+</span>
                  <span className="text-sm font-medium">Choisir une recette</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {picker && (
        <RecipePickerModal
          mealType={picker.mealType}
          onSelect={handleSelect}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
