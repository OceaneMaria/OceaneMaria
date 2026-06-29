import { Recipe, Ingredient, ShoppingCategory } from '../types';

function cat(name: string): ShoppingCategory {
  const n = name.toLowerCase();
  if (/poulet|dinde|agneau|viande|jambon|bacon|lardons|chorizo|prosciutto|canard|saucisse|cuisse/.test(n)) return 'Viandes';
  if (/saumon|thon|crevette|sardine|cabillaud|anchois/.test(n)) return 'Poissons';
  if (/\blait\b|crème|fromage|yaourt|skyr|beurre|\boeuf\b|\bœuf\b|mozza|feta|ricotta|gorgonzola|chèvre|parmesan|camembert|mascarpone|reblochon|emmental|cheddar|burrata|gruyère|madame loik|blanc d/.test(n)) return 'Produits laitiers & Œufs';
  if (/farine|chapelure|\briz\b|semoule|quinoa|vermicelles|polenta|lasagne|nouilles|naan|\bpain\b|levure|\bwrap\b|tortilla|gnocchi/.test(n)) return 'Boulangerie';
  if (/carotte|courgette|tomate|potimarron|butternut|oignon|épinard|concombre|patate|pomme de terre|pomme\b|brocoli|haricot|\bpois\b|lentille|maïs|mais\b|champignon|asperge|aubergine|poivron|roquette|basilic|coriandre|persil|menthe|thym|romarin|origan|gingembre|citron|orange|ananas|fraise|framboise|banane|échalote|ciboulette|pistache|\bnoix\b|amande|noisette|pecan|épice/.test(n)) return 'Fruits & Légumes';
  return 'Épicerie';
}

function ing(name: string): Ingredient {
  return { name, quantity: 1, unit: '', category: cat(name), pricePerUnit: 0 };
}

function ings(csv?: string): Ingredient[] {
  if (!csv) return [];
  return csv.split(',').map(s => s.trim()).filter(Boolean).map(ing);
}

function toId(name: string): string {
  return 'notion-' + name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function emoji(name: string): string {
  const n = name.toLowerCase();
  if (/soupe|velouté|potage|minestrone/.test(n)) return '🍲';
  if (/salade/.test(n)) return '🥗';
  if (/risotto/.test(n)) return '🍚';
  if (/pâtes|pasta|tagliatelle/.test(n)) return '🍝';
  if (/pizza/.test(n)) return '🍕';
  if (/tarte|quiche|flan/.test(n)) return '🥧';
  if (/wrap|sandwich|croque|toast/.test(n)) return '🥪';
  if (/poulet|chicken/.test(n)) return '🍗';
  if (/saumon|thon|poisson|crevette/.test(n)) return '🐟';
  if (/gnocchi/.test(n)) return '🥔';
  if (/\briz\b/.test(n)) return '🍚';
  if (/burger|bun/.test(n)) return '🍔';
  if (/crêpe|pancake|gaufre/.test(n)) return '🥞';
  if (/curry/.test(n)) return '🍛';
  if (/omelette|oeuf|œuf/.test(n)) return '🥚';
  if (/chips|frites/.test(n)) return '🍟';
  if (/gratin/.test(n)) return '🫕';
  if (/naan|bread|pain\b|brioche/.test(n)) return '🍞';
  if (/cookie/.test(n)) return '🍪';
  if (/muffin/.test(n)) return '🧁';
  if (/brownie|brookie/.test(n)) return '🍫';
  if (/chocolat/.test(n)) return '🍫';
  if (/glace|magnum|bounty/.test(n)) return '🍦';
  if (/gâteau|cake/.test(n)) return '🎂';
  if (/biscuit|sablé|oreo|cantuccini/.test(n)) return '🍪';
  if (/mousse|tiramisu|crème/.test(n)) return '🍮';
  if (/crumble/.test(n)) return '🥣';
  if (/barre|snickers|twix|kinder|schoko/.test(n)) return '🍫';
  if (/smoothie|jus|infusion|sirop|lait d'amande/.test(n)) return '🥤';
  if (/chamallow|guimauve/.test(n)) return '🍬';
  if (/caramel/.test(n)) return '🍮';
  return '🍽️';
}

// ─── MAIN SAVORY RECIPES ────────────────────────────────────────────────────
// [name, ingredients_csv, notion_tags, url?]
type RawMain = [string, string, string, string?];

const RAW_MAIN: RawMain[] = [
  ['Omelette concombre, madame Loïk, bacon, œufs, tomates', 'Madame loik, Oeufs, Tomates, bacon, ciboulette, concombre, persil plat, salade', 'Repas minute'],
  ['Omelette fêta, oignon, tomates, oeufs', 'Feta, Oeufs, Oignon rouge, Tomates', 'Repas minute'],
  ['Pâtes de courgettes et sa sauce', 'Courgettes, Fromage frais aux herbes, Tomates, crème liquide, pesto vert', ''],
  ['Velouté potimarron - lait de coco', 'Lait de coco, Oignon, Potimarron', 'Soupes'],
  ['Tarte fine feuilletée aux oignons rouges caramélisés, pommes de terre et camembert', 'Camembert, Oignon rouge, Pomme de terre, miel, pate feuilletée', 'Gourmand'],
  ['Soupe de potimarron', 'Ail, Oignon rouge, Parmesan, Potimarron, Tomates, basilic, crème liquide', 'Soupes'],
  ['Quiche butternut bacon mozza', 'Butternut, Mozza, Oeufs, Pâte brisée, bacon, crème liquide', ''],
  ['Butternut rôtie façon hasselback', 'Butternut, Curcuma, Feta, Noix, Paprika, Thym, miel, muscade, romarin', ''],
  ['Pâtes au Pesto de pistache', 'Ail, Parmesan, Pistache, basilic', ''],
  ['Pâtes prosciutto, Burrata et petit pois', 'Burrata, Petit pois, Prosciutto', ''],
  ['Wrap sain', '', ''],
  ['Pesto de courgettes', 'Ail, Burrata, Courgettes, Parmesan, basilic, noix de cajou', 'favourites'],
  ['Flan de courgettes feta menthe', 'Courgettes, Feta, Lait, Oeufs', ''],
  ['Tarte spirale carotte - courgette', 'Carotte, Courgettes, Curcuma, curry', ''],
  ['Chips maison à base de wrap', 'Paprika, Wrap', 'Pour recevoir'],
  ['Frites de courgettes', 'Citron, Courgettes, Farine, Origan, Paprika, Yaourt, chapelure', ''],
  ['Pâtes ricotta, courgettes, tomates cerises rôties', 'Ail, Courgettes, Origan, Ricotta, tomates cerises', 'favourites'],
  ['Salade provençale : pâtes, olives, tomates, poulet', 'Mozza, Oignon rouge, Poulet, Tomates, olives', ''],
  ['Curry de Courgettes', 'Concentré de tomates, Courgettes, Curcuma, Lait de coco, Oignon, basilic, cacahuète, curry', ''],
  ['Poulet teriyaki', 'Ail, Poulet, Sucre, maizena, miel, sauce soja, sesame', 'Gourmand'],
  ['Gnocchi à la tomate', 'Gnocchi, basilic, tomates cerises', ''],
  ['Boules de Mozza fondante', 'Farine, Mozza, Oeufs, chapelure', 'Gourmand'],
  ['Poti Ganouch Potimarron', 'Ail, Citron, Potimarron, cumin, persil, tahini', ''],
  ['Poulet ricotta & citron', 'Ail, Citron, Poulet, Ricotta, crème liquide, échalote', ''],
  ['Pâtes à la crème de Butternut', 'Ail, Burrata, Butternut, Oignon rouge, Ricotta', 'favourites'],
  ['Velouté carotte - coco - coriandre', 'Carotte, Citron, Curcuma, Lait de coco, coriandre, cumin', 'Soupes'],
  ['Wrap de poulet gourmand', 'Ail, Oignon rouge, Paprika, Poulet, chorizo, emmental, pesto rouge', 'Gourmand'],
  ['Velouté légumes rôtis - ricotta', 'Ail, Carotte, Creme de coco, Oignon, Paprika, Potimarron, miel, sauce soja, tomates cerises', 'Soupes'],
  ['Garcia bread', '', ''],
  ['Soupe à l\'oignon', 'Farine, Oignon, bouillon', 'Soupes'],
  ['Riz cantonnais', 'Oeufs, Petit pois, dés de jambon, riz', ''],
  ['Œuf cocotte au butternut', 'Butternut, Feta, crème liquide', ''],
  ['Gnocchi aux champignons et chèvre frais', 'Ail, Chèvre, Gnocchi, champignons', ''],
  ['Toast crème d\'ail & pois chiche grillés', 'Ail, Pois chiche, persil, philadelphia', ''],
  ['Pâtes à la crème de champignons & Burrata', 'Ail, Burrata, Oignon rouge, bouillon, champignons, crème liquide', ''],
  ['Pâtes au butternut rôti', 'Ail, Butternut, Parmesan, crème liquide, romarin', ''],
  ['Soupe de tomates rôties & grilled cheese', 'Ail, Chèvre, Oignon rouge, Tomates, basilic, cheddar, crème liquide, pain', 'Soupes'],
  ['Dwitch Tuna Melt', 'Cornichon, Oignon rouge, Pois chiche, Yaourt, cheddar, mayonnaise, pain', ''],
  ['Salade de pomme de terre', 'Oignon rouge, Pomme de terre, Vinaigre de cidre, basilic, moutarde, tomates cerises', ''],
  ['Salade de semoule & pois chiche', 'Feta, Oignon rouge, Pois chiche, Quinoa, basilic, concombre, miel, semoule', ''],
  ['Tarte Tatin de courgettes', 'Amandes effilées, Burrata, Courgettes, miel, pate feuilletée', ''],
  ['Tomates rôties & crème de feta', 'Ail, Citron, Feta, basilic, tomates cerises, yaourt grec', ''],
  ['Œufs cocotte pesto et tomates séchées', 'Oeufs, Parmesan, crème liquide, pesto vert, tomates séchées', ''],
  ['Risotto de champignons, miso & burrata', 'Ail, Burrata, champignons, miso, riz', ''],
  ['Crème de feta à la menthe', 'Ail, Citron, Feta, Pistache, Yaourt, menthe', ''],
  ['Soupe de pomme de terre', 'Oignon, Pomme de terre, bacon, bouillon, crème liquide, sirop d\'érable', 'Soupes'],
  ['Potimarron, champignons & œuf poché', 'Feta, Oeufs, Oignon, Potimarron, champignons, crème liquide, sauce soja', ''],
  ['Salade concombre, tomates cerises, poulet', '', ''],
  ['Pizza pumpkin', 'Mozza, jambon, purée de tomates', 'Pour recevoir'],
  ['Tresse de pizza au saumon et fromage frais aux herbes', 'Aneth, Fromage frais aux herbes, Pâte à pizza, saumon', ''],
  ['Pancakes à la courgette', 'Bûche de chèvre, Courgettes, Farine, Fromage blanc, Lait, Oeufs, jambon, levure', ''],
  ['Soupe de courgette & kiri', 'Courgettes, Oignon, Pomme de terre, bouillon, ciboulette, kiri', 'Soupes'],
  ['Curry de Butternut', 'Ail, Butternut, Lait de coco, Oignon, curry, noix de cajou', ''],
  ['Potato Bread', 'Farine, Mozza, Origan, Pomme de terre, Yaourt', 'Gourmand'],
  ['Amuses-bouche maison', '', 'Pour recevoir'],
  ['Cheese naan au curry de poulet', 'Poulet, Pâte à pizza, cheddar, ciboulette, crème liquide, curry', 'Gourmand'],
  ['Pâtes tomates cerises, speck et burrata', 'Burrata, Prosciutto, tomates cerises', ''],
  ['Gnocchi à la crème de butternut', 'Burrata, Butternut, Echalote, Gnocchi, Prosciutto, crème liquide', ''],
  ['Pain perdu aux champignons', 'Ail, Lait, Oeufs, Parmesan, champignons, pain', ''],
  ['Gnocchi gorgonzola et champignons', 'Ail, Gnocchi, Origan, Paprika, bouillon, champignons, crème épaisse, gorgonzola', ''],
  ['Crackers sésame et fromage', 'Farine, Gruyère, flocons d\'avoine, levure', ''],
  ['Pesto Rosso', 'Ail, Parmesan, amandes, basilic, pignons de pins, tomates séchées', ''],
  ['Velouté de potimarron', 'Ail, Carotte, Oignon, Pomme de terre, Potimarron, bouillon, crème liquide', 'Soupes'],
  ['Poulets et champignons rôtis', 'Ail, Oignon rouge, Pomme de terre, Poulet, bouillon, champignons, crème fraiche, persil', ''],
  ['Velouté butternut - coco', '', 'Soupes'],
  ['Pâtes aux oignons caramélisés', 'Oignon, crème liquide', ''],
  ['Sauce feta ail citron / patate douce rôtie', 'Ail, Citron, Feta, Oignon rouge, Paprika, Patate douce, Yaourt, chapelure, miel', ''],
  ['Minis tatins à la carotte', 'Carotte, Oignon, Paprika, Parmesan, Pâte brisée, Thym, miel, sauce soja', ''],
  ['Tarte champignons, oignons et gorgonzola', 'Oignon, Pâte brisée, Sucre, champignons, crème fraiche, gorgonzola, persil', ''],
  ['Risotto aux champignons', 'Oignon, champignons, riz, vin blanc', ''],
  ['Poulet coco', 'Lait de coco, Poulet, curry, gingembre, huile de coco', ''],
  ['Polenta', 'Polenta', ''],
  ['Gratin de courgettes au chèvre', 'Ail, Bûche de chèvre, Courgettes, Oeufs, Oignon, crème liquide', ''],
  ['Gratin dauphinois', 'Ail, Pomme de terre, crème liquide', ''],
  ['Quiche lorraine', 'Lait, Oeufs, Pâte brisée, crème liquide, emmental, lardons', ''],
  ['Croque monsieur', 'Lait, Oeufs, emmental, jambon, pain', ''],
  ['Salade caesar', 'Oeufs, Poulet, salade', ''],
  ['Oeufs mimosa', 'Oeufs, mayonnaise, sardines', ''],
  ['Cuisse de dinde au romarin', 'Ail, Cuisse de dinde, Pomme de terre, huile d\'olive, romarin', ''],
  ['Poulet au noix de cajou', 'Farine, Poulet, coriandre, noix de cajou, nouilles chinoises, sauce soja', ''],
  ['Gyoza', '', ''],
  ['Crêpe d\'avoine', 'Lait, Oeufs, flocons d\'avoine', ''],
  ['Salade tomate, maïs, skyr, citron, ail et thon', 'Ail, Citron, Skyr, Tomates, maïs, thon', ''],
  ['Jardinière de légumes', 'Oignon, Pomme de terre, haricots verts, lardons', ''],
  ['Tarte au camembert', '', 'Gourmand'],
  ['Quiche fêta olive', 'Feta, Oeufs, Pâte brisée, crème liquide, olives', 'favourites'],
  ['Riz pesto vert tomates cerises et poulet', 'Poulet, pesto vert, riz, tomates cerises', ''],
  ['Riz au curry', 'crème liquide, curry, riz', ''],
  ['Rillettes de thon', 'Cornichon, ketchup, mayonnaise, tabasco, thon, échalote', 'Pour recevoir'],
  ['Verrines de saumon fumé et ricotta', 'Aneth, Citron, Ricotta, ciboulette, crème fraiche, saumon', 'Pour recevoir'],
  ['Gnocchi maison', 'Farine, Oeufs, Pomme de terre', 'favourites'],
  ['Nacho cheese doritos', 'Ail, Chili, Levure maltée, Oignon, Paprika, Wrap', 'Pour recevoir'],
  ['Tarte à la tomate', 'Mozza, Origan, Pâte brisée, Tomates, moutarde, olives', 'favourites'],
  ['Tarte potimarron camembert', 'Ail, Camembert, Feuilles filo, Oeufs, Oignon rouge, Paprika, Potimarron, Thym, crème liquide', ''],
  ['Wrap de courge ou de potimarron', '', ''],
  ['Tarte butternut, compote d\'oignons, gorgonzola et noix', 'Butternut, Noix, Oignon, gorgonzola', ''],
  ['Velouté de champignons', 'Oignons, Pomme de terre, Ricotta, bouillon, champignons', 'Soupes'],
  ['Raclette', '', ''],
  ['Nems de poulet', 'Carotte, Feuille de riz, Oignons, Poulet, Vermicelles de riz, sauce soja', ''],
  ['Wraps aux épinards', 'Epinard, Farine, Jus de citron', ''],
  ['Boulettes de poulet yakitori', 'Oignons, Poulet, Sucre, chapelure, ciboulette, gingembre, maizena, sauce soja', ''],
  ['Carottes rôties sauce ricotta/feta', 'Ail, Carotte, Echalote, Paprika, huile d\'olive, persil, sirop d\'érable', ''],
  ['Lasagnes de champignons et chèvre', 'Ail, Beurre, Chèvre, Echalote, Farine, Parmesan, Pâte à lasagne, Ricotta, champignons, crème liquide, persil', ''],
  ['Gnocchi rapide à la patate douce', 'Farine, Patate douce, Sel', ''],
  ['Houmous de lentilles corail', 'Ail, Jus de citron, Lentilles corails, tahini', ''],
  ['Pancake coréen (Pajeon)', 'Farine, Légumes au choix, eau, maizena', ''],
  ['Frites de patates douces', 'Ail, Citron, Patate douce, Vinaigre de cidre, gingembre, mayonnaise, moutarde, sauce soja, sirop d\'érable', ''],
  ['Mayonnaise allégée et vegan au tofu', 'Huile, Tofu soyeux, Vinaigre de cidre, moutarde', ''],
  ['Chips sans matière grasse', 'Pomme de terre', ''],
  ['Pâtes sauce épinard', 'Ail, Chili, Citron, Epinard, Skyr, basilic', ''],
  ['Tagliatelles de carottes', 'Carotte, Oignon, Paprika, Parmesan, huile d\'olive', ''],
  ['Légumes rôtis sauce cacahuète coco', 'Ail, Beurre de cacahuète, Carotte, Creme de coco, Paprika, Patate douce, huile d\'olive, miel, sauce soja, tahini', ''],
  ['Tomates bien mûres mozza bistro', 'Mozza, Tomates, basilic', ''],
  ['Salade de pâtes', 'Ail, Origan, Poulet, Pâtes, Vinaigre balsamique, basilic, huile d\'olive, olives, tomates cerises', ''],
  ['Salade quinoa / semoule printanière', 'Feta, Oignon rouge, Pois chiche, Quinoa, basilic, concombre, huile d\'olive, miel, semoule', ''],
  ['Concombre farci', 'Jus de citron, Madame loik, ciboulette, concombre, thon, échalote', 'favourites'],
  ['Crumble d\'oignon', '', ''],
  ['Bruschetta italienne', '', '', 'https://www.instagram.com/reel/C-Cyy09MSWS/?igsh=MXJtOWg5N3luMGQzag=='],
  ['Salade de riz croustillant, courgette rôtie, feta & sauce miel/citron/origan', '', '', 'https://www.instagram.com/reel/C7HfWVKCk9H/?igsh=M2xkZ3UxdHRvOXU4'],
  ['Tarte / pizza oignons, champignons et Boursin', '', ''],
  ['Naan de légumes rôtis', 'Carotte, Mozza rapée, Oignons, Poireaux, pate à pizza, sauce soja sucré, sirop d\'érable', ''],
  ['Tarte à la courgette, pesto, ricotta, burrata', 'Burrata, Courgettes, Oignons, Ricotta, huile d\'olive, miel, pesto vert', ''],
  ['Purée de carottes', 'Beurre, Carotte, Echalote, bouillon', ''],
  ['Sandwich pâte à pizza', '', ''],
  ['Crèmes brûlées au saumon', '', ''],
  ['Flammekueche poireaux', 'Fromage blanc, Poireaux, Reblochon, lardons', ''],
  ['Gaufre de riz', 'riz', ''],
  ['Salade de pomme de terre yaourt et concombre', 'Pomme de terre', ''],
  ['Maïs grillé apéro', '', ''],
  ['Tartinade de chorizo', '', ''],
  ['Pâtes tomates confites et burrata', '', ''],
  ['Boulettes de riz type chinois', '', ''],
  ['Épaule d\'agneau confite, patate douce et sauce blanche', '', ''],
  ['Tarte wrap triangle poulet curry', '', ''],
  ['Wraps de courgettes', '', ''],
  ['Potato bun burger', '', ''],
  ['Gâteaux apéro', '', 'Pour recevoir'],
  ['Tarte d\'été', '', ''],
  ['Bricks pomme de terre, viande hachée et kiri', '', ''],
  ['Butter chicken', '', ''],
  ['Tarte aux légumes crus', '', ''],
  ['Mc Butter chicken', '', ''],
  ['Mc tajine de poulet aux olives', '', ''],
  ['Osso bucco', '', ''],
  ['Mc minestrone', '', 'Soupes'],
  ['Le tofu magique', '', ''],
  ['Soupe / purée de lentilles corail', '', 'Soupes'],
];

// ─── DESSERT RECIPES ────────────────────────────────────────────────────────
// [name, ingredients_csv, notion_labels]
type RawDessert = [string, string, string];

const RAW_DESSERTS: RawDessert[] = [
  ['Quatre-quarts à l\'ananas', 'Ananas en boite, Farine, beurre, levure, oeuf, sucre roux', 'gâteaux'],
  ['Pancake au yaourt', 'Farine, Sucre vanillé, Yaourt, levure, oeuf', 'matin'],
  ['Pâte à crêpe', 'Farine, Lait, bière, huile, oeuf', 'Healthy, matin'],
  ['Cookie Dough', '', 'Desserts minutes, gâteaux'],
  ['Mug cake consistant', 'Chocolat en poudre, Farine, Lait, Sucre vanillé, huile, sucre roux', 'Desserts minutes'],
  ['Cookie healthy', 'Cacao non sucré, Compote, Farine, Flocons d\'avoine, Miel', 'Healthy'],
  ['After eight maison', 'Beurre de coco, Chocolat noir, Huile de coco, Menthe poivrée, Miel', 'gâteaux'],
  ['Torsade de chocolat en pâte feuilletée', 'Chocolat, Pâte feuilletée', 'gâteaux'],
  ['Cakes healthy', '', 'Healthy, gâteaux'],
  ['Muffins à la banane sans gras ni sucre', 'Banane, Farine, Noix de coco râpé, Poudre de lin, Pépites de chocolat, levure', 'Healthy, gâteaux'],
  ['Barres de céréales healthy', 'Amandes, Beurre de cacahuète, Cacahuète, Chocolat noir, Flocons d\'avoine, Graines de chia, Graines de sésame, Huile de coco, Noisettes', 'Healthy, matin'],
  ['Creusois', 'Blanc d\'oeuf, Farine, Noisette en poudre, Noisettes, Praline noisette, Sucre', 'gâteaux'],
  ['Gâteau sans cuisson pomme-chocolat', 'Cacao non sucré, Chocolat noir, Pomme', 'Desserts minutes, Healthy'],
  ['Bounty glacé maison', 'Chocolat, Crème de coco, Extrait de vanille, Noix de coco râpé, Sirop d\'agave', 'Healthy'],
  ['Cookies fourrés au speculoos', 'Chocolat blanc, Farine, Pâte de spéculoos, Sucre, beurre', 'grandes occasions'],
  ['Muffins healthy au chocolat', 'Banane, Farine, Pépites de chocolat, Skyr, levure, oeuf', 'Healthy'],
  ['Cookies à la pistache', 'Chocolat blanc, Farine, Purée de pistache, Sucre, beurre, sucre roux', 'grandes occasions'],
  ['Desserts au chocolat version healthy', 'Chocolat', 'Healthy'],
  ['Barres de graines au chocolat et fleur de sel', 'Amandes, Chocolat noir, Fleur de sel, Graines de courges, Graines de sésame, Graines de tournesols, Noisettes, Noix de pecan, Sirop d\'erable', 'Healthy'],
  ['Biscuits industriels faits maison', '', 'gâteaux'],
  ['Goûter aux pommes', 'Canelle, Lait, Pomme, Pâte feuilletée, sucre roux', 'gâteaux'],
  ['Crumble Cookie', 'Chocolat au lait, Farine, Pâte à tartiner, beurre, levure, oeuf, sucre roux', 'Desserts minutes'],
  ['Pâte à tartiner au butternut', 'Butternut, Chocolat, Lait vegetal', 'Healthy'],
  ['Marbré light', 'Chocolat, Compote, Extrait de vanille, Farine, levure, oeuf', 'Healthy'],
  ['Carrot cake', 'Bicarbonate, Canelle, Carotte, Compote, Farine, Gingembre, Muscade, Noix de pecan, Purée d\'amandes, Sucre de coco, levure', 'Healthy, gâteaux'],
  ['Tiramisu pistache', 'Cafe, Crème de pistache, Crème fouettee, Huile de coco, Mascarpone, Pistache, Vanille', 'grandes occasions'],
  ['Apple crumble muffins', 'Bicarbonate, Canelle, Extrait de vanille, Farine, Huile de coco, Lait d\'amande, Pomme, Yaourt grec, levure, oeuf, sucre roux', 'grandes occasions, gâteaux'],
  ['Magnum cacahuète', 'Beurre de cacahuète, Cacahuète, Chocolat noir, Fromage blanc, Miel', 'Healthy'],
  ['Gâteau au chocolat sans matière grasse ajoutée', 'Chocolat, Compote, Farine, Sucre, oeuf', 'Healthy, gâteaux'],
  ['Brookie', 'Chocolat noir, Crème liquide, Farine, beurre, levure, oeuf, sucre roux', 'gâteaux'],
  ['Maxi cookie à la banane', 'Banane, Chocolat, Farine, levure, oeuf', 'Desserts minutes, Healthy'],
  ['Barre façon bounty', 'Cacao non sucré, Crème de coco, Flocons d\'avoine, Huile de coco, Noix de coco râpé, Poudre d\'amandes, Sirop d\'agave', 'Healthy'],
  ['Barre riz soufflé au chocolat', 'Chocolat, Riz, Sirop d\'agave, huile', 'Healthy'],
  ['Oreo maison', 'Bicarbonate, Cacao non sucré, Farine, Sucre, beurre, levure, oeuf', 'gâteaux'],
  ['Invisible aux pommes', 'Farine, Lait, Pomme, Sucre, beurre, levure, oeuf', 'Healthy, gâteaux'],
  ['Snickers maison', 'Beurre de cacahuète, Cacahuète, Chocolat noir, Flocons d\'avoine, Huile de coco, Sirop d\'agave', 'gâteaux'],
  ['Cake pomme - coco', 'Extrait de vanille, Farine, Huile de coco, Noix de coco râpé, Pomme, Sucre, Yaourt, levure, oeuf', 'Healthy, gâteaux'],
  ['Fondant au chocolat', 'Chocolat, Compote, Farine, Huile de coco, oeuf', 'Desserts minutes, Healthy'],
  ['Mousse au chocolat légère', 'Blanc d\'oeuf, Chocolat, Sucre', 'Desserts minutes, Healthy'],
  ['Maxi cookie mou géant', 'Chocolat blanc, Chocolat noir, Farine, Sucre vanillé, beurre, levure, oeuf, sucre roux', 'Desserts minutes'],
  ['Lemon cake', 'Citron, Farine, Sucre, beurre, levure, oeuf', 'gâteaux'],
  ['Gâteau au chocolat vraiment healthy', 'Chocolat, Farine, Fromage blanc, oeuf', 'Healthy'],
  ['Mini tourtes à la pomme', 'Canelle, Farine, Pomme, huile, sucre roux', 'Healthy'],
  ['Pâte à crêpes vegan', 'Eau, Farine, Lait, Rhum ambré, Sucre, huile', 'Desserts minutes, Healthy, matin'],
  ['Mousse au chocolat à l\'eau', 'Chocolat, Eau', ''],
  ['Lait d\'amande et cookies', 'Amandes, Pépites de chocolat', ''],
  ['Peanut butter cookie cake', 'Beurre de cacahuète, Chocolat, Farine d\'avoine, Fleur de sel, Lait, Sirop d\'erable, Sucre de coco, Vanille, levure', ''],
  ['Oatmeal choc chip bars', 'Beurre de cacahuète, Farine d\'avoine, Flocons d\'avoine, Graines de lin, Huile de coco, Pépites de chocolat, Sirop d\'erable, Sucre de coco, Vanille', ''],
  ['Crème au chocolat', 'Chocolat, Lait de coco', 'Healthy'],
  ['Gâteau chocolat - banane', 'Banane, Chocolat noir, Lait de coco non allégée', 'Healthy'],
  ['Oreo', 'Cacao non sucré, Farine, Huile de coco, Sucre, beurre', 'gâteaux'],
  ['Galette des rois healthy', 'Crème liquide, Extrait d\'amande amère, Huile de coco, Maïzena, Poudre d\'amandes, Sucre', 'grandes occasions, gâteaux'],
  ['Gâteau aux pommes', 'Compote, Extrait de vanille, Farine, Huile d\'olive, Pomme, Sucre, beurre, levure', 'gâteaux'],
  ['Biscuits de Noël', 'Farine, Sucre, huile', 'gâteaux'],
  ['Pain suisse vegan', 'Crème de soja, Lait, Maizena, Pâte feuilletée, Pépites de chocolat, Sucre, Vanille, huile', ''],
  ['Quatre quarts vegan', 'Bicarbonate, Compote, Farine, Lait, Margarine, Sucre, Vanille, Vinaigre de cidre, Yaourt grec, huile, levure', 'gâteaux'],
  ['Pancakes vegan', 'Bicarbonate, Farine, Lait, Margarine, Sucre, Vanille, Vinaigre de cidre, levure', 'matin'],
  ['Muffins au chocolat', 'Bicarbonate, Cacao non sucré, Compote, Farine, Lait vegetal, Pépites de chocolat, Sucre, Vanille, Vinaigre de cidre, Yaourt grec, huile, levure', ''],
  ['Nutella vegan', 'Noisettes, Sucre de coco, huile', ''],
  ['Gâteau au fromage blanc et pépites de chocolat', 'Fromage blanc, Maizena, Pépites de chocolat, Sucre, oeuf', 'gâteaux'],
  ['Tarte chocolat banane', 'Farine, Huile de coco, Poudre d\'amandes, Sucre de coco, oeuf', ''],
  ['Brownie enneigé', '', 'grandes occasions'],
  ['Cookies Brownie', '', 'grandes occasions'],
  ['Gaufre liégeoise', '', ''],
  ['Roses des sables', 'Chocolat noir, Corn flakes, Sucre glace, beurre', ''],
  ['Crumble aux pommes', 'Pomme', ''],
  ['Tarte au citron meringuée', 'Citron, Farine, beurre, oeuf', 'grandes occasions'],
  ['Brioche au cœur chocolat', '', ''],
  ['Cœurs citron', '', 'grandes occasions'],
  ['Chantilly menthe chocolat', '', ''],
  ['Pomme d\'amour', '', ''],
  ['Brochettes de guimauve et framboise', '', ''],
  ['Gâteau au chocolat et haricots rouges', 'Chocolat noir, haricots rouges', 'Healthy'],
  ['Carot cake facile', '', 'gâteaux'],
  ['Brookie Vegan', '', 'gâteaux'],
  ['Brookie mega fondant', '', 'gâteaux'],
  ['Chamallow maison', '', ''],
  ['Twix maison', '', ''],
  ['Riz soufflé chocolat', '', ''],
  ['Brownie', '', 'gâteaux'],
  ['Kinder Délice maison', '', ''],
  ['Biscuits coco pomme', '', ''],
  ['Biscuits café sans gluten', '', ''],
  ['Brioche express sans farine', '', ''],
  ['Cinnamon rolls mug cake', '', 'Desserts minutes'],
  ['Fondant chocolat au lait et spéculoos', '', 'gâteaux'],
  ['Ultra fondant chocolat et cacahuète', '', 'gâteaux'],
  ['Caramel au beurre salé', '', ''],
  ['Schoko bon maison', '', ''],
  ['Brownie menthe chocolat', '', 'gâteaux'],
  ['Cantuccini', '', ''],
  ['Brownie à la compote', '', 'Healthy'],
  ['Glace cookie dough', '', ''],
  ['Gâteau Pumpkin spice latte', '', 'gâteaux'],
  ['Ultra fondant au chocolat', '', 'gâteaux'],
  ['Pain au cacao', '', ''],
  ['Gâteau au yaourt', 'Farine, Lait, Yaourt, huile, levure, oeuf', 'Desserts minutes, gâteaux, matin'],
];

// ─── DRINK RECIPES ──────────────────────────────────────────────────────────
// [name, ingredients_csv, meal: 'breakfast'|'dinner']
type RawDrink = [string, string, 'breakfast' | 'dinner'];

const RAW_DRINKS: RawDrink[] = [
  ['Mocktail blueberry', '', 'dinner'],
  ['Sirop mojito', '', 'dinner'],
  ['Lait de poule au rhum', '', 'dinner'],
  ['Ice Tea Pastèque', 'Citron vert, Pastèque, menthe, thé vert', 'dinner'],
  ['Infusion pour les envies de sucre', 'Canelle, Pomme, sauge', 'breakfast'],
  ['Infusion CCF', 'Coriandre, cumin, fenouil', 'breakfast'],
  ['Green smoothie', 'Ananas, Citron vert, Epinard, Gingembre, Noix de coco râpée, Pomme, Spiruline', 'breakfast'],
];

// ─── TRANSFORM FUNCTIONS ────────────────────────────────────────────────────

function transformMain(raw: RawMain): Recipe {
  const [name, ingCsv, tags, url] = raw;
  const isSoup = /Soupes/.test(tags);
  const isQuick = /Repas minute/.test(tags);
  return {
    id: toId(name),
    name: name.trim(),
    description: '',
    mealType: isSoup ? 'lunch' : 'dinner',
    dietaryTags: [],
    ingredients: ings(ingCsv),
    servings: 2,
    prepTime: isQuick ? 15 : 30,
    cookTime: isQuick ? 5 : 20,
    emoji: emoji(name),
    ...(url ? { sourceUrl: url } : {}),
    isCustom: false,
  };
}

function transformDessert(raw: RawDessert): Recipe {
  const [name, ingCsv, labels] = raw;
  const isMorning = /matin/i.test(labels);
  const isHealthy = /Healthy/i.test(labels);
  const isQuick = /Desserts minutes/i.test(labels);
  const dietaryTags = isHealthy ? (['healthy'] as const) : [];
  return {
    id: toId(name),
    name: name.trim(),
    description: '',
    mealType: isMorning ? 'breakfast' : 'dinner',
    dietaryTags: [...dietaryTags],
    ingredients: ings(ingCsv),
    servings: 4,
    prepTime: isQuick ? 10 : 25,
    cookTime: isQuick ? 5 : 25,
    emoji: emoji(name),
    isCustom: false,
  };
}

function transformDrink(raw: RawDrink): Recipe {
  const [name, ingCsv, mealType] = raw;
  return {
    id: toId(name),
    name: name.trim(),
    description: '',
    mealType,
    dietaryTags: ['vegan'],
    ingredients: ings(ingCsv),
    servings: 2,
    prepTime: 5,
    cookTime: 0,
    emoji: emoji(name),
    isCustom: false,
  };
}

// ─── EXPORTED RECIPES ───────────────────────────────────────────────────────

export const NOTION_RECIPES: Recipe[] = [
  ...RAW_MAIN.map(transformMain),
  ...RAW_DESSERTS.map(transformDessert),
  ...RAW_DRINKS.map(transformDrink),
];
