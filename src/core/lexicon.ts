// Word lists used by the rules. Plain data; extend freely.
import type { Concept, Country, Currency, Section } from "./types";

export const COUNTRY_CURRENCY: Record<Country, Currency> = {
  AE: "AED", GB: "GBP", US: "USD", IN: "INR", SG: "SGD",
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  AED: "AED ", GBP: "£", USD: "$", INR: "₹", SGD: "S$",
};

// Tokens that indicate a currency next to a price, mapped to ISO code.
export const CURRENCY_TOKENS: [RegExp, Currency][] = [
  [/^(aed|dhs?|dirhams?|د\.إ)$/i, "AED"],
  [/^(£|gbp)$/i, "GBP"],
  [/^(s\$|sgd)$/i, "SGD"],
  [/^(\$|usd|us\$)$/i, "USD"],
  [/^(₹|rs\.?|inr|rupees?)$/i, "INR"],
];

// Heading text → section. First match wins, so specific before generic.
export const SECTION_KEYWORDS: [Section, RegExp][] = [
  ["kids", /\b(kids?|children|little ones)\b/i],
  ["breakfast", /\b(breakfast|brunch|all[- ]day|eggs?|morning)\b/i],
  ["coffee", /\b(coffee|espresso|brew|latte)\b/i],
  ["tea", /\b(teas?|chai|infusions?|matcha)\b/i],
  ["alcohol", /\b(wines?|beers?|cocktails?|spirits?|whisk(e)?y|gin|bar|ales?|champagne|prosecco)\b/i],
  ["drinks", /\b(drinks?|beverages?|juices?|shakes?|smoothies?|mocktails?|soft drinks?|coolers?|lassi|sodas?)\b/i],
  ["desserts", /\b(desserts?|sweets?|puddings?|mithai|ice ?creams?|gelato)\b/i],
  ["bakery", /\b(bakery|pastr(y|ies)|cakes?|viennoiserie|bakes|cookies|croissants?)\b/i],
  ["soups", /\b(soups?|shorba)\b/i],
  ["salads", /\b(salads?|bowls?)\b/i],
  ["sharing", /\b(sharing|to share|platters?|mezze|meze|tapas|small plates)\b/i],
  ["starters", /\b(starters?|appeti[sz]ers?|small bites|bites|snacks?|nibbles|chaat|entr[eé]es? (?!principal))\b/i],
  ["grill", /\b(grill|tandoor|bbq|barbecue|kebabs?|charcoal|robata)\b/i],
  ["pasta_pizza", /\b(pasta|pizzas?|risotto|noodles?)\b/i],
  ["burgers_sandwiches", /\b(burgers?|sandwich(es)?|wraps?|rolls?|toasties?|subs?|bagels?)\b/i],
  ["rice_breads", /\b(rice|biryani|breads?|naan|roti|pulao|parathas?)\b/i],
  ["sides", /\b(sides?|accompaniments?|vegetables|veg)\b/i],
  ["extras", /\b(add[- ]?ons?|extras?|toppings?|sauces?|dips?)\b/i],
  ["mains", /\b(mains?|main courses?|large plates|from the kitchen|entr[eé]es|curries|curry|specials?|signatures?|plates?)\b/i],
];

export const FOOD_SECTIONS: Section[] = [
  "breakfast", "starters", "soups", "salads", "mains", "grill", "pasta_pizza",
  "burgers_sandwiches", "rice_breads", "sharing", "kids", "bakery", "desserts",
];
export const DRINK_SECTIONS: Section[] = ["coffee", "tea", "drinks", "alcohol"];

// Ideal ranges, by concept. Sources: common menu-engineering practice; they are
// PIHOCO defaults and can be tuned in one place.
export const CONCEPT_NORMS: Record<Concept, { totalItems: [number, number]; perCategory: [number, number]; categories: [number, number] }> = {
  restaurant:    { totalItems: [25, 60], perCategory: [4, 9],  categories: [4, 10] },
  cafe:          { totalItems: [18, 50], perCategory: [4, 10], categories: [4, 10] },
  bar:           { totalItems: [15, 45], perCategory: [4, 10], categories: [3, 9] },
  cloud_kitchen: { totalItems: [15, 40], perCategory: [3, 8],  categories: [3, 8] },
  qsr:           { totalItems: [10, 35], perCategory: [3, 8],  categories: [3, 7] },
};

export const SENSORY = [
  "crisp", "crispy", "crunchy", "silky", "velvety", "creamy", "smoky", "charred", "charcoal", "tangy", "zesty",
  "fragrant", "aromatic", "rich", "buttery", "flaky", "tender", "juicy", "sticky", "spiced", "fiery", "warm",
  "golden", "fresh", "bright", "delicate", "hearty", "melting", "caramelised", "caramelized", "toasted", "nutty",
  "sweet", "sour", "bitter", "peppery", "herby", "earthy", "fluffy", "pillowy", "glazed", "blistered", "succulent",
];
export const METHODS = [
  "slow-cooked", "slow cooked", "braised", "roasted", "roast", "grilled", "chargrilled", "tandoor", "tandoori",
  "smoked", "fried", "pan-fried", "deep-fried", "seared", "poached", "baked", "wood-fired", "stone-baked",
  "steamed", "confit", "cured", "marinated", "pickled", "fermented", "hand-made", "handmade", "house-made",
  "homemade", "hand-pulled", "hand-cut", "dum", "tawa", "clay oven", "wok", "flame", "open fire",
];
export const ORIGIN = [
  "local", "farm", "free-range", "free range", "organic", "wild", "heritage", "single-origin", "single origin",
  "line-caught", "grass-fed", "aged", "dry-aged", "seasonal", "market", "artisan", "family recipe", "grandmother",
  "nani", "dadi", "ammi", "house", "our own", "signature", "chef's", "chefs",
];
export const SIGNATURE_MARKERS = /(signature|chef'?s (special|pick|choice|recommendation)|house special|our famous|best ?seller|must[- ]try|★|⭐|\bnew\b|bestseller|popular)/i;
export const DIETARY_MARKERS = /(\(v\)|\(vg\)|\(gf\)|\(df\)|\(n\)|\bvegan\b|\bvegetarian\b|gluten[- ]free|dairy[- ]free|\bjain\b|\bhalal\b|contains nuts|\bnut[- ]free\b|🌱|🌶)/i;
export const ADDON_MARKERS = /(^\+|\badd\b|\bextra\b|\bupgrade\b|\bmake it\b|\bwith (a )?side\b|\btopping|\bside of\b|\bon the side\b)/i;
export const COMBO_MARKERS = /(combo|meal deal|\bset\b|\bthali\b|bundle|\bfor two\b|\bfor 2\b|platter|\btasting\b|\bduo\b|\btrio\b|\bbox\b|\bpairing\b|\bfeast\b|\bmeal\b)/i;

// Spelling clean-up before dish matching.
export const ABBREVIATIONS: [RegExp, string][] = [
  [/\bchkn\b|\bchk\b|\bckn\b/g, "chicken"], [/\bw\/\s?/g, "with "], [/&/g, " and "],
  [/\bveg\b/g, "vegetable"], [/\bmasala\b/g, "masala"], [/\bspl\b/g, "special"],
  [/\bsrvd\b/g, "served"], [/\bpcs?\b/g, "pieces"], [/\bbbq\b/g, "barbecue"],
  [/\bmakhni\b|\bmakhanwala\b/g, "makhani"], [/\btikkah\b/g, "tikka"], [/\bbiriyani\b|\bbiryanee\b/g, "biryani"],
  [/\bcappucino\b|\bcapuccino\b/g, "cappuccino"], [/\bexpresso\b/g, "espresso"], [/\bcroissant\b/g, "croissant"],
];

export const STOPWORDS = new Set([
  "the", "a", "an", "of", "with", "and", "in", "on", "our", "house", "style", "special", "classic", "fresh",
  "signature", "homemade", "served", "w", "de", "la", "le", "al", "di", "e", "ka", "ki", "wala", "wali",
]);

export const PROTEINS: [string, RegExp][] = [
  ["chicken", /\b(chicken|murgh|murg|poulet|pollo|dajaj|tawook|tavuk)\b/i],
  ["lamb", /\b(lamb|mutton|gosht|ghosht|lahm|agneau|goat)\b/i],
  ["beef", /\b(beef|steak|wagyu|brisket|ribeye|sirloin|veal)\b/i],
  ["pork", /\b(pork|bacon|ham|chorizo|pancetta|prosciutto|guanciale)\b/i],
  ["fish", /\b(fish|salmon|cod|tuna|seabass|sea bass|hammour|halibut|machli|mahi|haddock|sole)\b/i],
  ["seafood", /\b(prawns?|shrimps?|jhinga|lobster|crab|squid|calamari|mussels?|scallops?|octopus)\b/i],
  ["paneer", /\b(paneer|halloumi|cottage cheese)\b/i],
  ["tofu", /\b(tofu|tempeh|seitan)\b/i],
  ["egg", /\b(eggs?|omelette|omelet|anda|benedict|shakshuka)\b/i],
];
