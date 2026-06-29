import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/stores';
import { WEEK_DAYS, MEAL_TYPES, MEAL_LABELS, MEAL_EMOJIS, WeekDay } from '../types';

function getWeekInfo() {
  const today = new Date();
  const dayIdx = today.getDay(); // 0=Sun
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
  const budgetColor = budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-green-500';
  const totalPossible = WEEK_DAYS.length * MEAL_TYPES.length;

  return (
    <div className="pb-24">
      {/* Hero header */}
      <div className="bg-green-600 px-4 pt-12 pb-8 text-white">
        <p className="text-green-200 text-sm font-medium">Semaine {weekNum}</p>
        <h1 className="text-2xl font-bold mt-0.5">Menu & Courses</h1>
        <p className="text-green-200 text-sm mt-1">{range}</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Budget card */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-slate-500 font-medium">Budget hebdomadaire</p>
              <p className="text-xl font-bold text-slate-800">
                {totalCost.toFixed(2)} €
                <span className="text-sm font-normal text-slate-400"> / {preferences.weeklyBudget} €</span>
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: store.bgColor, color: store.color }}
            >
              {store.name.split(' ')[0].slice(0, 4)}
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetColor}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Magasin : <strong className="text-slate-600">{store.name}</strong>
            {' · '}{preferences.servings} personnes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{plannedMeals}</p>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">repas planifiés</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-slate-700">{totalPossible - plannedMeals}</p>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">à planifier</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-slate-700">{preferences.servings}</p>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">personnes</p>
          </div>
        </div>

        {/* Today */}
        {todayDay && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-slate-800 mb-3 capitalize">
              Aujourd'hui — {todayDay}
            </h2>
            {MEAL_TYPES.map((mt) => {
              const recipeId = todayMenu?.[mt];
              const recipe = recipeId ? allRecipes.find(r => r.id === recipeId) : null;
              return (
                <div key={mt} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-lg">{MEAL_EMOJIS[mt]}</span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{MEAL_LABELS[mt]}</p>
                    {recipe ? (
                      <p className="text-sm font-semibold text-slate-700">
                        {recipe.emoji} {recipe.name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Non planifié</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/menu"
            className="bg-green-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-bold text-sm">Planifier</p>
              <p className="text-xs text-green-200">le menu</p>
            </div>
          </Link>
          <Link
            to="/courses"
            className="bg-white text-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <span className="text-2xl">🛒</span>
            <div>
              <p className="font-bold text-sm">Ma liste</p>
              <p className="text-xs text-slate-500">de courses</p>
            </div>
          </Link>
          <Link
            to="/recettes"
            className="bg-white text-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <span className="text-2xl">📖</span>
            <div>
              <p className="font-bold text-sm">Recettes</p>
              <p className="text-xs text-slate-500">Explorer</p>
            </div>
          </Link>
          <Link
            to="/preferences"
            className="bg-white text-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            <span className="text-2xl">⚙️</span>
            <div>
              <p className="font-bold text-sm">Réglages</p>
              <p className="text-xs text-slate-500">Préférences</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
