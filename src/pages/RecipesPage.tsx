import { useState, useMemo } from 'react';
import { Recipe, MealType, DietaryTag, DIETARY_LABELS, DIETARY_EMOJIS, MEAL_LABELS, MEAL_EMOJIS } from '../types';
import { RECIPES } from '../data/recipes';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/stores';

const TAG_COLORS: Record<DietaryTag, string> = {
  vegetarian: 'bg-green-100 text-green-700',
  vegan: 'bg-emerald-100 text-emerald-700',
  'gluten-free': 'bg-amber-100 text-amber-700',
  'dairy-free': 'bg-blue-100 text-blue-700',
  halal: 'bg-purple-100 text-purple-700',
};

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  storeMult: number;
  servings: number;
}

function RecipeDetailModal({ recipe, onClose, storeMult, servings }: RecipeDetailModalProps) {
  const scale = servings / recipe.servings;
  const totalCost = recipe.ingredients.reduce((s, i) => s + i.pricePerUnit * i.quantity * scale * storeMult, 0);

  function fmtQty(qty: number, unit: string): string {
    const scaled = qty * scale;
    if (unit === 'g' && scaled >= 1000) return `${(scaled / 1000).toFixed(1)} kg`;
    if (unit === 'ml' && scaled >= 1000) return `${(scaled / 1000).toFixed(1)} L`;
    return `${parseFloat(scaled.toFixed(1))} ${unit}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={onClose}>
      <div className="mt-auto bg-white rounded-t-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-300 rounded-full" /></div>

        <div className="overflow-y-auto flex-1 px-4 pb-8">
          <div className="text-center py-4">
            <div className="text-6xl mb-2">{recipe.emoji}</div>
            <h2 className="text-xl font-bold text-slate-800">{recipe.name}</h2>
            <p className="text-slate-500 text-sm mt-1">{recipe.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Préparation</p>
              <p className="font-bold text-slate-800">{recipe.prepTime} min</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Cuisson</p>
              <p className="font-bold text-slate-800">{recipe.cookTime} min</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">Coût estimé</p>
              <p className="font-bold text-green-700">{totalCost.toFixed(2)} €</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {recipe.dietaryTags.map(tag => (
              <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${TAG_COLORS[tag]}`}>
                {DIETARY_EMOJIS[tag]} {DIETARY_LABELS[tag]}
              </span>
            ))}
          </div>

          <h3 className="font-bold text-slate-700 mb-2">
            Ingrédients <span className="text-sm font-normal text-slate-400">({servings} pers.)</span>
          </h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.name} className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-700">{ing.name}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-700">{fmtQty(ing.quantity, ing.unit)}</span>
                  <span className="text-xs text-slate-400 block">
                    {(ing.pricePerUnit * ing.quantity * scale * storeMult).toFixed(2)} €
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const { preferences } = useApp();
  const store = STORES.find(s => s.id === preferences.storeId) ?? STORES[0];
  const [search, setSearch] = useState('');
  const [mealFilter, setMealFilter] = useState<MealType | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<DietaryTag | null>(null);
  const [detail, setDetail] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    return RECIPES.filter(r => {
      if (mealFilter !== 'all' && r.mealType !== mealFilter) return false;
      if (tagFilter && !r.dietaryTags.includes(tagFilter)) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [mealFilter, tagFilter, search]);

  const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
  const DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white">
        <h1 className="text-xl font-bold">Recettes</h1>
        <p className="text-green-200 text-sm mt-0.5">{RECIPES.length} recettes disponibles</p>
      </div>

      {/* Search + filters */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-10 px-4 py-3 space-y-2">
        <input
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-800 placeholder-slate-400 text-sm outline-none"
        />

        {/* Meal type filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setMealFilter('all')}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${mealFilter === 'all' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Tous
          </button>
          {MEAL_TYPES.map(mt => (
            <button
              key={mt}
              onClick={() => setMealFilter(mealFilter === mt ? 'all' : mt)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${mealFilter === mt ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {MEAL_EMOJIS[mt]} {MEAL_LABELS[mt]}
            </button>
          ))}
        </div>

        {/* Dietary filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {DIETARY_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${tagFilter === tag ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {DIETARY_EMOJIS[tag]} {DIETARY_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
          <span className="text-4xl">🔍</span>
          <p className="text-sm">Aucune recette trouvée</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          {filtered.map((recipe) => {
            const cost = recipe.ingredients.reduce(
              (s, i) => s + i.pricePerUnit * i.quantity * (preferences.servings / recipe.servings) * store.priceMultiplier, 0
            );
            return (
              <button
                key={recipe.id}
                onClick={() => setDetail(recipe)}
                className="bg-white rounded-2xl shadow-sm p-3 text-left flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all"
              >
                <span className="text-4xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{recipe.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {MEAL_EMOJIS[recipe.mealType]} {MEAL_LABELS[recipe.mealType]}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-400">⏱ {recipe.prepTime + recipe.cookTime} min</span>
                  <span className="text-xs font-bold text-green-700">{cost.toFixed(2)} €</span>
                </div>
                {recipe.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.dietaryTags.slice(0, 2).map(tag => (
                      <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag]}`}>
                        {DIETARY_EMOJIS[tag]}
                      </span>
                    ))}
                    {recipe.dietaryTags.length > 2 && (
                      <span className="text-xs text-slate-400">+{recipe.dietaryTags.length - 2}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {detail && (
        <RecipeDetailModal
          recipe={detail}
          onClose={() => setDetail(null)}
          storeMult={store.priceMultiplier}
          servings={preferences.servings}
        />
      )}
    </div>
  );
}
