import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildGeneratedMenu, buildFilledMenu, pickOneMeal } from '../context/AppContext';
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
  const { weekMenu, setMeal, clearMeal, setMenu, preferences, allRecipes } = useApp();
  const [confirmGenerate, setConfirmGenerate] = useState(false);

  function handleGenerate(replaceAll: boolean) {
    const menu = replaceAll
      ? buildGeneratedMenu(allRecipes, preferences)
      : buildFilledMenu(allRecipes, preferences, weekMenu);
    setMenu(menu);
    setConfirmGenerate(false);
  }

  function handleRegenerateSlot(day: WeekDay, mealType: MealType, currentId?: string) {
    const newId = pickOneMeal(allRecipes, preferences, mealType, weekMenu, currentId);
    if (newId) setMeal(day, mealType, newId);
  }

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

  const MEAL_TYPES = (preferences.activeMeals ?? ['breakfast', 'lunch', 'dinner']) as MealType[];

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="safe-area-pt px-5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Menu</h1>
          <p className="text-stone-400 text-sm mt-0.5">{store.name} · {preferences.servings} pers.</p>
        </div>
        <button
          onClick={() => setConfirmGenerate(true)}
          className="flex items-center gap-1.5 bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl"
        >
          ✨ Générer
        </button>
      </div>

      {/* Confirm generate modal */}
      {confirmGenerate && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end">
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-6 pb-10 space-y-4">
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto" />
            <h3 className="font-bold text-stone-900 text-lg">Générer le menu</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleGenerate(false)}
                className="w-full flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left active:scale-[0.98] transition-all"
              >
                <span className="text-2xl mt-0.5">✨</span>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">Compléter le menu</p>
                  <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">Remplit uniquement les cases vides — conserve les recettes déjà planifiées.</p>
                </div>
              </button>
              <button
                onClick={() => handleGenerate(true)}
                className="w-full flex items-start gap-4 p-4 bg-stone-50 border border-stone-200 rounded-2xl text-left active:scale-[0.98] transition-all"
              >
                <span className="text-2xl mt-0.5">🔄</span>
                <div>
                  <p className="font-bold text-stone-800 text-sm">Tout regénérer</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">Remplace toutes les recettes, y compris celles déjà planifiées.</p>
                </div>
              </button>
            </div>
            <button onClick={() => setConfirmGenerate(false)} className="w-full py-3 text-stone-400 text-sm font-medium">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {WEEK_DAYS.map((day) => {
            const isToday = day === todayDay;
            const isSelected = day === selectedDay;
            const meals = Object.values(weekMenu[day]).filter(Boolean).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 flex flex-col items-center py-3 px-3 relative transition-colors ${
                  isSelected ? 'text-emerald-700' : 'text-stone-400'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isToday ? 'text-emerald-600' : ''}`}>
                  {DAY_SHORTS[day]}
                </span>
                <span
                  className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : isToday
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-stone-400'
                  }`}
                >
                  {meals}/{MEAL_TYPES.length}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-t" />
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
            <div key={mealType} className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
                <span className="text-base">{MEAL_EMOJIS[mealType]}</span>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{MEAL_LABELS[mealType]}</span>
              </div>

              {recipe ? (
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <span className="text-3xl">{recipe.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{recipe.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      ⏱ {recipe.prepTime + recipe.cookTime} min
                      {recipeCost(recipeId!) > 0 && (
                        <>
                          {' · '}
                          <span className="font-semibold text-emerald-700">
                            {recipeCost(recipeId!).toFixed(2)} €
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegenerateSlot(selectedDay, mealType, recipeId ?? undefined)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-sm"
                      title="Regénérer"
                    >
                      🔀
                    </button>
                    <button
                      onClick={() => setPicker({ mealType })}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 text-sm"
                      title="Choisir"
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
                  className="w-full px-4 py-5 flex items-center justify-center gap-2 text-stone-400 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                >
                  <span className="text-xl text-stone-300">+</span>
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
