import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/stores';
import { WEEK_DAYS, MEAL_TYPES, MEAL_LABELS, MEAL_EMOJIS, WeekDay } from '../types';

function getWeekInfo() {
  const today = new Date();
  const dayIdx = today.getDay();
  const mondayOffset = dayIdx === 0 ? -6 : 1 - dayIdx;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const weekNum = Math.ceil(
    ((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
  );

  return { range: `${fmt(monday)} – ${fmt(sunday)}`, weekNum };
}

function getTodayDay(): WeekDay | null {
  const map: (WeekDay | null)[] = [null, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  return map[new Date().getDay()] ?? null;
}

export default function HomePage() {
  const { weekMenu, preferences, totalCost, plannedMeals, allRecipes } = useApp();
  const store = STORES.find(s => s.id === preferences.storeId) ?? STORES[0];
  const { range, weekNum } = getWeekInfo();
  const todayDay = getTodayDay();
  const todayMenu = todayDay ? weekMenu[todayDay] : null;
  const budgetPct = Math.min(100, (totalCost / preferences.weeklyBudget) * 100);
  const activeMealCount = (preferences.activeMeals ?? MEAL_TYPES).length;
  const totalActive = WEEK_DAYS.length * activeMealCount;

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="safe-area-pt px-5 pb-4">
        <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide">Semaine {weekNum}</p>
        <h1 className="text-3xl font-bold text-stone-900 mt-1">Menu & Courses</h1>
        <p className="text-stone-400 text-sm mt-0.5">{range}</p>
      </div>

      <div className="px-4 space-y-3">
        {/* Budget card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Budget hebdo</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p className="text-2xl font-bold text-stone-900">{totalCost.toFixed(2)} €</p>
                <p className="text-sm text-stone-400">/ {preferences.weeklyBudget} €</p>
              </div>
            </div>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: store.bgColor, color: store.color }}
            >
              {store.name.split(' ')[0].slice(0, 4)}
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
          <p className="text-xs text-stone-400 mt-2">
            {store.name} · {preferences.servings} pers.
            {totalCost > 0 && (
              <span className={budgetPct > 90 ? ' text-red-500' : budgetPct > 70 ? ' text-amber-600' : ' text-emerald-600'}>
                {' '}· {(preferences.weeklyBudget - totalCost).toFixed(2)} € restants
              </span>
            )}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-stone-200 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{plannedMeals}</p>
            <p className="text-xs text-stone-400 leading-tight mt-0.5">planifiés</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-3 text-center">
            <p className="text-2xl font-bold text-stone-600">{totalActive - plannedMeals}</p>
            <p className="text-xs text-stone-400 leading-tight mt-0.5">à planifier</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-3 text-center">
            <p className="text-2xl font-bold text-stone-600">{allRecipes.length}</p>
            <p className="text-xs text-stone-400 leading-tight mt-0.5">recettes</p>
          </div>
        </div>

        {/* Today's meals */}
        {todayDay && (
          <div className="bg-white rounded-3xl border border-stone-200 p-5">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
              Aujourd'hui — <span className="capitalize">{todayDay}</span>
            </h2>
            {MEAL_TYPES.map((mt) => {
              const recipeId = todayMenu?.[mt];
              const recipe = recipeId ? allRecipes.find(r => r.id === recipeId) : null;
              return (
                <div key={mt} className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-sm">
                    {MEAL_EMOJIS[mt]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-400 font-medium">{MEAL_LABELS[mt]}</p>
                    {recipe ? (
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {recipe.emoji} {recipe.name}
                      </p>
                    ) : (
                      <p className="text-sm text-stone-300 italic">Non planifié</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/menu"
            className="bg-emerald-700 text-white rounded-3xl p-5 flex items-center gap-3 col-span-2"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">📅</div>
            <div>
              <p className="font-bold text-base">Planifier le menu</p>
              <p className="text-xs text-emerald-200 mt-0.5">{totalActive - plannedMeals} repas restants</p>
            </div>
          </Link>
          <Link
            to="/courses"
            className="bg-white border border-stone-200 text-stone-800 rounded-3xl p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-lg">🛒</div>
            <div>
              <p className="font-bold text-sm">Courses</p>
              <p className="text-xs text-stone-400">{totalCost.toFixed(2)} €</p>
            </div>
          </Link>
          <Link
            to="/recettes"
            className="bg-white border border-stone-200 text-stone-800 rounded-3xl p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-lg">📖</div>
            <div>
              <p className="font-bold text-sm">Recettes</p>
              <p className="text-xs text-stone-400">Explorer</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
