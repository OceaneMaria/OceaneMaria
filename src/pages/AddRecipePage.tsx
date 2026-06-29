import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Recipe,
  Ingredient,
  MealType,
  DietaryTag,
  ShoppingCategory,
  MEAL_LABELS,
  MEAL_EMOJIS,
  DIETARY_LABELS,
  DIETARY_EMOJIS,
  CATEGORY_EMOJIS,
} from '../types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];
const DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];
const CATEGORIES: ShoppingCategory[] = [
  'Fruits & Légumes',
  'Viandes',
  'Poissons',
  'Produits laitiers & Œufs',
  'Boulangerie',
  'Épicerie',
];
const UNITS = ['g', 'kg', 'ml', 'L', 'unité', 'boîte', 'gousse', 'tranche', 'pincée', 'cas', 'cac'];

interface IngredientForm {
  name: string;
  quantity: string;
  unit: string;
  category: ShoppingCategory;
  totalPrice: string; // prix total pour la quantité indiquée
}

const EMPTY_ING: IngredientForm = {
  name: '',
  quantity: '',
  unit: 'g',
  category: 'Épicerie',
  totalPrice: '',
};

function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function AddRecipePage() {
  const navigate = useNavigate();
  const { addRecipe } = useApp();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [servings, setServings] = useState('4');
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [ingredients, setIngredients] = useState<IngredientForm[]>([{ ...EMPTY_ING }]);
  const [errors, setErrors] = useState<string[]>([]);

  function toggleTag(tag: DietaryTag) {
    setDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function updateIngredient(idx: number, field: keyof IngredientForm, value: string) {
    setIngredients(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { ...EMPTY_ING }]);
  }

  function removeIngredient(idx: number) {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Le nom de la recette est requis.');
    if (Number(prepTime) < 0 || Number(cookTime) < 0) errs.push('Les temps doivent être positifs.');
    if (Number(servings) < 1) errs.push('Le nombre de portions doit être ≥ 1.');
    for (const [i, ing] of ingredients.entries()) {
      if (!ing.name.trim()) errs.push(`Ingrédient ${i + 1} : nom manquant.`);
      if (!ing.quantity || Number(ing.quantity) <= 0) errs.push(`Ingrédient ${i + 1} : quantité invalide.`);
    }
    setErrors(errs);
    return errs.length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const parsedIngredients: Ingredient[] = ingredients
      .filter(ing => ing.name.trim())
      .map(ing => {
        const qty = Number(ing.quantity);
        const total = Number(ing.totalPrice) || 0;
        const pricePerUnit = qty > 0 && total > 0 ? total / qty : 0;
        return {
          name: ing.name.trim(),
          quantity: qty,
          unit: ing.unit,
          category: ing.category,
          pricePerUnit,
        };
      });

    const recipe: Recipe = {
      id: generateId(),
      name: name.trim(),
      emoji,
      description: description.trim(),
      mealType,
      dietaryTags,
      ingredients: parsedIngredients,
      servings: Math.max(1, Number(servings)),
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      sourceUrl: sourceUrl.trim() || undefined,
      isCustom: true,
    };

    addRecipe(recipe);
    navigate('/recettes');
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-green-200 text-lg">←</button>
        <div>
          <h1 className="text-xl font-bold">Ajouter une recette</h1>
          <p className="text-green-200 text-sm">Depuis Instagram, un blog, Notion…</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-600">• {e}</p>
            ))}
          </div>
        )}

        {/* Infos de base */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-slate-700">Infos générales</h2>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-medium">Nom *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Poulet au curry…"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="w-20">
              <label className="text-xs text-slate-500 font-medium">Emoji</label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-center text-xl outline-none focus:ring-2 focus:ring-green-400"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Courte description de la recette…"
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium">Lien source (Instagram, blog, YouTube…)</label>
            <input
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              type="url"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Type de repas */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-3">Type de repas *</h2>
          <div className="grid grid-cols-3 gap-2">
            {MEAL_TYPES.map(mt => (
              <button
                key={mt}
                onClick={() => setMealType(mt)}
                className={`py-3 rounded-xl border-2 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${
                  mealType === mt ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span className="text-lg">{MEAL_EMOJIS[mt]}</span>
                {MEAL_LABELS[mt]}
              </button>
            ))}
          </div>
        </div>

        {/* Temps & portions */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-slate-700">Temps & portions</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Préparation</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={e => setPrepTime(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm text-center outline-none focus:ring-2 focus:ring-green-400"
                />
                <span className="text-xs text-slate-400">min</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Cuisson</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={e => setCookTime(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm text-center outline-none focus:ring-2 focus:ring-green-400"
                />
                <span className="text-xs text-slate-400">min</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Portions</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(e.target.value)}
                className="w-full mt-1 px-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm text-center outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Total : {(Number(prepTime) || 0) + (Number(cookTime) || 0)} min
            {(Number(prepTime) || 0) + (Number(cookTime) || 0) <= 20 && ' ⚡ Rapide'}
          </p>
        </div>

        {/* Tags alimentaires */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-slate-700 mb-3">Préférences alimentaires</h2>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-colors ${
                  dietaryTags.includes(tag)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                {DIETARY_EMOJIS[tag]} {DIETARY_LABELS[tag]}
              </button>
            ))}
          </div>
        </div>

        {/* Ingrédients */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-700">Ingrédients</h2>
            <span className="text-xs text-slate-400">Pour {servings} pers.</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Le "Prix total" est le coût de l'ingrédient pour la quantité indiquée.
            Il permet de calculer le budget automatiquement.
          </p>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Ingrédient {idx + 1}</span>
                  {ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(idx)}
                      className="text-red-400 text-xs"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <input
                  value={ing.name}
                  onChange={e => updateIngredient(idx, 'name', e.target.value)}
                  placeholder="Nom (ex: Poulet)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">Quantité</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={ing.quantity}
                      onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                      placeholder="400"
                      className="w-full mt-0.5 px-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Unité</label>
                    <select
                      value={ing.unit}
                      onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                      className="w-full mt-0.5 px-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none"
                    >
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Prix total (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ing.totalPrice}
                      onChange={e => updateIngredient(idx, 'totalPrice', e.target.value)}
                      placeholder="2.50"
                      className="w-full mt-0.5 px-2 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Rayon</label>
                  <select
                    value={ing.category}
                    onChange={e => updateIngredient(idx, 'category', e.target.value as ShoppingCategory)}
                    className="w-full mt-0.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addIngredient}
            className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-green-400 hover:text-green-600"
          >
            + Ajouter un ingrédient
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl text-base active:scale-[0.98] transition-all"
        >
          Enregistrer la recette
        </button>
      </div>
    </div>
  );
}
