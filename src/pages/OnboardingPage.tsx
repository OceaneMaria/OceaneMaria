import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildGeneratedMenu } from '../context/AppContext';
import { STORES } from '../data/stores';
import { DietaryTag, UserPreferences, DIETARY_LABELS, DIETARY_EMOJIS, DIETARY_DESCRIPTIONS } from '../types';

const DIETARY_TAGS: DietaryTag[] = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal',
  'healthy', 'high-protein', 'crohn-friendly',
];

export default function OnboardingPage() {
  const { allRecipes, setPreferences, setMenu, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const [storeId, setStoreId] = useState('colruyt');
  const [budget, setBudget] = useState(150);
  const [servings, setServings] = useState(4);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [excludedFoods, setExcludedFoods] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState('');
  const [generating, setGenerating] = useState(false);

  const store = STORES.find(s => s.id === storeId) ?? STORES[0];

  function toggleTag(tag: DietaryTag) {
    setDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function addFood() {
    const food = foodInput.trim().toLowerCase();
    if (food && !excludedFoods.includes(food)) {
      setExcludedFoods(prev => [...prev, food]);
    }
    setFoodInput('');
  }

  function removeFood(food: string) {
    setExcludedFoods(prev => prev.filter(f => f !== food));
  }

  function handleFinish() {
    setGenerating(true);
    const prefs: UserPreferences = { dietaryTags, storeId, weeklyBudget: budget, servings, excludedFoods };
    setPreferences(prefs);
    const menu = buildGeneratedMenu(allRecipes, prefs);
    setMenu(menu);
    setTimeout(() => {
      completeOnboarding();
    }, 800);
  }

  const TOTAL_STEPS = 5;
  const progress = ((step) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex flex-col">
      {/* Progress bar */}
      {step > 0 && (
        <div className="h-1 bg-green-900">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6">
        {/* ── Step 0 : Welcome ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div className="text-7xl">🥗</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Menu & Courses</h1>
              <p className="text-green-200 mt-3 text-lg leading-relaxed">
                Planifiez vos repas, gérez votre budget et générez votre liste de courses en quelques secondes.
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-left w-full space-y-2">
              {['🏪 Votre enseigne préférée', '💰 Votre budget hebdomadaire', '🥦 Vos préférences alimentaires', '🚫 Les aliments à éviter'].map(item => (
                <p key={item} className="text-white text-sm">{item}</p>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 bg-white text-green-700 font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-all"
            >
              C'est parti ! →
            </button>
          </div>
        )}

        {/* ── Step 1 : Store ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col pt-12 gap-6">
            <div>
              <p className="text-green-300 text-sm font-medium">Étape 1 / 4</p>
              <h2 className="text-2xl font-bold text-white mt-1">Votre magasin habituel ?</h2>
              <p className="text-green-200 text-sm mt-1">Les prix s'adapteront automatiquement.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STORES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStoreId(s.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                    storeId === s.id
                      ? 'border-white bg-white/20 text-white'
                      : 'border-white/30 bg-white/10 text-green-100'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: s.bgColor, color: s.color }}
                  >
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">{s.name}</p>
                    <p className="text-xs opacity-70">
                      {s.priceMultiplier < 1 ? `−${Math.round((1 - s.priceMultiplier) * 100)}%` : s.priceMultiplier === 1 ? 'référence' : `+${Math.round((s.priceMultiplier - 1) * 100)}%`}
                    </p>
                  </div>
                  {storeId === s.id && <span className="ml-auto text-white">✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-auto mb-8 w-full py-4 bg-white text-green-700 font-bold text-base rounded-2xl">
              Continuer →
            </button>
          </div>
        )}

        {/* ── Step 2 : Budget + Personnes ──────────────────────────────── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col pt-12 gap-6">
            <div>
              <p className="text-green-300 text-sm font-medium">Étape 2 / 4</p>
              <h2 className="text-2xl font-bold text-white mt-1">Budget & personnes</h2>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-green-200 text-sm font-medium">Budget hebdomadaire</label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range" min={30} max={500} step={10} value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="flex-1 accent-white"
                  />
                  <div className="bg-white/20 rounded-xl px-3 py-2 min-w-[72px] text-center">
                    <span className="text-white font-bold text-lg">{budget}</span>
                    <span className="text-green-200 text-sm"> €</span>
                  </div>
                </div>
                <p className="text-green-300 text-xs mt-1">
                  ≈ {(budget / store.priceMultiplier).toFixed(0)} € équivalent {store.name}
                </p>
              </div>

              <div>
                <label className="text-green-200 text-sm font-medium">Nombre de personnes</label>
                <div className="flex items-center gap-4 mt-2">
                  <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-10 h-10 rounded-full bg-white/20 text-white text-xl font-bold flex items-center justify-center">−</button>
                  <span className="text-3xl font-bold text-white w-12 text-center">{servings}</span>
                  <button onClick={() => setServings(Math.min(12, servings + 1))} className="w-10 h-10 rounded-full bg-white/20 text-white text-xl font-bold flex items-center justify-center">+</button>
                  <span className="text-green-200 text-sm">personne{servings > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(3)} className="mt-auto mb-8 w-full py-4 bg-white text-green-700 font-bold text-base rounded-2xl">
              Continuer →
            </button>
          </div>
        )}

        {/* ── Step 3 : Dietary preferences ─────────────────────────────── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col pt-12 gap-6">
            <div>
              <p className="text-green-300 text-sm font-medium">Étape 3 / 4</p>
              <h2 className="text-2xl font-bold text-white mt-1">Vos préférences alimentaires</h2>
              <p className="text-green-200 text-sm mt-1">Sélectionnez tout ce qui vous correspond. Vous pouvez modifier plus tard.</p>
            </div>

            <div className="space-y-2">
              {DIETARY_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                    dietaryTags.includes(tag)
                      ? 'border-white bg-white/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <span className="text-2xl">{DIETARY_EMOJIS[tag]}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{DIETARY_LABELS[tag]}</p>
                    <p className="text-green-300 text-xs">{DIETARY_DESCRIPTIONS[tag]}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${dietaryTags.includes(tag) ? 'border-white bg-white' : 'border-white/40'}`}>
                    {dietaryTags.includes(tag) && <span className="text-green-700 text-xs font-bold">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setStep(4)} className="mt-auto mb-8 w-full py-4 bg-white text-green-700 font-bold text-base rounded-2xl">
              {dietaryTags.length === 0 ? 'Passer cette étape →' : 'Continuer →'}
            </button>
          </div>
        )}

        {/* ── Step 4 : Excluded foods ───────────────────────────────────── */}
        {step === 4 && (
          <div className="flex-1 flex flex-col pt-12 gap-5">
            <div>
              <p className="text-green-300 text-sm font-medium">Étape 4 / 4</p>
              <h2 className="text-2xl font-bold text-white mt-1">Aliments à exclure</h2>
              <p className="text-green-200 text-sm mt-1">
                Les recettes contenant ces ingrédients seront automatiquement exclues du menu et de la sélection.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  value={foodInput}
                  onChange={e => setFoodInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFood()}
                  placeholder="Ex : courgette, champignon…"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/20 text-white placeholder-green-300 text-sm outline-none focus:bg-white/30"
                />
                <button
                  onClick={addFood}
                  disabled={!foodInput.trim()}
                  className="px-4 py-2 bg-white text-green-700 font-bold text-sm rounded-xl disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>

              {excludedFoods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {excludedFoods.map(food => (
                    <span key={food} className="flex items-center gap-1.5 bg-red-500/30 text-white text-sm px-3 py-1 rounded-full border border-red-400/50">
                      🚫 {food}
                      <button onClick={() => removeFood(food)} className="text-red-300 hover:text-white font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              )}

              {excludedFoods.length === 0 && (
                <p className="text-green-300 text-xs text-center py-2">Aucun aliment exclu pour l'instant</p>
              )}
            </div>

            <div className="mt-auto mb-8 space-y-3">
              {generating ? (
                <div className="w-full py-4 bg-white rounded-2xl flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-green-700 font-bold">Génération du menu…</span>
                </div>
              ) : (
                <button
                  onClick={handleFinish}
                  className="w-full py-4 bg-white text-green-700 font-bold text-base rounded-2xl active:scale-[0.98] transition-all"
                >
                  ✨ Générer mon premier menu !
                </button>
              )}
              <button onClick={() => setStep(step - 1)} className="w-full text-green-300 text-sm">
                ← Retour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
