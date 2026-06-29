import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCategory, CATEGORY_EMOJIS } from '../types';
import { STORES } from '../data/stores';

function fmtQty(qty: number, unit: string): string {
  if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} kg`;
  if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} L`;
  const rounded = Number.isInteger(qty) ? qty : parseFloat(qty.toFixed(1));
  return `${rounded} ${unit}`;
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
  const budgetColor = budgetPct > 90 ? 'text-red-600' : budgetPct > 70 ? 'text-amber-600' : 'text-green-600';
  const remaining = preferences.weeklyBudget - totalCost;
  const checkedCount = checked.size;
  const totalItems = shoppingList.length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-4 text-white">
        <h1 className="text-xl font-bold">Liste de courses</h1>
        <p className="text-green-200 text-sm mt-0.5">{store.name}</p>
      </div>

      {shoppingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-4">
          <span className="text-6xl">🛒</span>
          <h2 className="text-xl font-bold text-slate-700">Liste vide</h2>
          <p className="text-slate-400 text-sm">
            Planifiez des repas dans l'onglet Menu pour générer automatiquement votre liste de courses.
          </p>
          <p className="text-xs text-slate-300">{plannedMeals} repas planifiés</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="px-4 pt-4 pb-2 space-y-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total estimé</p>
                  <p className={`text-3xl font-bold ${budgetColor}`}>{totalCost.toFixed(2)} €</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Budget : {preferences.weeklyBudget} €
                    {remaining >= 0
                      ? <span className="text-green-600"> · Il reste {remaining.toFixed(2)} €</span>
                      : <span className="text-red-500"> · Dépassement de {Math.abs(remaining).toFixed(2)} €</span>
                    }
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
                >
                  📋 Copier
                </button>
              </div>

              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-xs text-slate-400">{checkedCount}/{totalItems} articles cochés</p>
                {checkedCount > 0 && (
                  <button onClick={() => setChecked(new Set())} className="text-xs text-slate-400 underline">
                    Tout décocher
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grouped list */}
          <div className="px-4 space-y-4">
            {Array.from(grouped).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <span className="text-lg">{CATEGORY_EMOJIS[category]}</span>
                  <span className="font-semibold text-slate-700 text-sm">{category}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {items.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)} €
                  </span>
                </div>

                <ul className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const isChecked = checked.has(item.name);
                    return (
                      <li key={item.name}>
                        <button
                          onClick={() => toggle(item.name)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isChecked && (
                              <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {item.fromRecipes.join(', ')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-slate-700">
                              {fmtQty(item.totalQuantity, item.unit)}
                            </p>
                            <p className="text-xs text-green-700 font-medium">
                              {item.totalPrice.toFixed(2)} €
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
