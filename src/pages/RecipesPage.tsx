import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe, MealType, DietaryTag, TimeFilter, DIETARY_LABELS, DIETARY_EMOJIS, MEAL_LABELS, MEAL_EMOJIS } from '../types';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/stores';

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

function totalTime(r: Recipe) { return r.prepTime + r.cookTime; }

function timeLabel(r: Recipe): string {
  const t = totalTime(r);
  if (t <= 20) return '⚡';
  if (t <= 45) return '🕐';
  return '🍲';
}

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  storeMult: number;
  servings: number;
  onDelete?: () => void;
  onNameChange: (name: string) => void;
}

function RecipeDetailModal({ recipe, onClose, storeMult, servings, onDelete, onNameChange }: RecipeDetailModalProps) {
  const scale = servings / recipe.servings;
  const totalCost = recipe.ingredients.reduce((s, i) => s + i.pricePerUnit * i.quantity * scale * storeMult, 0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(recipe.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== recipe.name) onNameChange(trimmed);
    setEditingName(false);
  }

  function fmtQty(qty: number, unit: string): string {
    const scaled = qty * scale;
    if (unit === 'g' && scaled >= 1000) return `${(scaled / 1000).toFixed(1)} kg`;
    if (unit === 'ml' && scaled >= 1000) return `${(scaled / 1000).toFixed(1)} L`;
    return `${parseFloat(scaled.toFixed(1))} ${unit}`;
  }

  const t = totalTime(recipe);
  const isInstagram = !!recipe.sourceUrl?.includes('instagram.com');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/50" onClick={onClose}>
      <div className="mt-auto bg-white rounded-t-2xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 shrink-0"><div className="w-10 h-1 bg-slate-300 rounded-full" /></div>

        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-10">
          {/* Header */}
          <div className="text-center py-4">
            <div className="text-6xl mb-3">{recipe.emoji}</div>

            {editingName ? (
              <div className="flex items-center gap-2 mx-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
                <button onClick={saveName} className="px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-xl">✓</button>
                <button onClick={() => setEditingName(false)} className="px-3 py-2 bg-slate-200 text-slate-600 text-sm rounded-xl">✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 px-2">
                <h2 className="text-xl font-bold text-slate-800 leading-snug">{recipe.name}</h2>
                <button
                  onClick={() => { setNameInput(recipe.name); setEditingName(true); }}
                  className="shrink-0 text-slate-300 hover:text-slate-500 text-base"
                  title="Renommer"
                >
                  ✏️
                </button>
              </div>
            )}

            {recipe.isCustom && (
              <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                Recette personnalisée
              </span>
            )}
            {recipe.description && (
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{recipe.description}</p>
            )}
          </div>

          {/* Instagram / source link */}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-4 ${
                isInstagram
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <span className="text-2xl">{isInstagram ? '📱' : '🔗'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isInstagram ? 'text-purple-600' : 'text-blue-600'}`}>
                  {isInstagram ? 'Voir la vidéo Instagram' : 'Recette originale'}
                </p>
                <p className={`text-xs truncate mt-0.5 ${isInstagram ? 'text-purple-400' : 'text-blue-400'}`}>
                  {recipe.sourceUrl}
                </p>
              </div>
              <span className={`text-lg font-bold ${isInstagram ? 'text-purple-400' : 'text-blue-400'}`}>→</span>
            </a>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <p className="text-xs text-slate-500">Prép.</p>
              <p className="font-bold text-slate-800 text-sm">{recipe.prepTime} min</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <p className="text-xs text-slate-500">Cuisson</p>
              <p className="font-bold text-slate-800 text-sm">{recipe.cookTime} min</p>
            </div>
            <div className={`rounded-xl p-2 text-center ${t <= 20 ? 'bg-green-50' : t <= 45 ? 'bg-amber-50' : 'bg-orange-50'}`}>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-bold text-slate-800 text-sm">{timeLabel(recipe)} {t} min</p>
            </div>
            <div className="bg-green-50 rounded-xl p-2 text-center">
              <p className="text-xs text-slate-500">Coût</p>
              <p className="font-bold text-green-700 text-sm">{totalCost.toFixed(2)} €</p>
            </div>
          </div>

          {/* Dietary tags */}
          {recipe.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {recipe.dietaryTags.map(tag => (
                <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${TAG_COLORS[tag]}`}>
                  {DIETARY_EMOJIS[tag]} {DIETARY_LABELS[tag]}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          {recipe.ingredients.length > 0 ? (
            <>
              <h3 className="font-bold text-slate-700 mb-2">
                Ingrédients <span className="text-sm font-normal text-slate-400">({servings} pers.)</span>
              </h3>
              <ul className="space-y-1 mb-4">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={`${ing.name}-${idx}`} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-700">{ing.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-700">{fmtQty(ing.quantity, ing.unit)}</span>
                      {ing.pricePerUnit > 0 && (
                        <span className="text-xs text-slate-400 block">
                          {(ing.pricePerUnit * ing.quantity * scale * storeMult).toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-amber-700">
                Aucun ingrédient renseigné — cette recette n'apparaîtra pas dans la liste de courses.
                {recipe.sourceUrl && ' Consultez la vidéo pour les détails.'}
              </p>
            </div>
          )}

          {/* Delete */}
          {recipe.isCustom && onDelete && (
            <div className="border-t border-slate-100 pt-4">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-500 underline">
                  Supprimer cette recette
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { onDelete(); onClose(); }} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold rounded-xl">
                    Confirmer
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl">
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const navigate = useNavigate();
  const { preferences, allRecipes, deleteRecipe, setNameOverride } = useApp();
  const store = STORES.find(s => s.id === preferences.storeId) ?? STORES[0];
  const [search, setSearch] = useState('');
  const [mealFilter, setMealFilter] = useState<MealType | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<DietaryTag | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [detail, setDetail] = useState<Recipe | null>(null);

  const isExcluded = useMemo(() => {
    if (preferences.excludedFoods.length === 0) return new Set<string>();
    const excluded = new Set<string>();
    for (const r of allRecipes) {
      const haystack = [r.name, ...r.ingredients.map(i => i.name)].join(' ').toLowerCase();
      if (preferences.excludedFoods.some(food => haystack.includes(food.toLowerCase()))) {
        excluded.add(r.id);
      }
    }
    return excluded;
  }, [allRecipes, preferences.excludedFoods]);

  const filtered = useMemo(() => {
    return allRecipes.filter(r => {
      if (mealFilter !== 'all' && r.mealType !== mealFilter) return false;
      if (tagFilter && !r.dietaryTags.includes(tagFilter)) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      const t = totalTime(r);
      if (timeFilter === 'quick' && t > 20) return false;
      if (timeFilter === 'medium' && (t <= 20 || t > 45)) return false;
      if (timeFilter === 'long' && t <= 45) return false;
      return true;
    });
  }, [allRecipes, mealFilter, tagFilter, search, timeFilter]);

  const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
  const DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];
  const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'quick', label: '⚡ <20 min' },
    { value: 'medium', label: '🕐 20–45 min' },
    { value: 'long', label: '🍲 >45 min' },
  ];

  const customCount = allRecipes.filter(r => r.isCustom).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Recettes</h1>
          <p className="text-green-200 text-sm mt-0.5">
            {allRecipes.length} recettes
            {customCount > 0 && ` · ${customCount} personnalisée${customCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/import')}
            className="bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-xl"
          >
            📥 Notion
          </button>
        </div>
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

        {/* Time filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TIME_FILTERS.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeFilter(timeFilter === tf.value ? 'all' : tf.value)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${timeFilter === tf.value ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Meal type filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setMealFilter('all')}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${mealFilter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Tous repas
          </button>
          {MEAL_TYPES.map(mt => (
            <button
              key={mt}
              onClick={() => setMealFilter(mealFilter === mt ? 'all' : mt)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium ${mealFilter === mt ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'}`}
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
            const t = totalTime(recipe);
            return (
              <button
                key={recipe.id}
                onClick={() => setDetail(recipe)}
                className={`bg-white rounded-2xl shadow-sm p-3 text-left flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all relative ${isExcluded.has(recipe.id) ? 'opacity-50' : ''}`}
              >
                {isExcluded.has(recipe.id) && (
                  <span className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                    🚫
                  </span>
                )}
                {recipe.isCustom && !isExcluded.has(recipe.id) && (
                  <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                    ✏️
                  </span>
                )}
                {recipe.sourceUrl && !recipe.isCustom && !isExcluded.has(recipe.id) && (
                  <span className="absolute top-2 right-2 text-xs">🔗</span>
                )}
                <span className="text-4xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{recipe.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {MEAL_EMOJIS[recipe.mealType]} {MEAL_LABELS[recipe.mealType]}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs font-medium ${t <= 20 ? 'text-green-600' : t <= 45 ? 'text-amber-600' : 'text-orange-600'}`}>
                    {timeLabel(recipe)} {t} min
                  </span>
                  {cost > 0 && (
                    <span className="text-xs font-bold text-slate-700">{cost.toFixed(2)} €</span>
                  )}
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

      {/* Floating add button */}
      <button
        onClick={() => navigate('/recettes/ajouter')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 active:scale-95 transition-all"
        title="Ajouter une recette"
      >
        +
      </button>

      {detail && (
        <RecipeDetailModal
          recipe={detail}
          onClose={() => setDetail(null)}
          storeMult={store.priceMultiplier}
          servings={preferences.servings}
          onDelete={detail.isCustom ? () => deleteRecipe(detail.id) : undefined}
          onNameChange={(name) => setNameOverride(detail.id, name)}
        />
      )}
    </div>
  );
}
