import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCategory, CATEGORY_EMOJIS } from '../types';
import { STORES } from '../data/stores';

function fmtQty(qty: number, unit: string): string {
  if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} kg`;
  if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} L`;
  const rounded = Number.isInteger(qty) ? qty : parseFloat(qty.toFixed(1));
  return `${rounded}${unit ? ' ' + unit : ''}`;
}

export default function ShoppingListPage() {
  const { shoppingList, totalCost, preferences, plannedMeals } = useApp();
  const store = STORES.find(s => s.id === preferences.storeId) ?? STORES[0];
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<ShoppingCategory, typeof shoppingList>();
    for (const item of shoppingList) {
      const existing = map.get(item.category) ?? [];
      existing.push(item);
      map.set(item.category, existing);
    }
    return map;
  }, [shoppingList]);

  function toggle(name: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function copyToClipboard() {
    const lines = ['🛒 LISTE DE COURSES', `Magasin : ${store.name}`, ''];
    for (const [cat, items] of grouped) {
      lines.push(`── ${CATEGORY_EMOJIS[cat]} ${cat} ──`);
      for (const item of items) {
        lines.push(`  • ${item.name} — ${fmtQty(item.totalQuantity, item.unit)} (${item.totalPrice.toFixed(2)} €)`);
      }
      lines.push('');
    }
    lines.push(`TOTAL : ${totalCost.toFixed(2)} €`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      alert('Liste copiée !');
    });
  }

  const budgetPct = Math.min(100, (totalCost / preferences.weeklyBudget) * 100);
  const remaining = preferences.weeklyBudget - totalCost;
  const checkedCount = checked.size;
  const totalItems = shoppingList.length;

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="safe-area-pt px-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Courses</h1>
          <p className="text-stone-400 text-sm mt-0.5">{store.name}</p>
        </div>
        {shoppingList.length > 0 && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 bg-stone-900 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl"
          >
            📋 Copier
          </button>
        )}
      </div>

      {shoppingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-white border border-stone-200 flex items-center justify-center text-4xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-stone-800">Liste vide</h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            Planifiez des repas dans l'onglet Menu pour générer automatiquement votre liste de courses.
          </p>
          <p className="text-xs text-stone-300">{plannedMeals} repas planifiés</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {/* Summary card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Total estimé</p>
                <p className={`text-3xl font-bold mt-0.5 ${
                  budgetPct > 90 ? 'text-red-500' : budgetPct > 70 ? 'text-amber-600' : 'text-stone-900'
                }`}>
                  {totalCost.toFixed(2)} €
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Budget {preferences.weeklyBudget} €
                  {remaining >= 0
                    ? <span className="text-emerald-600"> · {remaining.toFixed(2)} € restants</span>
                    : <span className="text-red-500"> · +{Math.abs(remaining).toFixed(2)} € dépassement</span>
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-400">{checkedCount}/{totalItems}</p>
                <p className="text-xs text-stone-400">cochés</p>
              </div>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetPct > 90 ? 'bg-red-400' : budgetPct > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            {checkedCount > 0 && (
              <button
                onClick={() => setChecked(new Set())}
                className="text-xs text-stone-400 underline mt-2"
              >
                Tout décocher
              </button>
            )}
          </div>

          {/* Grouped list */}
          {Array.from(grouped).map(([category, items]) => (
            <div key={category} className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100">
                <span className="text-base">{CATEGORY_EMOJIS[category]}</span>
                <span className="font-semibold text-stone-700 text-sm">{category}</span>
                <span className="ml-auto text-xs text-stone-400 font-medium">
                  {items.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)} €
                </span>
              </div>

              <ul className="divide-y divide-stone-100">
                {items.map((item) => {
                  const isChecked = checked.has(item.name);
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => toggle(item.name)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-stone-50 active:bg-stone-100 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-stone-300'
                          }`}
                        >
                          {isChecked && (
                            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm transition-colors ${
                            isChecked ? 'line-through text-stone-300' : 'text-stone-800'
                          }`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5 truncate">
                            {item.fromRecipes.join(', ')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-stone-700">
                            {fmtQty(item.totalQuantity, item.unit)}
                          </p>
                          {item.totalPrice > 0 && (
                            <p className="text-xs text-emerald-700 font-medium">
                              {item.totalPrice.toFixed(2)} €
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
