import { useState, useMemo } from 'react';
import { Recipe, MealType, DietaryTag, MEAL_LABELS, DIETARY_LABELS, DIETARY_EMOJIS } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  mealType: MealType;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

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

  const tagColors: Record<DietaryTag, string> = {
    vegetarian: 'bg-green-100 text-green-700',
    vegan: 'bg-emerald-100 text-emerald-700',
    'gluten-free': 'bg-amber-100 text-amber-700',
    'dairy-free': 'bg-blue-100 text-blue-700',
    halal: 'bg-purple-100 text-purple-700',
    healthy: 'bg-lime-100 text-lime-700',
    'high-protein': 'bg-orange-100 text-orange-700',
    'crohn-friendly': 'bg-sky-100 text-sky-700',
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/50" onClick={onClose}>
      <div
        className="mt-auto bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="px-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">
              Choisir — {MEAL_LABELS[mealType]}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              ✕
            </button>
          </div>

          <input
            type="search"
            placeholder="Rechercher une recette…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-green-400"
            autoFocus
          />

          {preferences.dietaryTags.length > 0 && (
            <button
              onClick={() => setFilterByPrefs(!filterByPrefs)}
              className={`mt-2 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filterByPrefs ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {filterByPrefs ? '✓ Filtrées selon vos préférences' : 'Afficher toutes les recettes'}
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
              <span className="text-4xl">🍽️</span>
              <p className="text-sm">Aucune recette trouvée</p>
              {filterByPrefs && (
                <button
                  onClick={() => setFilterByPrefs(false)}
                  className="text-green-600 text-sm underline"
                >
                  Afficher toutes les recettes
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((recipe) => (
                <li key={recipe.id}>
                  <button
                    onClick={() => onSelect(recipe.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span className="text-3xl">{recipe.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-800 leading-tight">{recipe.name}</p>
                          {recipe.isCustom && <span className="text-xs text-green-600">✏️</span>}
                        </div>
                        {recipePrice(recipe) > 0 && (
                          <span className="shrink-0 text-sm font-bold text-green-700">
                            ~{recipePrice(recipe).toFixed(2)} €
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{recipe.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-xs text-slate-400">⏱ {recipe.prepTime + recipe.cookTime} min</span>
                        <span className="text-xs text-slate-400">· {recipe.servings} pers.</span>
                        {recipe.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-1.5 py-0.5 rounded-full ${tagColors[tag]}`}
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
