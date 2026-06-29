import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/stores';
import { DietaryTag, MealType, UserPreferences, DIETARY_LABELS, DIETARY_EMOJIS, DIETARY_DESCRIPTIONS, MEAL_LABELS, MEAL_EMOJIS } from '../types';

const DIETARY_TAGS: DietaryTag[] = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal',
  'healthy', 'high-protein', 'crohn-friendly',
];

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { preferences, setPreferences, resetMenu } = useApp();
  const [local, setLocal] = useState<UserPreferences>({
    ...preferences,
    activeMeals: preferences.activeMeals ?? ['breakfast', 'lunch', 'dinner'],
  });
  const [foodInput, setFoodInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  function toggleTag(tag: DietaryTag) {
    setLocal(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  }

  function addFood() {
    const food = foodInput.trim().toLowerCase();
    if (food && !local.excludedFoods.includes(food)) {
      setLocal(prev => ({ ...prev, excludedFoods: [...prev.excludedFoods, food] }));
    }
    setFoodInput('');
  }

  function removeFood(food: string) {
    setLocal(prev => ({ ...prev, excludedFoods: prev.excludedFoods.filter(f => f !== food) }));
  }

  function handleSave() {
    setPreferences(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    resetMenu();
    setShowReset(false);
  }

  const isDirty = JSON.stringify(local) !== JSON.stringify(preferences);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white">
        <h1 className="text-xl font-bold">Réglages</h1>
        <p className="text-green-200 text-sm mt-0.5">Vos préférences alimentaires et budget</p>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Servings */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-3">👨‍👩‍👧‍👦 Nombre de personnes</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setLocal(p => ({ ...p, servings: Math.max(1, p.servings - 1) }))} className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 text-xl font-bold flex items-center justify-center">−</button>
            <span className="text-3xl font-bold text-slate-800 w-12 text-center">{local.servings}</span>
            <button onClick={() => setLocal(p => ({ ...p, servings: Math.min(12, p.servings + 1) }))} className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 text-xl font-bold flex items-center justify-center">+</button>
            <span className="text-slate-500 text-sm">personne{local.servings > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Active meals */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-1">🍽️ Repas à planifier</h2>
          <p className="text-xs text-slate-400 mb-3">Choisissez les repas que vous souhaitez inclure dans le menu.</p>
          <div className="space-y-2">
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(meal => {
              const active = local.activeMeals.includes(meal);
              const isLast = meal === 'dinner';
              const wouldBeAlone = active && local.activeMeals.length === 1;
              return (
                <button
                  key={meal}
                  onClick={() => {
                    if (wouldBeAlone) return;
                    setLocal(p => ({
                      ...p,
                      activeMeals: active
                        ? p.activeMeals.filter(m => m !== meal)
                        : [...p.activeMeals, meal as MealType].sort((a, b) =>
                            ['breakfast', 'lunch', 'dinner'].indexOf(a) - ['breakfast', 'lunch', 'dinner'].indexOf(b)
                          ),
                    }));
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all ${
                    active ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'
                  } ${wouldBeAlone ? 'opacity-50' : ''}`}
                >
                  <span className="text-xl">{MEAL_EMOJIS[meal]}</span>
                  <span className="flex-1 text-left text-sm font-medium text-slate-700">{MEAL_LABELS[meal]}</span>
                  {!isLast && meal === 'lunch' && <span className="text-xs text-slate-400">midi</span>}
                  {meal === 'dinner' && <span className="text-xs text-slate-400">soir</span>}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                    {active && <span className="text-white text-xs leading-none">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-3">💰 Budget hebdomadaire</h2>
          <div className="flex items-center gap-3">
            <input
              type="range" min={50} max={500} step={10} value={local.weeklyBudget}
              onChange={e => setLocal(p => ({ ...p, weeklyBudget: Number(e.target.value) }))}
              className="flex-1 accent-green-600"
            />
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-3 py-2 min-w-[80px]">
              <input
                type="number" min={10} max={1000} value={local.weeklyBudget}
                onChange={e => setLocal(p => ({ ...p, weeklyBudget: Math.max(10, Number(e.target.value)) }))}
                className="w-12 bg-transparent text-slate-800 font-bold text-lg outline-none text-right"
              />
              <span className="text-slate-500 text-sm">€</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Soit ~{(local.weeklyBudget / 30).toFixed(2)} €/jour et ~{(local.weeklyBudget / (local.servings * 21)).toFixed(2)} €/repas/pers.
          </p>
        </div>

        {/* Store */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-3">🏪 Chaîne de magasin</h2>
          <div className="grid grid-cols-2 gap-2">
            {STORES.map(store => (
              <button
                key={store.id}
                onClick={() => setLocal(p => ({ ...p, storeId: store.id }))}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                  local.storeId === store.id ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: store.bgColor, color: store.color }}>
                  {store.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{store.name}</p>
                  <p className="text-xs text-slate-400">×{store.priceMultiplier.toFixed(2)}</p>
                </div>
                {local.storeId === store.id && <span className="ml-auto text-green-600 text-sm">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary preferences */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-1">🥗 Profil alimentaire</h2>
          <p className="text-xs text-slate-400 mb-3">
            Les recettes du planificateur et de la génération automatique seront filtrées en conséquence.
          </p>
          <div className="space-y-2">
            {DIETARY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all ${
                  local.dietaryTags.includes(tag) ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="text-xl">{DIETARY_EMOJIS[tag]}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-700">{DIETARY_LABELS[tag]}</p>
                  <p className="text-xs text-slate-400">{DIETARY_DESCRIPTIONS[tag]}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${local.dietaryTags.includes(tag) ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                  {local.dietaryTags.includes(tag) && <span className="text-white text-xs leading-none">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Excluded foods */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-1">🚫 Aliments à exclure</h2>
          <p className="text-xs text-slate-400 mb-3">
            Toute recette contenant un de ces aliments sera masquée dans le planificateur et exclue de la génération automatique.
          </p>

          <div className="flex gap-2 mb-3">
            <input
              value={foodInput}
              onChange={e => setFoodInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFood()}
              placeholder="Ex : courgette, champignon…"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={addFood}
              disabled={!foodInput.trim()}
              className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-xl disabled:opacity-40"
            >
              +
            </button>
          </div>

          {local.excludedFoods.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {local.excludedFoods.map(food => (
                <span key={food} className="flex items-center gap-1.5 bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full border border-red-200">
                  🚫 {food}
                  <button onClick={() => removeFood(food)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Aucun aliment exclu</p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
            saved ? 'bg-green-500 text-white' : isDirty ? 'bg-green-600 text-white active:scale-[0.98]' : 'bg-slate-200 text-slate-400'
          }`}
        >
          {saved ? '✓ Enregistré !' : 'Enregistrer les réglages'}
        </button>

        {/* Import */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-2">📥 Importer des recettes</h2>
          <p className="text-sm text-slate-500 mb-3">
            Importez depuis Notion (CSV) ou ajoutez manuellement avec un lien Instagram, blog, YouTube…
          </p>
          <div className="flex gap-2">
            <button onClick={() => navigate('/import')} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl">
              📓 Import Notion CSV
            </button>
            <button onClick={() => navigate('/recettes/ajouter')} className="flex-1 py-2.5 bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200">
              ✏️ Ajouter manuellement
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-red-600 mb-2">⚠️ Zone danger</h2>
          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="text-sm text-red-500 underline">
              Réinitialiser le menu de la semaine
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Êtes-vous sûr ? Tous les repas planifiés seront supprimés.</p>
              <div className="flex gap-2">
                <button onClick={handleReset} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold rounded-xl">Oui, réinitialiser</button>
                <button onClick={() => setShowReset(false)} className="flex-1 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl">Annuler</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
