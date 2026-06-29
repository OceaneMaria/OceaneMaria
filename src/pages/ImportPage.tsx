import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Recipe, MealType, DietaryTag } from '../types';

const TEMPLATE_CSV = `Nom,Type,Emoji,TempsPrep,TempsCuisson,Portions,Description,Lien,Tags
Salade César,lunch,🥗,15,0,4,Salade romaine croustillante sauce césar maison,https://www.instagram.com/p/example,vegetarian
Poulet tikka masala,dinner,🍛,20,30,4,Curry indien crémeux à la tomate,https://notionpage.com/tikka,gluten-free|dairy-free|halal
Smoothie bowl,breakfast,🍓,10,0,2,Bowl coloré aux fruits et granola,,vegetarian|gluten-free`;


const MEAL_MAP: Record<string, MealType> = {
  breakfast: 'breakfast',
  'petit-déjeuner': 'breakfast',
  'petit dejeuner': 'breakfast',
  'petit-dej': 'breakfast',
  lunch: 'lunch',
  déjeuner: 'lunch',
  dejeuner: 'lunch',
  dinner: 'dinner',
  dîner: 'dinner',
  diner: 'dinner',
  'repas du soir': 'dinner',
};

const TAG_MAP: Record<string, DietaryTag> = {
  vegetarian: 'vegetarian',
  végétarien: 'vegetarian',
  vegetarien: 'vegetarian',
  'végetarien': 'vegetarian',
  vegan: 'vegan',
  végétalien: 'vegan',
  vegetalien: 'vegan',
  'gluten-free': 'gluten-free',
  'sans gluten': 'gluten-free',
  'dairy-free': 'dairy-free',
  'sans lactose': 'dairy-free',
  'sans lait': 'dairy-free',
  halal: 'halal',
};

interface ParsedRow {
  name: string;
  mealType: MealType;
  emoji: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  description: string;
  sourceUrl: string;
  dietaryTags: DietaryTag[];
  valid: boolean;
  error?: string;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const COL = (name: string) => header.indexOf(name);

  const iNom = COL('nom') !== -1 ? COL('nom') : 0;
  const iType = COL('type') !== -1 ? COL('type') : 1;
  const iEmoji = COL('emoji') !== -1 ? COL('emoji') : 2;
  const iPrep = COL('tempsprep') !== -1 ? COL('tempsprep') : 3;
  const iCook = COL('tempscuisson') !== -1 ? COL('tempscuisson') : 4;
  const iPart = COL('portions') !== -1 ? COL('portions') : 5;
  const iDesc = COL('description') !== -1 ? COL('description') : 6;
  const iLien = COL('lien') !== -1 ? COL('lien') : 7;
  const iTags = COL('tags') !== -1 ? COL('tags') : 8;

  return lines.slice(1).map(line => {
    // handle quoted commas
    const cols: string[] = [];
    let cur = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { cols.push(cur); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur);

    const get = (i: number) => (cols[i] ?? '').trim().replace(/^"|"$/g, '');

    const name = get(iNom);
    if (!name) return { name: '', mealType: 'dinner' as MealType, emoji: '🍽️', prepTime: 0, cookTime: 0, servings: 4, description: '', sourceUrl: '', dietaryTags: [], valid: false, error: 'Nom manquant' };

    const rawType = get(iType).toLowerCase();
    const mealType: MealType = (MEAL_MAP[rawType] ?? 'dinner') as MealType;

    const rawTags = get(iTags);
    const dietaryTags: DietaryTag[] = rawTags
      .split(/[|,;]/)
      .map(t => TAG_MAP[t.trim().toLowerCase()])
      .filter((t): t is DietaryTag => !!t);

    return {
      name,
      mealType,
      emoji: get(iEmoji) || '🍽️',
      prepTime: parseInt(get(iPrep)) || 0,
      cookTime: parseInt(get(iCook)) || 0,
      servings: parseInt(get(iPart)) || 4,
      description: get(iDesc),
      sourceUrl: get(iLien),
      dietaryTags,
      valid: true,
    };
  }).filter(r => r.name);
}

function generateId(): string {
  return `import_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ImportPage() {
  const navigate = useNavigate();
  const { addRecipe } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [imported, setImported] = useState(false);

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-recettes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      setRows(parsed);
      setSelected(new Set(parsed.map((_, i) => i).filter(i => parsed[i].valid)));
      setStep('preview');
    };
    reader.readAsText(file, 'UTF-8');
  }

  function handleImport() {
    const toImport = rows.filter((_, i) => selected.has(i) && rows[i].valid);
    for (const row of toImport) {
      const recipe: Recipe = {
        id: generateId(),
        name: row.name,
        emoji: row.emoji,
        description: row.description,
        mealType: row.mealType,
        dietaryTags: row.dietaryTags,
        ingredients: [],
        servings: row.servings,
        prepTime: row.prepTime,
        cookTime: row.cookTime,
        sourceUrl: row.sourceUrl || undefined,
        isCustom: true,
      };
      addRecipe(recipe);
    }
    setImported(true);
    setTimeout(() => navigate('/recettes'), 1500);
  }

  function toggleRow(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const MEAL_ICONS: Record<MealType, string> = { breakfast: '☀️', lunch: '🌤️', dinner: '🌙' };

  return (
    <div className="pb-24">
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white flex items-center gap-3">
        <button onClick={() => (step === 'preview' ? setStep('upload') : navigate(-1))} className="text-green-200 text-lg">
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold">Importer depuis Notion</h1>
          <p className="text-green-200 text-sm">Import CSV · {step === 'upload' ? 'Étape 1/2' : 'Étape 2/2'}</p>
        </div>
      </div>

      {step === 'upload' ? (
        <div className="px-4 py-4 space-y-4">
          {/* Explication Notion */}
          <div className="bg-slate-800 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📓</span>
              <h2 className="font-bold">Depuis votre base Notion</h2>
            </div>
            <ol className="text-sm text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Ouvrez votre base de données recettes dans Notion</li>
              <li>Cliquez sur <strong className="text-white">···</strong> (en haut à droite)</li>
              <li>Sélectionnez <strong className="text-white">Exporter → CSV</strong></li>
              <li>Uploadez le fichier ci-dessous</li>
            </ol>
            <p className="text-xs text-slate-400 mt-3">
              ⚠️ L'API Notion ne peut pas être appelée directement depuis un navigateur (restriction CORS).
              L'export CSV est la solution la plus fiable.
            </p>
          </div>

          {/* Format attendu */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-700">📋 Format CSV attendu</h2>
              <button onClick={downloadTemplate} className="text-xs text-green-600 font-semibold">
                Télécharger modèle
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 overflow-x-auto">
              <code className="text-xs text-slate-600 whitespace-pre">{`Nom, Type, Emoji, TempsPrep, TempsCuisson, Portions, Description, Lien, Tags`}</code>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-500">
              <p><strong>Type :</strong> breakfast | lunch | dinner (ou français : petit-déjeuner, déjeuner, dîner)</p>
              <p><strong>Tags :</strong> séparés par | — vegetarian, vegan, gluten-free, dairy-free, halal</p>
              <p><strong>Lien :</strong> URL Instagram, blog, YouTube… (optionnel)</p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Les colonnes de votre export Notion seront reconnues automatiquement si elles correspondent aux noms ci-dessus.
            </p>
          </div>

          {/* Depuis Instagram/autre */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📱</span>
              <h2 className="font-bold text-slate-700">Depuis Instagram ou un blog</h2>
            </div>
            <p className="text-sm text-slate-500">
              Instagram ne fournit pas d'API publique permettant d'extraire les recettes automatiquement.
              Vous pouvez :
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-500 list-disc list-inside">
              <li>Ajouter une recette manuellement avec le lien Instagram comme référence</li>
              <li>Remplir un CSV avec les recettes de vos posts favoris</li>
            </ul>
            <button
              onClick={() => navigate('/recettes/ajouter')}
              className="mt-3 w-full py-2.5 bg-green-50 text-green-700 font-semibold text-sm rounded-xl border border-green-200"
            >
              Ajouter une recette manuellement →
            </button>
          </div>

          {/* Upload */}
          <div
            className="bg-white rounded-2xl shadow-sm p-6 border-2 border-dashed border-slate-300 flex flex-col items-center gap-3 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-4xl">📂</span>
            <p className="font-semibold text-slate-700">Charger un fichier CSV</p>
            <p className="text-xs text-slate-400">Format Notion, modèle fourni, ou tout CSV compatible</p>
            <span className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl">
              Choisir un fichier
            </span>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="font-semibold text-slate-700">
              {rows.length} recette{rows.length > 1 ? 's' : ''} trouvée{rows.length > 1 ? 's' : ''}
              {' · '}{selected.size} sélectionnée{selected.size > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setSelected(new Set(rows.map((_, i) => i).filter(i => rows[i].valid)))} className="text-xs text-green-600 underline">Tout sélectionner</button>
              <button onClick={() => setSelected(new Set())} className="text-xs text-slate-400 underline">Tout désélectionner</button>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <button
                key={i}
                onClick={() => row.valid && toggleRow(i)}
                className={`w-full text-left bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3 ${
                  !row.valid ? 'opacity-50' : selected.has(i) ? 'border-2 border-green-400' : 'border-2 border-transparent'
                }`}
              >
                <span className="text-3xl">{row.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{row.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {MEAL_ICONS[row.mealType]} · ⏱ {row.prepTime + row.cookTime} min · {row.servings} pers.
                  </p>
                  {row.sourceUrl && (
                    <p className="text-xs text-blue-500 truncate mt-0.5">{row.sourceUrl}</p>
                  )}
                  {row.dietaryTags.length > 0 && (
                    <p className="text-xs text-green-600 mt-0.5">{row.dietaryTags.join(', ')}</p>
                  )}
                  {!row.valid && <p className="text-xs text-red-500 mt-0.5">⚠️ {row.error}</p>}
                </div>
                {row.valid && (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected.has(i) ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                    {selected.has(i) && <span className="text-white text-xs">✓</span>}
                  </div>
                )}
              </button>
            ))}
          </div>

          {imported ? (
            <div className="py-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-700 font-semibold">
              ✓ {selected.size} recette{selected.size > 1 ? 's' : ''} importée{selected.size > 1 ? 's' : ''} !
            </div>
          ) : (
            <button
              onClick={handleImport}
              disabled={selected.size === 0}
              className={`w-full py-4 font-bold rounded-2xl text-base transition-all ${
                selected.size > 0 ? 'bg-green-600 text-white active:scale-[0.98]' : 'bg-slate-200 text-slate-400'
              }`}
            >
              Importer {selected.size > 0 ? `${selected.size} recette${selected.size > 1 ? 's' : ''}` : ''}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
