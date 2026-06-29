import { useState, useMemo } from 'react';
import { Recipe, MealType, DietaryTag, MEAL_LABELS, DIETARY_LABELS, DIETARY_EMOJIS } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  mealType: MealType;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

const TAG_COLORS: Record<DietaryTag, string> = {
  vegetarian: 'bg-green-100 text-green-700',
  vegan: 'bg-emerald-100 text-emerald-700',
  'gluten-free': 'bg-amber-100 text-amber-700',
  'dairy-free': 'bg-blue-100 text-blue-700',
  halal: 'bg-purple-100 text-purple-700',
  healthy: 'bg-lime-100 text-lime-700',
  'high-protein': 'bg-orange-100 text-orange-700',
  'crohn-friendly': 'bg-sky-100 text-sky-700',
};

export default function RecipePickerModal({ mealType, onSelect, onClose }: Props) {
  const { preferences, allRecipes } = useApp();
  const [search, setSearch] = useState('');
  const [filterByPrefs, setFilterByPrefs] = useState(preferences.dietaryTags.length > 0);

  const filtered = useMemo(() => {
    return allRecipes.filter((r) => {
      if (r.mealType !== mealType) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterByPrefs && preferences.dietaryTags.length > 0) {
        if (!preferences.dietaryTags.every((tag) => r.dietaryTags.includes(tag))) return false;
      }
      if (preferences.excludedFoods.length > 0) {
        const haystack = [r.name, ...r.ingredients.map(i => i.name)].join(' ').toLowerCase();
        if (preferences.excludedFoods.some(food => haystack.includes(food.toLowerCase()))) return false;
      }
      return true;
    });
  }, [mealType, search, filterByPrefs, preferences.dietaryTags, preferences.excludedFoods, allRecipes]);

  function recipePrice(recipe: Recipe): number {
    return recipe.ingredients.reduce((sum, ing) => sum + ing.pricePerUnit * ing.quantity, 0);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mt-auto bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-stone-900">
              Choisir — {MEAL_LABELS[mealType]}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 text-sm"
            >
              ✕
            </button>
          </div>

          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-800 placeholder-stone-400 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
            autoFocus
          />

          {preferences.dietaryTags.length > 0 && (
            <button
              onClick={() => setFilterByPrefs(!filterByPrefs)}
              className={`mt-2.5 text-xs px-4 py-1.5 rounded-full font-semibold transition-colors ${
                filterByPrefs
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {filterByPrefs ? '✓ Filtrées selon vos préférences' : 'Afficher toutes les recettes'}
            </button>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-stone-400 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl">🍽️</div>
              <p className="text-sm">Aucune recette trouvée</p>
              {filterByPrefs && (
                <button
                  onClick={() => setFilterByPrefs(false)}
                  className="text-emerald-600 text-sm underline"
                >
                  Afficher toutes les recettes
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {filtered.map((recipe) => (
                <li key={recipe.id}>
                  <button
                    onClick={() => onSelect(recipe.id)}
                    className="w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-stone-50 active:bg-stone-100 transition-colors"
                  >
                    <span className="text-3xl">{recipe.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-stone-900 leading-snug text-sm">{recipe.name}</p>
                          {recipe.isCustom && <span className="text-xs text-emerald-600">✏️</span>}
                        </div>
                        {recipePrice(recipe) > 0 && (
                          <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {recipePrice(recipe).toFixed(2)} €
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{recipe.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                        <span className="text-xs text-stone-400">⏱ {recipe.prepTime + recipe.cookTime} min</span>
                        <span className="text-xs text-stone-300">·</span>
                        <span className="text-xs text-stone-400">{recipe.servings} pers.</span>
                        {recipe.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag]}`}
                          >
                            {DIETARY_EMOJIS[tag]} {DIETARY_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
