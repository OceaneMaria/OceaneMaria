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
    return `${parseFloat(scaled.toFixed(1))}${unit ? ' ' + unit : ''}`;
  }

  const t = totalTime(recipe);
  const isInstagram = !!recipe.sourceUrl?.includes('instagram.com');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mt-auto bg-white rounded-t-3xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-10">
          {/* Header */}
          <div className="text-center py-5">
            <div className="text-6xl mb-3">{recipe.emoji}</div>

            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="flex-1 px-3 py-2 rounded-2xl bg-stone-100 text-stone-900 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button onClick={saveName} className="px-3 py-2 bg-emerald-700 text-white text-sm font-bold rounded-2xl">✓</button>
                <button onClick={() => setEditingName(false)} className="px-3 py-2 bg-stone-100 text-stone-500 text-sm rounded-2xl">✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 leading-snug">{recipe.name}</h2>
                <button
                  onClick={() => { setNameInput(recipe.name); setEditingName(true); }}
                  className="shrink-0 text-stone-300 hover:text-stone-500 text-sm"
                  title="Renommer"
                >
                  ✏️
                </button>
              </div>
            )}

            {recipe.isCustom && (
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
                Recette personnalisée
              </span>
            )}
            {recipe.description && (
              <p className="text-stone-500 text-sm mt-2 leading-relaxed">{recipe.description}</p>
            )}
          </div>

          {/* Instagram / source link */}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 ${
                isInstagram
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                  : 'bg-stone-50 border border-stone-200'
              }`}
            >
              <span className="text-2xl">{isInstagram ? '📱' : '🔗'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isInstagram ? 'text-purple-600' : 'text-stone-600'}`}>
                  {isInstagram ? 'Voir la vidéo Instagram' : 'Recette originale'}
                </p>
                <p className={`text-xs truncate mt-0.5 ${isInstagram ? 'text-purple-400' : 'text-stone-400'}`}>
                  {recipe.sourceUrl}
                </p>
              </div>
              <span className={`text-base font-bold ${isInstagram ? 'text-purple-400' : 'text-stone-400'}`}>→</span>
            </a>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-stone-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-stone-400">Prép.</p>
              <p className="font-bold text-stone-800 text-sm mt-0.5">{recipe.prepTime} min</p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-stone-400">Cuisson</p>
              <p className="font-bold text-stone-800 text-sm mt-0.5">{recipe.cookTime} min</p>
            </div>
            <div className={`rounded-2xl p-3 text-center ${t <= 20 ? 'bg-emerald-50' : t <= 45 ? 'bg-amber-50' : 'bg-orange-50'}`}>
              <p className="text-xs text-stone-400">Total</p>
              <p className="font-bold text-stone-800 text-sm mt-0.5">{timeLabel(recipe)} {t} min</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-stone-400">Coût</p>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">{totalCost.toFixed(2)} €</p>
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
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                Ingrédients <span className="font-normal normal-case">({servings} pers.)</span>
              </h3>
              <ul className="space-y-1 mb-4">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={`${ing.name}-${idx}`} className="flex items-center justify-between py-2.5 border-b border-stone-100">
                    <span className="text-sm text-stone-700">{ing.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-stone-800">{fmtQty(ing.quantity, ing.unit)}</span>
                      {ing.pricePerUnit > 0 && (
                        <span className="text-xs text-stone-400 block">
                          {(ing.pricePerUnit * ing.quantity * scale * storeMult).toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <p className="text-sm text-amber-700 leading-relaxed">
                Aucun ingrédient renseigné — cette recette n'apparaîtra pas dans la liste de courses.
                {recipe.sourceUrl && ' Consultez la vidéo pour les détails.'}
              </p>
            </div>
          )}

          {/* Delete */}
          {recipe.isCustom && onDelete && (
            <div className="border-t border-stone-100 pt-4">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="text-sm text-red-400 underline">
                  Supprimer cette recette
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { onDelete(); onClose(); }} className="flex-1 py-3 bg-red-500 text-white text-sm font-bold rounded-2xl">
                    Confirmer
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 text-sm font-bold rounded-2xl">
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
    <div className="pb-28">
      {/* Header */}
      <div className="safe-area-pt px-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Recettes</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {allRecipes.length} recettes
            {customCount > 0 && ` · ${customCount} perso`}
          </p>
        </div>
        <button
          onClick={() => navigate('/import')}
          className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-sm font-semibold px-4 py-2.5 rounded-2xl border border-stone-200"
        >
          📥 Import
        </button>
      </div>

      {/* Search + filters */}
      <div className="sticky top-0 bg-stone-100/90 backdrop-blur-md border-b border-stone-200 z-10 px-4 py-3 space-y-2">
        <input
          type="search"
          placeholder="Rechercher une recette…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 placeholder-stone-400 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TIME_FILTERS.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeFilter(timeFilter === tf.value ? 'all' : tf.value)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                timeFilter === tf.value ? 'bg-emerald-700 text-white' : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setMealFilter('all')}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              mealFilter === 'all' ? 'bg-stone-700 text-white' : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            Tous repas
          </button>
          {MEAL_TYPES.map(mt => (
            <button
              key={mt}
              onClick={() => setMealFilter(mealFilter === mt ? 'all' : mt)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                mealFilter === mt ? 'bg-stone-700 text-white' : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {MEAL_EMOJIS[mt]} {MEAL_LABELS[mt]}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {DIETARY_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                tagFilter === tag ? 'bg-emerald-700 text-white' : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {DIETARY_EMOJIS[tag]} {DIETARY_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-stone-400 gap-3">
          <div className="w-16 h-16 rounded-3xl bg-white border border-stone-200 flex items-center justify-center text-3xl">
            🔍
          </div>
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
                className={`bg-white rounded-3xl border border-stone-200 p-4 text-left flex flex-col gap-2 active:scale-[0.97] transition-all relative ${
                  isExcluded.has(recipe.id) ? 'opacity-40' : ''
                }`}
              >
                {isExcluded.has(recipe.id) && (
                  <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">
                    🚫
                  </span>
                )}
                {recipe.isCustom && !isExcluded.has(recipe.id) && (
                  <span className="absolute top-3 right-3 text-xs bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                    ✏️
                  </span>
                )}
                {recipe.sourceUrl && !recipe.isCustom && !isExcluded.has(recipe.id) && (
                  <span className="absolute top-3 right-3 text-xs">🔗</span>
                )}
                <span className="text-4xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 text-sm leading-snug">{recipe.name}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {MEAL_EMOJIS[recipe.mealType]} {MEAL_LABELS[recipe.mealType]}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    t <= 20 ? 'text-emerald-600' : t <= 45 ? 'text-amber-600' : 'text-orange-600'
                  }`}>
                    {timeLabel(recipe)} {t} min
                  </span>
                  {cost > 0 && (
                    <span className="text-xs font-bold text-stone-600">{cost.toFixed(2)} €</span>
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
                      <span className="text-xs text-stone-400">+{recipe.dietaryTags.length - 2}</span>
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
        className="fixed bottom-24 right-4 w-14 h-14 bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 active:scale-95 transition-all"
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
