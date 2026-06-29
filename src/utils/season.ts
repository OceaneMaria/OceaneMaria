import { Recipe, Season } from '../types';

// Ingredients strongly associated with each season in Belgian/French cooking
const SEASON_PATTERNS: Record<Season, RegExp[]> = {
  printemps: [
    /\basperge/i,
    /\bfraise\b/i,
    /\bradis\b/i,
    /petit[\s-]pois/i,
    /\bartichaut/i,
    /\bf[eè]ve\b/i,
    /\brhubarbe/i,
    /oignon\s+nouveau/i,
    /ail\s+frais/i,
  ],
  été: [
    /\btomate\b/i,
    /\bcourgette/i,
    /\baubergine/i,
    /\bpoivron/i,
    /\bmelon\b/i,
    /\bp[eê]che\b/i,
    /\babricot/i,
    /\bcerise\b/i,
    /\bframboise/i,
    /\bmyrtille/i,
    /\bpast[eè]que/i,
    /haricot[\s-]vert/i,
    /\bconcombre/i,
    /\bma[iï]s\b/i,
    /\bnectarine/i,
  ],
  automne: [
    /potimarron/i,
    /\bpotiron\b/i,
    /butternut/i,
    /\bcourge\b/i,
    /\bc[eè]pe\b/i,
    /\bgirolle/i,
    /\bmorille/i,
    /ch[aâ]taigne/i,
    /\bfigue\b/i,
    /\braisin\b/i,
    /\bchanterelle/i,
    /\btopinambour/i,
  ],
  hiver: [
    /choux\s+de\s+bruxelles/i,
    /chou[\s-]fleur/i,
    /chou\s+rouge/i,
    /chou\s+fris[eé]/i,
    /\bbetterave/i,
    /c[eé]leri[\s-]rave/i,
    /\bpanais\b/i,
    /\bnavet\b/i,
    /\bm[aâ]che\b/i,
    /\bchicon\b/i,          // Belgian endive — very Belgian!
    /\bendive\b/i,
    /cl[eé]mentine/i,
    /\bmandarine\b/i,
    /\bsalsifis\b/i,
  ],
};

export function detectSeasons(recipe: Recipe): Season[] {
  const haystack = [
    recipe.name,
    recipe.description,
    ...recipe.ingredients.map(i => i.name),
  ].join(' ');

  const result: Season[] = [];
  for (const [season, patterns] of Object.entries(SEASON_PATTERNS) as [Season, RegExp[]][]) {
    if (patterns.some(p => p.test(haystack))) {
      result.push(season as Season);
    }
  }
  return result; // empty = "toutes saisons"
}

export function currentSeason(): Season {
  const m = new Date().getMonth() + 1; // 1-12
  if (m >= 3 && m <= 5) return 'printemps';
  if (m >= 6 && m <= 8) return 'été';
  if (m >= 9 && m <= 11) return 'automne';
  return 'hiver';
}
