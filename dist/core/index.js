// src/core/lexicon.ts
var COUNTRY_CURRENCY = {
  AE: "AED",
  GB: "GBP",
  US: "USD",
  IN: "INR",
  SG: "SGD"
};
var CURRENCY_SYMBOL = {
  AED: "AED ",
  GBP: "\xA3",
  USD: "$",
  INR: "\u20B9",
  SGD: "S$"
};
var CURRENCY_TOKENS = [
  [/^(aed|dhs?|dirhams?|د\.إ)$/i, "AED"],
  [/^(£|gbp)$/i, "GBP"],
  [/^(s\$|sgd)$/i, "SGD"],
  [/^(\$|usd|us\$)$/i, "USD"],
  [/^(₹|rs\.?|inr|rupees?)$/i, "INR"]
];
var SECTION_KEYWORDS = [
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
  ["mains", /\b(mains?|main courses?|large plates|from the kitchen|entr[eé]es|curries|curry|specials?|signatures?|plates?)\b/i]
];
var FOOD_SECTIONS = [
  "breakfast",
  "starters",
  "soups",
  "salads",
  "mains",
  "grill",
  "pasta_pizza",
  "burgers_sandwiches",
  "rice_breads",
  "sharing",
  "kids",
  "bakery",
  "desserts"
];
var DRINK_SECTIONS = ["coffee", "tea", "drinks", "alcohol"];
var CONCEPT_NORMS = {
  restaurant: { totalItems: [25, 60], perCategory: [4, 9], categories: [4, 10] },
  cafe: { totalItems: [18, 50], perCategory: [4, 10], categories: [4, 10] },
  bar: { totalItems: [15, 45], perCategory: [4, 10], categories: [3, 9] },
  cloud_kitchen: { totalItems: [15, 40], perCategory: [3, 8], categories: [3, 8] },
  qsr: { totalItems: [10, 35], perCategory: [3, 8], categories: [3, 7] }
};
var SENSORY = [
  "crisp",
  "crispy",
  "crunchy",
  "silky",
  "velvety",
  "creamy",
  "smoky",
  "charred",
  "charcoal",
  "tangy",
  "zesty",
  "fragrant",
  "aromatic",
  "rich",
  "buttery",
  "flaky",
  "tender",
  "juicy",
  "sticky",
  "spiced",
  "fiery",
  "warm",
  "golden",
  "fresh",
  "bright",
  "delicate",
  "hearty",
  "melting",
  "caramelised",
  "caramelized",
  "toasted",
  "nutty",
  "sweet",
  "sour",
  "bitter",
  "peppery",
  "herby",
  "earthy",
  "fluffy",
  "pillowy",
  "glazed",
  "blistered",
  "succulent"
];
var METHODS = [
  "slow-cooked",
  "slow cooked",
  "braised",
  "roasted",
  "roast",
  "grilled",
  "chargrilled",
  "tandoor",
  "tandoori",
  "smoked",
  "fried",
  "pan-fried",
  "deep-fried",
  "seared",
  "poached",
  "baked",
  "wood-fired",
  "stone-baked",
  "steamed",
  "confit",
  "cured",
  "marinated",
  "pickled",
  "fermented",
  "hand-made",
  "handmade",
  "house-made",
  "homemade",
  "hand-pulled",
  "hand-cut",
  "dum",
  "tawa",
  "clay oven",
  "wok",
  "flame",
  "open fire"
];
var ORIGIN = [
  "local",
  "farm",
  "free-range",
  "free range",
  "organic",
  "wild",
  "heritage",
  "single-origin",
  "single origin",
  "line-caught",
  "grass-fed",
  "aged",
  "dry-aged",
  "seasonal",
  "market",
  "artisan",
  "family recipe",
  "grandmother",
  "nani",
  "dadi",
  "ammi",
  "house",
  "our own",
  "signature",
  "chef's",
  "chefs"
];
var SIGNATURE_MARKERS = /(signature|chef'?s (special|pick|choice|recommendation)|house special|our famous|best ?seller|must[- ]try|★|⭐|\bnew\b|bestseller|popular)/i;
var DIETARY_MARKERS = /(\(v\)|\(vg\)|\(gf\)|\(df\)|\(n\)|\bvegan\b|\bvegetarian\b|gluten[- ]free|dairy[- ]free|\bjain\b|\bhalal\b|contains nuts|\bnut[- ]free\b|🌱|🌶)/i;
var ADDON_MARKERS = /(^\+|\badd\b|\bextra\b|\bupgrade\b|\bmake it\b|\bwith (a )?side\b|\btopping|\bside of\b|\bon the side\b)/i;
var COMBO_MARKERS = /(combo|meal deal|\bset\b|\bthali\b|bundle|\bfor two\b|\bfor 2\b|platter|\btasting\b|\bduo\b|\btrio\b|\bbox\b|\bpairing\b|\bfeast\b|\bmeal\b)/i;
var ABBREVIATIONS = [
  [/\bchkn\b|\bchk\b|\bckn\b/g, "chicken"],
  [/\bw\/\s?/g, "with "],
  [/&/g, " and "],
  [/\bveg\b/g, "vegetable"],
  [/\bmasala\b/g, "masala"],
  [/\bspl\b/g, "special"],
  [/\bsrvd\b/g, "served"],
  [/\bpcs?\b/g, "pieces"],
  [/\bbbq\b/g, "barbecue"],
  [/\bmakhni\b|\bmakhanwala\b/g, "makhani"],
  [/\btikkah\b/g, "tikka"],
  [/\bbiriyani\b|\bbiryanee\b/g, "biryani"],
  [/\bcappucino\b|\bcapuccino\b/g, "cappuccino"],
  [/\bexpresso\b/g, "espresso"],
  [/\bcroissant\b/g, "croissant"]
];
var STOPWORDS = /* @__PURE__ */ new Set([
  "the",
  "a",
  "an",
  "of",
  "with",
  "and",
  "in",
  "on",
  "our",
  "house",
  "style",
  "special",
  "classic",
  "fresh",
  "signature",
  "homemade",
  "served",
  "w",
  "de",
  "la",
  "le",
  "al",
  "di",
  "e",
  "ka",
  "ki",
  "wala",
  "wali"
]);
var PROTEINS = [
  ["chicken", /\b(chicken|murgh|murg|poulet|pollo|dajaj|tawook|tavuk)\b/i],
  ["lamb", /\b(lamb|mutton|gosht|ghosht|lahm|agneau|goat)\b/i],
  ["beef", /\b(beef|steak|wagyu|brisket|ribeye|sirloin|veal)\b/i],
  ["pork", /\b(pork|bacon|ham|chorizo|pancetta|prosciutto|guanciale)\b/i],
  ["fish", /\b(fish|salmon|cod|tuna|seabass|sea bass|hammour|halibut|machli|mahi|haddock|sole)\b/i],
  ["seafood", /\b(prawns?|shrimps?|jhinga|lobster|crab|squid|calamari|mussels?|scallops?|octopus)\b/i],
  ["paneer", /\b(paneer|halloumi|cottage cheese)\b/i],
  ["tofu", /\b(tofu|tempeh|seitan)\b/i],
  ["egg", /\b(eggs?|omelette|omelet|anda|benedict|shakshuka)\b/i]
];

// src/core/dishes.ts
var ROWS = [
  // ---- North Indian / Indian
  ["butter_chicken", "Butter chicken", "mains", "indian", "murgh makhani|chicken makhani|butter chicken masala", "Tandoor-charred chicken simmered in a silky tomato and butter gravy, finished with cream and dried fenugreek."],
  ["chicken_tikka_masala", "Chicken tikka masala", "mains", "indian", "tikka masala|chicken tikka curry", "Chargrilled chicken tikka folded into a spiced onion-tomato masala with a touch of cream."],
  ["chicken_tikka", "Chicken tikka", "starters", "indian", "murgh tikka|tikka", "Boneless chicken marinated overnight in yoghurt and spices, charred in the tandoor."],
  ["tandoori_chicken", "Tandoori chicken", "grill", "indian", "tandoori murgh", "Bone-in chicken in a smoky yoghurt-chilli marinade, roasted in the clay oven and finished with lemon."],
  ["seekh_kebab", "Seekh kebab", "grill", "indian", "seekh kabab|lamb seekh|mutton seekh|chicken seekh", "Hand-minced meat with ginger, green chilli and fresh coriander, skewered and cooked over charcoal."],
  ["malai_tikka", "Malai tikka", "starters", "indian", "murgh malai tikka|malai kebab|reshmi kebab", "Chicken in a mild marinade of cream, cheese and cardamom, cooked until just charred at the edges."],
  ["paneer_tikka", "Paneer tikka", "starters", "indian", "paneer tikka kebab|achari paneer tikka", "Thick cubes of fresh paneer with peppers and onion, marinated in spiced yoghurt and charred in the tandoor."],
  ["paneer_butter_masala", "Paneer butter masala", "mains", "indian", "paneer makhani|paneer makhanwala", "Soft paneer in a rich tomato, butter and cashew gravy, finished with fenugreek."],
  ["palak_paneer", "Palak paneer", "mains", "indian", "saag paneer", "Fresh paneer in a smooth spinach gravy, tempered with garlic and cumin."],
  ["kadai_paneer", "Kadai paneer", "mains", "indian", "kadhai paneer", "Paneer tossed in the wok with peppers, onion and freshly pounded kadai spices."],
  ["dal_makhani", "Dal makhani", "mains", "indian", "dal makhni|maa ki dal", "Black lentils simmered overnight with butter and cream until velvety and slightly smoky."],
  ["dal_tadka", "Dal tadka", "mains", "indian", "yellow dal|dal fry|tadka dal", "Yellow lentils finished with a sizzling tempering of ghee, cumin, garlic and red chilli."],
  ["chana_masala", "Chana masala", "mains", "indian", "chole|pindi chole|amritsari chole", "Chickpeas slow-cooked in a dark, tangy masala with dried mango and whole spices."],
  ["rogan_josh", "Rogan josh", "mains", "indian", "lamb rogan josh|mutton rogan josh", "Lamb braised slowly with Kashmiri chilli, fennel and ginger in a deep red, aromatic gravy."],
  ["lamb_curry", "Lamb curry", "mains", "indian", "mutton curry|gosht curry|lamb masala|mutton masala", "Tender lamb on the bone, slow-cooked in a home-style onion and tomato masala."],
  ["korma", "Korma", "mains", "indian", "chicken korma|lamb korma|navratan korma|vegetable korma", "A mild, fragrant curry of cashew, cream and cardamom."],
  ["vindaloo", "Vindaloo", "mains", "indian", "chicken vindaloo|pork vindaloo|lamb vindaloo", "A Goan curry, hot and tangy with vinegar, garlic and red chilli."],
  ["biryani", "Biryani", "rice_breads", "indian", "chicken biryani|mutton biryani|lamb biryani|hyderabadi biryani|veg biryani|dum biryani", "Aged basmati and spiced meat layered and sealed, then dum-cooked with saffron, fried onion and mint."],
  ["jeera_rice", "Jeera rice", "rice_breads", "indian", "cumin rice", "Basmati tempered with ghee and toasted cumin."],
  ["steamed_rice", "Steamed rice", "rice_breads", "global", "plain rice|basmati rice|white rice", "Fluffy steamed basmati."],
  ["naan", "Naan", "rice_breads", "indian", "butter naan|plain naan|tandoori naan", "Soft leavened bread, blistered in the tandoor and brushed with butter."],
  ["garlic_naan", "Garlic naan", "rice_breads", "indian", "garlic butter naan", "Tandoor naan with chopped garlic and coriander, brushed with garlic butter."],
  ["cheese_naan", "Cheese naan", "rice_breads", "indian", "cheese garlic naan", "Tandoor naan stuffed with melting cheese."],
  ["roti", "Roti", "rice_breads", "indian", "tandoori roti|chapati|phulka", "Whole-wheat bread, cooked fresh to order."],
  ["paratha", "Paratha", "rice_breads", "indian", "laccha paratha|aloo paratha|lachha paratha", "Flaky layered whole-wheat bread, cooked on the tawa with ghee."],
  ["samosa", "Samosa", "starters", "indian", "veg samosa|punjabi samosa|aloo samosa", "Crisp pastry filled with spiced potato and peas, with tamarind and mint chutneys."],
  ["pakora", "Pakora", "starters", "indian", "pakoda|bhaji|onion bhaji|bhajia", "Crisp gram-flour fritters with mint chutney."],
  ["pani_puri", "Pani puri", "starters", "indian", "golgappa|puchka|gol gappa", "Crisp puris with spiced potato and chickpeas, to fill with tangy mint-tamarind water."],
  ["papdi_chaat", "Papdi chaat", "starters", "indian", "chaat|dahi papdi chaat|aloo chaat", "Crisp wafers with potato, chickpeas, sweet yoghurt and tamarind and mint chutneys."],
  ["masala_dosa", "Masala dosa", "breakfast", "south indian", "dosa|plain dosa|mysore masala dosa", "Crisp fermented rice-and-lentil cr\xEApe with spiced potato, sambar and coconut chutney."],
  ["idli", "Idli", "breakfast", "south indian", "idli sambar", "Steamed rice-and-lentil cakes with sambar and coconut chutney."],
  ["vada", "Medu vada", "breakfast", "south indian", "vada sambar|medu vada", "Crisp lentil doughnuts with sambar and coconut chutney."],
  ["pav_bhaji", "Pav bhaji", "mains", "indian", "pao bhaji", "Buttery mashed vegetable curry with toasted, buttered pav, onion and lemon."],
  ["vada_pav", "Vada pav", "burgers_sandwiches", "indian", "wada pav", "Spiced potato fritter in a soft pav with garlic and green chutneys."],
  ["poha", "Poha", "breakfast", "indian", "kanda poha|indori poha", "Flattened rice with onion, mustard seed, curry leaves and peanuts, finished with sev and lemon."],
  ["gulab_jamun", "Gulab jamun", "desserts", "indian", "gulab jamon", "Warm milk dumplings soaked in cardamom and rose syrup."],
  ["rasmalai", "Rasmalai", "desserts", "indian", "ras malai", "Soft chenna discs in chilled saffron and cardamom milk with pistachio."],
  ["kulfi", "Kulfi", "desserts", "indian", "malai kulfi|pista kulfi", "Slow-reduced milk ice with cardamom and pistachio."],
  ["lassi", "Lassi", "drinks", "indian", "sweet lassi|mango lassi|salted lassi", "Chilled churned yoghurt, sweet or salted."],
  ["masala_chai", "Masala chai", "tea", "indian", "chai|cutting chai|kadak chai|adrak chai", "Strong tea simmered with milk, fresh ginger and cardamom."],
  // ---- Middle Eastern / Levant
  ["hummus", "Hummus", "starters", "levantine", "houmous|hommos|hummus beiruti", "Smooth chickpea and tahini pur\xE9e with lemon and good olive oil, served with warm bread."],
  ["moutabal", "Moutabal", "starters", "levantine", "mutabbal|baba ganoush|baba ghanoush", "Smoky charred aubergine with tahini, garlic and pomegranate."],
  ["falafel", "Falafel", "starters", "levantine", "falafel wrap|falafel plate", "Crisp chickpea and herb fritters with tahini sauce and pickles."],
  ["fattoush", "Fattoush", "salads", "levantine", "fatoush", "Crunchy garden salad with toasted pita, sumac and pomegranate molasses dressing."],
  ["tabbouleh", "Tabbouleh", "salads", "levantine", "tabouleh|tabouli", "Finely chopped parsley with tomato, mint, bulgur and lemon."],
  ["shawarma", "Shawarma", "burgers_sandwiches", "levantine", "chicken shawarma|beef shawarma|shawarma wrap|shawarma plate", "Spit-roasted, spiced meat shaved thin, wrapped with garlic toum, pickles and fries."],
  ["shish_tawook", "Shish tawook", "grill", "levantine", "shish taouk|tawook|chicken tawook", "Chicken marinated in garlic, lemon and yoghurt, chargrilled on skewers with toum."],
  ["mixed_grill", "Mixed grill", "grill", "levantine", "mix grill|arabic mixed grill", "A selection of charcoal-grilled kebabs, tawook and lamb chops with grilled vegetables and bread."],
  ["kofta", "Kofta", "grill", "levantine", "kafta|lamb kofta|kofte|kebab halabi", "Spiced minced lamb with parsley and onion, grilled over charcoal."],
  ["manakeesh", "Manakeesh", "bakery", "levantine", "manakish|manaeesh|zaatar manakeesh|cheese manakeesh", "Fresh flatbread baked with za'atar and olive oil or melting cheese."],
  ["kunafa", "Kunafa", "desserts", "levantine", "knafeh|kunafeh|kanafeh", "Crisp golden pastry over warm, stretchy cheese, soaked in orange-blossom syrup with pistachio."],
  ["umm_ali", "Umm ali", "desserts", "middle eastern", "om ali", "Warm baked pastry pudding with milk, nuts and raisins."],
  ["karak", "Karak chai", "tea", "gulf", "karak tea|karak", "Strong tea brewed with evaporated milk, cardamom and saffron."],
  ["arabic_coffee", "Arabic coffee", "coffee", "gulf", "gahwa|qahwa", "Lightly roasted coffee with cardamom, served with dates."],
  ["shakshuka", "Shakshuka", "breakfast", "levantine", "shakshouka", "Eggs baked in a spiced tomato and pepper sauce, with bread for dipping."],
  // ---- Western / bistro / café
  ["eggs_benedict", "Eggs Benedict", "breakfast", "western", "eggs benny|eggs royale|eggs florentine", "Poached eggs on a toasted muffin with ham and buttery hollandaise."],
  ["full_breakfast", "Full breakfast", "breakfast", "british", "full english|big breakfast|full english breakfast|fry up", "Eggs your way, sausage, bacon, beans, mushrooms, tomato and toast."],
  ["avocado_toast", "Avocado toast", "breakfast", "western", "smashed avocado|avo toast|smashed avo", "Smashed avocado on toasted sourdough with lemon, chilli and a poached egg."],
  ["pancakes", "Pancakes", "breakfast", "western", "buttermilk pancakes|stack of pancakes|hotcakes", "Fluffy buttermilk pancakes with maple syrup and butter."],
  ["french_toast", "French toast", "breakfast", "western", "brioche french toast", "Thick brioche soaked in vanilla custard and pan-fried until golden."],
  ["granola", "Granola bowl", "breakfast", "western", "granola|yoghurt bowl|acai bowl|parfait", "House granola with thick yoghurt, seasonal fruit and honey."],
  ["omelette", "Omelette", "breakfast", "western", "omelet|cheese omelette|masala omelette", "A three-egg omelette, folded soft, with toast."],
  ["croissant", "Croissant", "bakery", "french", "butter croissant|almond croissant|pain au chocolat", "All-butter laminated pastry, baked until crisp and flaky."],
  ["banana_bread", "Banana bread", "bakery", "western", "banana loaf", "Moist banana loaf, served warm with butter."],
  ["brownie", "Brownie", "desserts", "western", "chocolate brownie|fudge brownie", "Dense dark-chocolate brownie with a crackled top."],
  ["cheesecake", "Cheesecake", "desserts", "western", "baked cheesecake|basque cheesecake|new york cheesecake", "Baked vanilla cheesecake on a buttery biscuit base."],
  ["tiramisu", "Tiramisu", "desserts", "italian", "tiramis\xF9", "Espresso-soaked savoiardi layered with mascarpone cream and cocoa."],
  ["sticky_toffee_pudding", "Sticky toffee pudding", "desserts", "british", "sticky toffee|stp", "Warm date sponge with toffee sauce and vanilla ice cream."],
  ["chocolate_fondant", "Chocolate fondant", "desserts", "french", "lava cake|molten chocolate cake|chocolate lava cake", "Warm dark-chocolate pudding with a molten centre."],
  ["caesar_salad", "Caesar salad", "salads", "western", "chicken caesar|caesar", "Crisp romaine, parmesan and croutons in a garlic-anchovy dressing."],
  ["burrata", "Burrata", "starters", "italian", "burrata salad|burrata and tomato", "Creamy burrata with ripe tomatoes, basil and olive oil."],
  ["soup_of_the_day", "Soup of the day", "soups", "western", "soup|daily soup|tomato soup|mushroom soup", "Made fresh each morning, with warm bread."],
  ["fries", "Fries", "sides", "global", "french fries|chips|skinny fries|truffle fries|peri peri fries|masala fries", "Crisp, golden, well seasoned."],
  ["onion_rings", "Onion rings", "sides", "western", "battered onion rings", "Crisp battered onion rings with a dipping sauce."],
  ["burger", "Beef burger", "burgers_sandwiches", "western", "cheeseburger|smash burger|classic burger|beef burger|wagyu burger", "Juicy beef patty, melted cheese, pickles and house sauce in a toasted brioche bun."],
  ["chicken_burger", "Chicken burger", "burgers_sandwiches", "western", "fried chicken burger|crispy chicken burger|chicken sandwich|zinger", "Crisp buttermilk-fried chicken with slaw and pickles in a soft bun."],
  ["club_sandwich", "Club sandwich", "burgers_sandwiches", "western", "chicken club|club", "Triple-decker toast with chicken, egg, tomato and lettuce, with fries."],
  ["grilled_cheese", "Grilled cheese", "burgers_sandwiches", "western", "cheese toastie|toastie|croque monsieur", "Golden, buttery toasted bread with a pull of melted cheese."],
  ["fish_and_chips", "Fish & chips", "mains", "british", "fish n chips|battered cod", "Beer-battered fish with thick-cut chips, mushy peas and tartare sauce."],
  ["steak", "Steak", "grill", "western", "ribeye|sirloin|striploin|tenderloin|fillet steak|steak frites", "Aged steak, seared hard and rested, with fries and a peppercorn sauce."],
  ["roast_chicken", "Roast chicken", "mains", "western", "half chicken|rotisserie chicken|peri peri chicken", "Half chicken roasted until the skin crackles, with its juices."],
  ["salmon", "Salmon", "mains", "western", "grilled salmon|pan-seared salmon|salmon fillet", "Pan-seared salmon with crisp skin."],
  ["margherita", "Margherita pizza", "pasta_pizza", "italian", "margherita|margarita pizza|pizza margherita", "Tomato, fior di latte and basil on a blistered, slow-proved base."],
  ["pepperoni_pizza", "Pepperoni pizza", "pasta_pizza", "italian", "pepperoni", "Tomato, mozzarella and spicy pepperoni that crisps at the edges."],
  ["carbonara", "Carbonara", "pasta_pizza", "italian", "spaghetti carbonara", "Spaghetti with guanciale, egg yolk, pecorino and black pepper."],
  ["arrabbiata", "Penne arrabbiata", "pasta_pizza", "italian", "arrabiata|arrabbiata", "Penne in a fiery tomato, garlic and chilli sauce."],
  ["alfredo", "Fettuccine Alfredo", "pasta_pizza", "italian", "alfredo|white sauce pasta", "Fettuccine in a rich parmesan and butter sauce."],
  ["pesto_pasta", "Pesto pasta", "pasta_pizza", "italian", "pesto|basil pesto pasta", "Pasta tossed in basil, pine nut and parmesan pesto."],
  ["risotto", "Risotto", "pasta_pizza", "italian", "mushroom risotto|wild mushroom risotto", "Slow-stirred arborio, finished with butter and parmesan."],
  ["lasagne", "Lasagne", "pasta_pizza", "italian", "lasagna", "Layers of fresh pasta, slow-cooked rag\xF9 and b\xE9chamel."],
  ["mac_and_cheese", "Mac & cheese", "sides", "american", "mac n cheese|macaroni cheese", "Macaroni baked in a sharp cheese sauce under a crisp crumb."],
  ["wings", "Chicken wings", "starters", "american", "buffalo wings|hot wings|bbq wings", "Crisp wings tossed in your choice of sauce."],
  ["nachos", "Nachos", "starters", "mexican", "loaded nachos", "Corn chips with melted cheese, salsa, sour cream and jalape\xF1os."],
  ["tacos", "Tacos", "mains", "mexican", "taco|fish tacos|chicken tacos", "Soft corn tortillas with fillings, salsa and lime."],
  // ---- East / South-East Asian
  ["fried_rice", "Fried rice", "rice_breads", "asian", "egg fried rice|chicken fried rice|nasi goreng|schezwan fried rice", "Wok-fried rice with egg, spring onion and soy."],
  ["hakka_noodles", "Hakka noodles", "pasta_pizza", "indo-chinese", "chow mein|veg noodles|chicken noodles|schezwan noodles", "Wok-tossed noodles with crunchy vegetables and soy."],
  ["manchurian", "Manchurian", "starters", "indo-chinese", "gobi manchurian|veg manchurian|chicken manchurian", "Crisp fritters tossed in a glossy garlic, ginger and soy sauce."],
  ["chilli_chicken", "Chilli chicken", "starters", "indo-chinese", "chilli paneer|chili chicken", "Crisp chicken tossed with peppers, onion and green chilli in a soy-garlic glaze."],
  ["dumplings", "Dumplings", "starters", "asian", "momos|momo|dim sum|gyoza|dumpling", "Hand-folded dumplings, steamed or pan-fried, with chilli dip."],
  ["spring_rolls", "Spring rolls", "starters", "asian", "spring roll|veg spring roll", "Crisp rolls of shredded vegetables with sweet chilli dip."],
  ["pad_thai", "Pad thai", "pasta_pizza", "thai", "phad thai", "Rice noodles wok-fried with tamarind, egg, bean sprouts and crushed peanuts."],
  ["green_curry", "Thai green curry", "mains", "thai", "green curry|gaeng keow wan", "Fragrant coconut curry with green chilli, Thai basil and lime leaf, with jasmine rice."],
  ["laksa", "Laksa", "soups", "singaporean", "curry laksa|laksa lemak", "Rice noodles in a rich, spicy coconut broth with prawns and tofu puffs."],
  ["chicken_rice", "Hainanese chicken rice", "mains", "singaporean", "chicken rice|hainanese chicken", "Poached chicken with fragrant chicken-fat rice, chilli and ginger sauces."],
  ["ramen", "Ramen", "soups", "japanese", "tonkotsu ramen|shoyu ramen|miso ramen", "Springy noodles in a long-simmered broth with soft egg and toppings."],
  ["sushi", "Sushi", "starters", "japanese", "maki|california roll|nigiri|sushi roll", "Seasoned rice and fresh fish, rolled or pressed to order."],
  // ---- Coffee & drinks
  ["espresso", "Espresso", "coffee", "global", "single espresso|double espresso|doppio", "A short, intense shot."],
  ["americano", "Americano", "coffee", "global", "long black", "Espresso lengthened with hot water."],
  ["cappuccino", "Cappuccino", "coffee", "global", "cappucino", "Espresso with steamed milk and a deep layer of foam."],
  ["latte", "Latte", "coffee", "global", "cafe latte|caffe latte|vanilla latte|spanish latte", "Espresso with silky steamed milk."],
  ["flat_white", "Flat white", "coffee", "global", "flatwhite", "A double shot with a thin layer of velvety milk."],
  ["cortado", "Cortado", "coffee", "global", "piccolo|gibraltar", "Espresso cut with an equal measure of warm milk."],
  ["mocha", "Mocha", "coffee", "global", "cafe mocha|caffe mocha", "Espresso, dark chocolate and steamed milk."],
  ["cold_brew", "Cold brew", "coffee", "global", "cold brew coffee", "Coffee steeped cold for 18 hours: smooth and naturally sweet."],
  ["iced_latte", "Iced latte", "coffee", "global", "iced coffee|iced spanish latte", "Espresso over ice with cold milk."],
  ["matcha_latte", "Matcha latte", "tea", "japanese", "matcha|iced matcha", "Stone-ground matcha whisked with milk."],
  ["hot_chocolate", "Hot chocolate", "drinks", "global", "hot cocoa", "Real chocolate melted into steamed milk."],
  ["fresh_juice", "Fresh juice", "drinks", "global", "orange juice|fresh orange|juice|fresh lime|watermelon juice|lemon mint", "Pressed to order."],
  ["milkshake", "Milkshake", "drinks", "global", "shake|thick shake|oreo shake", "Thick, cold and made with proper ice cream."],
  ["smoothie", "Smoothie", "drinks", "global", "fruit smoothie|berry smoothie", "Blended fruit, nothing added."],
  ["iced_tea", "Iced tea", "drinks", "global", "lemon iced tea|peach iced tea", "Fresh-brewed tea over ice."],
  ["soft_drink", "Soft drink", "drinks", "global", "coke|pepsi|sprite|7up|soda|soft drinks|diet coke|coca cola|fanta", "Chilled can or bottle."],
  ["water", "Water", "drinks", "global", "mineral water|still water|sparkling water", "Still or sparkling."],
  ["mojito", "Mojito", "drinks", "global", "virgin mojito|mint mojito", "Fresh mint, lime and soda over crushed ice."]
];
function build() {
  return ROWS.map(([key, name, section, cuisine, aliases, desc]) => ({
    key,
    name,
    section,
    cuisine,
    desc,
    aliases: aliases ? aliases.split("|").map((a) => a.trim()).filter(Boolean) : []
  }));
}
var DISHES = build();
var DISH_BY_KEY = Object.fromEntries(DISHES.map((d) => [d.key, d]));

// src/core/match.ts
function normalise(s) {
  let t = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [re, rep] of ABBREVIATIONS) t = t.replace(re, rep);
  t = t.replace(/\(.*?\)/g, " ").replace(/[^a-z0-9\s'-]/g, " ").replace(/['-]/g, " ").replace(/\s+/g, " ").trim();
  return t;
}
function tokens(s) {
  return normalise(s).split(" ").filter((w) => w && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}
function bigrams(s) {
  const m = /* @__PURE__ */ new Map();
  const t = ` ${s} `;
  for (let i = 0; i < t.length - 1; i++) {
    const g = t.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}
function dice(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = bigrams(a), B = bigrams(b);
  let inter = 0, total = 0;
  for (const [g, n] of A) {
    inter += Math.min(n, B.get(g) ?? 0);
    total += n;
  }
  for (const n of B.values()) total += n;
  return 2 * inter / total;
}
function similarity(a, b) {
  const na = tokens(a).join(" "), nb = tokens(b).join(" ");
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = new Set(na.split(" ")), tb = new Set(nb.split(" "));
  let common = 0;
  for (const w of ta) if (tb.has(w)) common++;
  const overlap = common / Math.max(ta.size, tb.size);
  const contained = na.includes(nb) || nb.includes(na) ? 0.9 * Math.min(na.length, nb.length) / Math.max(na.length, nb.length) + 0.1 : 0;
  return Math.max(dice(na, nb), overlap, contained);
}
var INDEX = null;
function index() {
  if (!INDEX) {
    INDEX = [];
    for (const d of DISHES) {
      INDEX.push({ label: d.name, dish: d });
      for (const a of d.aliases) INDEX.push({ label: a, dish: d });
    }
  }
  return INDEX;
}
function matchDish(name, threshold = 0.62) {
  let best = null;
  for (const c of index()) {
    const s = similarity(name, c.label);
    if (!best || s > best.score) best = { dish: c.dish, score: s };
  }
  return best && best.score >= threshold ? best : null;
}
function detectProtein(text) {
  for (const [p, re] of PROTEINS) if (re.test(text)) return p;
  return null;
}
function compareKey(name) {
  const m = matchDish(name);
  if (m) {
    const p = detectProtein(name);
    return p ? `${m.dish.key}:${p}` : m.dish.key;
  }
  return "x:" + tokens(name).sort().join("_");
}

// src/core/parser.ts
var NUM = String.raw`\d{1,3}(?:[,\s]\d{3})+(?:\.\d{1,2})?|\d{1,6}(?:[.,]\d{1,2})?`;
var CUR = String.raw`AED|Dhs?\.?|Dirhams?|£|GBP|S\$|SGD|US\$|USD|\$|₹|Rs\.?|INR|€`;
var PRICE = String.raw`(?:(?:${CUR})\s?)?(?:${NUM})(?:\s?(?:${CUR}))?(?:\/-)?`;
var TRAILING = new RegExp(String.raw`(?:^|[\s.·…_|:–—-])((?:${PRICE})(?:\s*(?:\/|\||,|–|-|or)\s*(?:${PRICE}))*)\s*$`, "i");
var PRICE_ONLY = new RegExp(String.raw`^\s*((?:${PRICE})(?:\s*(?:\/|\||,|–|-)\s*(?:${PRICE}))*)\s*$`, "i");
var NUMBER_RE = new RegExp(NUM, "g");
var CUR_RE = new RegExp(String.raw`(${CUR})`, "i");
var idSeq = 0;
var newId = () => `i${Date.now().toString(36)}${(idSeq++).toString(36)}`;
function sectionFor(heading) {
  for (const [s, re] of SECTION_KEYWORDS) if (re.test(heading)) return s;
  return "other";
}
function currencyOf(token) {
  if (!token) return null;
  const t = token.trim().replace(/\.$/, "");
  for (const [re, c] of CURRENCY_TOKENS) if (re.test(t)) return c;
  return null;
}
function toNumber(s) {
  const t = s.replace(/\s/g, "");
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return parseFloat(t.replace(/,/g, ""));
  if (/^\d+,\d{1,2}$/.test(t)) return parseFloat(t.replace(",", "."));
  return parseFloat(t.replace(/,/g, ""));
}
function readPrices(s) {
  const cm = s.match(CUR_RE);
  const nums = (s.match(NUMBER_RE) ?? []).map(toNumber).filter((n) => isFinite(n) && n > 0);
  return { prices: nums, currency: currencyOf(cm?.[1]), hasSymbol: !!cm };
}
function cleanName(s) {
  return s.replace(/[.·…_]{2,}/g, " ").replace(/[\s|:–—-]+$/g, "").replace(/^[\s•*·\-–—]+/, "").replace(/\s+/g, " ").trim();
}
function looksLikeHeading(line, next) {
  const words = line.split(/\s+/).length;
  if (words > 6 || line.length > 48) return false;
  if (/[.!?]$/.test(line)) return false;
  const letters = line.replace(/[^A-Za-z]/g, "");
  const caps = letters.length >= 3 && letters === letters.toUpperCase();
  if (next && PRICE_ONLY.test(next)) return false;
  const keyword = sectionFor(line) !== "other";
  const nextIsItem = !!next && TRAILING.test(next);
  return caps || keyword && words <= 4 || nextIsItem && words <= 3 && /^[A-Z]/.test(line);
}
function splitInline(nameDesc) {
  const m = nameDesc.match(/^(.{3,60}?)\s+(?:[–—-]|:)\s+(.{8,})$/);
  if (m) return [m[1].trim(), m[2].trim()];
  return [nameDesc, ""];
}
function parseMenu(text) {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.replace(/\t/g, " ").trim()).filter(Boolean);
  const items = [];
  const unparsed = [];
  const currencyVotes = /* @__PURE__ */ new Map();
  let symbolItems = 0;
  let category = "Menu";
  let section = "other";
  let last = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const only = line.match(PRICE_ONLY);
    if (only) {
      const r = readPrices(only[1]);
      if (last && last.price == null && r.prices.length) {
        last.prices = r.prices;
        last.price = Math.min(...r.prices);
        last.rawLine += " " + line;
        if (r.currency) currencyVotes.set(r.currency, (currencyVotes.get(r.currency) ?? 0) + 1);
        if (r.hasSymbol) symbolItems++;
        continue;
      }
      unparsed.push(line);
      continue;
    }
    const t = line.match(TRAILING);
    if (t && t.index !== void 0) {
      const before = line.slice(0, t.index + (t[0].length - t[1].length)).trim();
      const r = readPrices(t[1]);
      const [name0, desc0] = splitInline(cleanName(before));
      const name = cleanName(name0);
      if (name.length >= 2 && /[a-z]/i.test(name) && r.prices.length) {
        if (r.currency) currencyVotes.set(r.currency, (currencyVotes.get(r.currency) ?? 0) + 1);
        if (r.hasSymbol) symbolItems++;
        const item = {
          id: newId(),
          category,
          section,
          name,
          description: desc0,
          price: Math.min(...r.prices),
          prices: r.prices,
          rawLine: line,
          confidence: "high",
          flags: []
        };
        items.push(item);
        last = item;
        continue;
      }
    }
    if (looksLikeHeading(line, next)) {
      category = cleanName(line).replace(/\s+/g, " ");
      section = sectionFor(category);
      last = null;
      continue;
    }
    if (last && line.length > 6) {
      last.description = (last.description ? last.description + " " : "") + line;
      continue;
    }
    if (line.length <= 60 && /[a-z]/i.test(line)) {
      const item = {
        id: newId(),
        category,
        section,
        name: cleanName(line),
        description: "",
        price: null,
        prices: [],
        rawLine: line,
        confidence: "low",
        flags: ["no price found"]
      };
      items.push(item);
      last = item;
      continue;
    }
    unparsed.push(line);
  }
  const priced = items.map((x) => x.price).filter((p) => p != null).sort((a, b) => a - b);
  const med = priced.length ? priced[Math.floor(priced.length / 2)] : null;
  for (const it of items) {
    const m = matchDish(it.name);
    it.dishKey = m?.dish.key ?? null;
    it.dishScore = m?.score ?? 0;
    if (it.section === "other" && m) it.section = m.dish.section;
    if (it.price == null) {
      it.confidence = "low";
      if (!it.flags.length) it.flags.push("no price found");
    } else {
      if (it.price < 0.5) {
        it.flags.push("price looks too small");
        it.confidence = "low";
      }
      if (med && (it.price > med * 12 || it.price < med / 12)) {
        it.flags.push("price far from the rest of the menu");
        it.confidence = "low";
      }
      if (it.name.split(" ").length > 9) {
        it.flags.push("name is long: description may be merged in");
        if (it.confidence === "high") it.confidence = "medium";
      }
      if (it.category === "Menu") {
        it.flags.push("no section heading above it");
        if (it.confidence === "high") it.confidence = "medium";
      }
      if (/^\d/.test(it.name)) {
        it.flags.push("name starts with a number");
        if (it.confidence === "high") it.confidence = "medium";
      }
    }
  }
  let currencyDetected = null;
  let best = 0;
  for (const [c, n] of currencyVotes) if (n > best) {
    best = n;
    currencyDetected = c;
  }
  return { items, currencyDetected, currencySymbolsOnItems: symbolItems, unparsedLines: unparsed };
}
function refreshItem(it) {
  const m = matchDish(it.name);
  const fromHeading = sectionFor(it.category);
  return {
    ...it,
    section: fromHeading !== "other" ? fromHeading : m?.dish.section ?? "other",
    dishKey: m?.dish.key ?? null,
    dishScore: m?.score ?? 0,
    // the table edits `price`; keep `prices` in step with it
    prices: it.price == null ? [] : it.prices.includes(it.price) ? it.prices : [it.price],
    confidence: it.price != null && it.name.trim() ? "high" : "low",
    flags: it.price != null && it.name.trim() ? [] : ["needs a name and a price"]
  };
}

// src/core/stats.ts
var round = (n, dp = 0) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};
var clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function median(xs) {
  if (!xs.length) return null;
  return quantile([...xs].sort((a, b) => a - b), 0.5);
}
function monthsBetween(a, b) {
  const [ya, ma] = a.split("-").map(Number), [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
}
function currentMonth(d = /* @__PURE__ */ new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function roundMoney(n) {
  const a = Math.abs(n);
  const step = a >= 1e5 ? 5e3 : a >= 1e4 ? 500 : a >= 1e3 ? 50 : a >= 100 ? 10 : 1;
  return Math.round(n / step) * step;
}
function endingStyle(p) {
  const cents = Math.round((p - Math.floor(p)) * 100);
  if (cents === 0) {
    const last = Math.floor(p) % 10;
    return last === 9 ? "9" : last === 5 || last === 0 ? "0/5" : "whole";
  }
  if (cents === 50) return ".50";
  if (cents === 95) return ".95";
  if (cents === 99) return ".99";
  if (cents % 10 === 9 || cents === 90) return ".x9";
  return "other";
}

// src/core/money.ts
var WEEKS_PER_MONTH = 52 / 12;
var DEFAULT_ASSUMPTIONS = {
  repriceKept: 0.75,
  repriceCap: 0.06,
  addonAttach: [0.04, 0.1],
  addonPriceShare: 0.12,
  closerAttach: [0.03, 0.08],
  closerPriceShare: 0.18
};
function monthlyRevenue(inputs) {
  if (!inputs.coversPerWeek || !inputs.avgBill) return null;
  return inputs.coversPerWeek * inputs.avgBill * WEEKS_PER_MONTH;
}
var range = (low, high, currency, assumptions) => ({
  low: roundMoney(Math.min(low, high)),
  high: roundMoney(Math.max(low, high)),
  currency,
  period: "month",
  assumptions
});
function repriceLever(inputs, drift, currency, a = DEFAULT_ASSUMPTIONS) {
  const rev = monthlyRevenue(inputs);
  if (rev == null || drift <= 0.01) return null;
  const step = Math.min(drift, a.repriceCap);
  const high = rev * step * a.repriceKept;
  const low = rev * (step / 2) * a.repriceKept;
  return range(low, high, currency, [
    `${Math.round(step * 100)}% reprice step (catch-up capped at ${Math.round(a.repriceCap * 100)}%)`,
    `${Math.round(a.repriceKept * 100)}% of the gain kept after any lost orders`,
    `Low end assumes only half the step is taken`,
    `Based on ${inputs.coversPerWeek} covers/week \xD7 ${inputs.avgBill} average bill`
  ]);
}
function addonLever(inputs, currency, a = DEFAULT_ASSUMPTIONS) {
  if (!inputs.coversPerWeek || !inputs.avgBill) return null;
  const price = inputs.avgBill * a.addonPriceShare;
  const per = (r) => inputs.coversPerWeek * r * price * WEEKS_PER_MONTH;
  return range(per(a.addonAttach[0]), per(a.addonAttach[1]), currency, [
    `${Math.round(a.addonAttach[0] * 100)}\u2013${Math.round(a.addonAttach[1] * 100)}% of covers take one add-on`,
    `Add-on priced at about ${Math.round(a.addonPriceShare * 100)}% of the average bill (${Math.round(price)})`
  ]);
}
function closerLever(inputs, currency, a = DEFAULT_ASSUMPTIONS) {
  if (!inputs.coversPerWeek || !inputs.avgBill) return null;
  const price = inputs.avgBill * a.closerPriceShare;
  const per = (r) => inputs.coversPerWeek * r * price * WEEKS_PER_MONTH;
  return range(per(a.closerAttach[0]), per(a.closerAttach[1]), currency, [
    `${Math.round(a.closerAttach[0] * 100)}\u2013${Math.round(a.closerAttach[1] * 100)}% more covers add a dessert or drink`,
    `Priced at about ${Math.round(a.closerPriceShare * 100)}% of the average bill (${Math.round(price)})`
  ]);
}
function testPrice(price, median2, step = 0.08) {
  const target = Math.min(median2, price * (1 + step));
  return target >= 20 ? Math.round(target) : Math.round(target * 2) / 2;
}
function sumRanges(rs, currency) {
  const xs = rs.filter((r) => !!r);
  if (!xs.length) return null;
  return {
    low: roundMoney(xs.reduce((a, r) => a + r.low, 0)),
    high: roundMoney(xs.reduce((a, r) => a + r.high, 0) * 0.85),
    currency,
    period: "month",
    assumptions: ["Sum of the levers above, with the high end trimmed 15% for overlap"]
  };
}

// src/core/score.ts
var WEIGHTS = { structure: 0.2, pricing: 0.25, merchandising: 0.15, upsell: 0.2, market: 0.2 };
var MIN_BENCHMARK_OBS = 5;
var MIN_BENCHMARK_DISHES = 3;
function groupByCategory(items) {
  const m = /* @__PURE__ */ new Map();
  for (const it of items) {
    const a = m.get(it.category) ?? [];
    a.push(it);
    m.set(it.category, a);
  }
  return m;
}
var isFood = (it) => FOOD_SECTIONS.includes(it.section) || it.section === "other";
var pct = (n) => `${Math.round(n * 100)}%`;
var wordHit = (text, words) => {
  const t = ` ${text.toLowerCase()} `;
  return words.some((w) => t.includes(` ${w}`));
};
function scoreStructure(items, inputs) {
  const norm = CONCEPT_NORMS[inputs.concept];
  const ev = [];
  let s = 100;
  const n = items.length;
  const cats = groupByCategory(items);
  const [lo, hi] = norm.totalItems;
  if (n > hi) {
    const over = (n - hi) / hi;
    s -= clamp(over * 60, 8, 35);
    ev.push({ text: `${n} items is more than a ${inputs.concept.replace("_", " ")} usually needs (${lo}\u2013${hi}). Long menus slow decisions and spread prep thin.`, tone: "leak" });
  } else if (n < lo) {
    s -= 10;
    ev.push({ text: `${n} items is a tight menu (typical ${lo}\u2013${hi}). Good for speed; check every guest type has an option.`, tone: "neutral" });
  } else ev.push({ text: `${n} items sits in the usual range for this concept (${lo}\u2013${hi}).`, tone: "gain" });
  const [clo, chi] = norm.categories;
  if (cats.size > chi) {
    s -= 12;
    ev.push({ text: `${cats.size} sections. Guests scan best with ${clo}\u2013${chi}; merge the thin ones.`, tone: "leak" });
  }
  if (cats.size < clo && n > 12) {
    s -= 12;
    ev.push({ text: `Only ${cats.size} section${cats.size === 1 ? "" : "s"} for ${n} items. Headings help guests find what they want and spend more.`, tone: "leak" });
  }
  const [plo, phi] = norm.perCategory;
  const crowded = [], thin = [];
  for (const [c, its] of cats) {
    if (its.length > phi + 2) crowded.push(`${c} (${its.length})`);
    else if (its.length < Math.max(2, plo - 1) && !its.every((i) => DRINK_SECTIONS.includes(i.section) || i.section === "extras" || i.section === "sides")) thin.push(`${c} (${its.length})`);
  }
  if (crowded.length) {
    s -= Math.min(30, crowded.length * 10);
    ev.push({ text: `Crowded sections: ${crowded.join(", ")}. Above ~${phi} choices, guests default to what they know or the cheapest.`, tone: "leak" });
  }
  if (thin.length) {
    s -= Math.min(15, thin.length * 5);
    ev.push({ text: `Thin sections: ${thin.join(", ")}. Fold them in or build them out.`, tone: "neutral" });
  }
  const food = items.filter((i) => FOOD_SECTIONS.includes(i.section)).length;
  const drinks = items.filter((i) => DRINK_SECTIONS.includes(i.section)).length;
  if (inputs.concept !== "bar" && n >= 12 && drinks === 0) ev.push({ text: "No drinks found on this menu. If drinks are on a separate list, paste it in too: drinks are usually the highest-margin line.", tone: "neutral" });
  if (inputs.concept === "cafe" && food > 0 && drinks > 0 && food > drinks * 3) ev.push({ text: `Food outnumbers drinks ${food} to ${drinks}. For a caf\xE9, drinks usually carry the margin.`, tone: "neutral" });
  return { key: "structure", label: "Structure & balance", weight: WEIGHTS.structure, score: round(clamp(s)), evidence: ev, missing: [] };
}
function categoryPricing(items) {
  const out = [];
  for (const [c, its] of groupByCategory(items)) {
    const ps = its.map((i) => i.price).filter((p) => p != null);
    if (ps.length < 3) continue;
    const sorted = [...ps].sort((a, b) => a - b);
    const med = median(ps);
    const ascending = ps.length >= 4 && ps.every((p, i) => i === 0 || p >= ps[i - 1]) && sorted[0] !== sorted[sorted.length - 1];
    out.push({ category: c, n: ps.length, min: sorted[0], max: sorted[sorted.length - 1], median: med, spread: sorted[sorted.length - 1] / sorted[0], hasAnchor: sorted[sorted.length - 1] >= med * 1.3, ascending });
  }
  return out;
}
function scorePricing(items, currencySymbolsOnItems) {
  const ev = [];
  const missing = [];
  const priced = items.filter((i) => i.price != null);
  if (priced.length < 5) return { key: "pricing", label: "Price architecture", weight: WEIGHTS.pricing, score: null, evidence: [], missing: ["At least 5 priced items"] };
  let s = 100;
  const cp = categoryPricing(items).filter((c) => c.category !== "Menu" || items.every((i) => i.category === "Menu"));
  const flat = cp.filter((c) => c.spread < 1.25 && c.n >= 4);
  const wide = cp.filter((c) => c.spread > 3.2);
  const noAnchor = cp.filter((c) => !c.hasAnchor && c.n >= 4);
  const ladders = cp.filter((c) => c.ascending);
  if (flat.length) {
    s -= Math.min(25, flat.length * 9);
    ev.push({ text: `Flat pricing in ${flat.map((c) => c.category).join(", ")}: every dish costs about the same, so nothing steers guests to the dishes that earn most.`, tone: "leak" });
  }
  if (wide.length) {
    s -= Math.min(20, wide.length * 7);
    ev.push({ text: `Very wide price range in ${wide.map((c) => `${c.category} (${round(c.spread, 1)}\xD7)`).join(", ")}. Guests anchor on the cheapest; consider splitting premium items into their own section.`, tone: "leak" });
  }
  if (noAnchor.length) {
    s -= Math.min(20, noAnchor.length * 6);
    ev.push({ text: `No premium "anchor" dish in ${noAnchor.map((c) => c.category).join(", ")}. One clearly higher-priced dish makes the rest feel like good value.`, tone: "leak" });
  }
  if (ladders.length) {
    s -= Math.min(15, ladders.length * 5);
    ev.push({ text: `Prices listed cheapest to dearest in ${ladders.map((c) => c.category).join(", ")}. A ranked list invites guests to shop by price; order by what you want to sell.`, tone: "leak" });
  }
  const goodCats = cp.length - new Set([...flat, ...wide, ...noAnchor, ...ladders].map((c) => c.category)).size;
  if (goodCats > 0) ev.push({ text: `${goodCats} of ${cp.length} sections ${goodCats === 1 ? "has" : "have"} a healthy price ladder.`, tone: "gain" });
  const styles = /* @__PURE__ */ new Map();
  for (const it of priced) {
    const st = endingStyle(it.price);
    styles.set(st, (styles.get(st) ?? 0) + 1);
  }
  const top = Math.max(...styles.values());
  if (top / priced.length < 0.75) {
    s -= 8;
    ev.push({ text: `Price endings are mixed (${[...styles.keys()].join(", ")}). Pick one style; consistency reads as confidence.`, tone: "neutral" });
  }
  const signShare = currencySymbolsOnItems / priced.length;
  if (signShare > 0.5) {
    s -= 7;
    ev.push({ text: `Currency signs on ${pct(signShare)} of prices. Research from Cornell found guests spent more when menus showed plain numbers without currency signs.`, tone: "leak" });
  }
  if (!cp.length) missing.push("Sections with 3+ priced dishes to judge the price ladder");
  return { key: "pricing", label: "Price architecture", weight: WEIGHTS.pricing, score: round(clamp(s)), evidence: ev, missing };
}
function scoreMerchandising(items) {
  const ev = [];
  const food = items.filter((i) => isFood(i) && i.section !== "extras" && i.section !== "sides");
  if (food.length < 4) return { key: "merchandising", label: "Descriptions & merchandising", weight: WEIGHTS.merchandising, score: null, evidence: [], missing: ["At least 4 food items"] };
  const withDesc = food.filter((i) => i.description.trim().split(/\s+/).length >= 3);
  const coverage = withDesc.length / food.length;
  const words = withDesc.map((i) => i.description.trim().split(/\s+/).length);
  const avgWords = words.length ? words.reduce((a, b) => a + b, 0) / words.length : 0;
  const vivid = withDesc.filter((i) => wordHit(`${i.name} ${i.description}`, SENSORY) || wordHit(`${i.name} ${i.description}`, METHODS));
  const origin = food.filter((i) => wordHit(`${i.name} ${i.description}`, ORIGIN));
  const signature = items.filter((i) => SIGNATURE_MARKERS.test(`${i.name} ${i.description} ${i.category}`));
  const dietary = items.filter((i) => DIETARY_MARKERS.test(`${i.name} ${i.description}`));
  let s = 0;
  s += clamp(coverage / 0.7, 0, 1) * 40;
  s += avgWords === 0 ? 0 : avgWords < 6 ? 8 : avgWords <= 22 ? 15 : 9;
  s += withDesc.length ? clamp(vivid.length / withDesc.length / 0.6, 0, 1) * 20 : 0;
  s += signature.length >= 1 && signature.length <= Math.max(3, food.length * 0.15) ? 15 : signature.length ? 7 : 0;
  s += dietary.length ? 10 : 0;
  ev.push({ text: `${pct(coverage)} of dishes have a description${coverage < 0.7 ? "; aim for 70%+ on the dishes you most want to sell." : "."}`, tone: coverage >= 0.7 ? "gain" : "leak" });
  if (withDesc.length) ev.push({ text: `Average description: ${round(avgWords)} words${avgWords > 22 ? ": trim to the 2\u20133 details that make guests want it." : avgWords < 6 ? ": too short to sell the dish." : "."}`, tone: avgWords >= 6 && avgWords <= 22 ? "gain" : "neutral" });
  if (withDesc.length) ev.push({ text: `${vivid.length} of ${withDesc.length} descriptions use taste or cooking words (crisp, slow-cooked, charred\u2026).`, tone: vivid.length / withDesc.length >= 0.6 ? "gain" : "leak" });
  ev.push({ text: signature.length ? `${signature.length} dish${signature.length > 1 ? "es are" : " is"} highlighted as signature or chef's pick.` : "Nothing is highlighted as a signature or chef's pick. Guests look for a recommendation.", tone: signature.length && signature.length <= 3 ? "gain" : signature.length ? "neutral" : "leak" });
  if (origin.length) ev.push({ text: `${origin.length} dish${origin.length > 1 ? "es mention" : " mentions"} provenance or house-made. Good, use it on your best earners.`, tone: "gain" });
  if (!dietary.length) ev.push({ text: "No dietary markers (V, VG, GF, Jain, halal). Guests who need them will ask, or go elsewhere.", tone: "neutral" });
  return { key: "merchandising", label: "Descriptions & merchandising", weight: WEIGHTS.merchandising, score: round(clamp(s)), evidence: ev, missing: [] };
}
function scoreUpsell(items, inputs) {
  const ev = [];
  const all = (i) => `${i.name} ${i.description} ${i.category}`;
  const addons = items.filter((i) => i.section === "extras" || ADDON_MARKERS.test(all(i)) || /\+\s?\d/.test(i.description));
  const sides = items.filter((i) => i.section === "sides" || i.section === "rice_breads");
  const sizes = items.filter((i) => i.prices.length >= 2);
  const combos = items.filter((i) => COMBO_MARKERS.test(all(i)) || i.section === "sharing");
  const desserts = items.filter((i) => i.section === "desserts" || i.section === "bakery");
  const drinks = items.filter((i) => DRINK_SECTIONS.includes(i.section));
  const isCafe = inputs.concept === "cafe";
  const checks = [
    [addons.length > 0, 25, `${addons.length} add-on or extra option${addons.length === 1 ? "" : "s"} found.`, "No add-ons or extras (add cheese, extra shot, add a side). That is the easiest money on a menu."],
    [sides.length >= 2 || isCafe, 15, `${sides.length} sides to pair with mains.`, "Fewer than 2 sides. Sides are a natural second item on every order."],
    [sizes.length > 0, 15, `${sizes.length} item${sizes.length === 1 ? "" : "s"} offered in more than one size.`, "No size options. A regular/large choice lifts the average spend without adding new dishes."],
    [combos.length > 0, 20, `${combos.length} combo, set or sharing option${combos.length === 1 ? "" : "s"}.`, "No combos, sets or sharing plates. Bundles raise the bill and speed up ordering."],
    [desserts.length >= 2, 10, `${desserts.length} desserts or bakes to close the meal.`, "Fewer than 2 desserts. A short, strong dessert list is a reliable add-on."],
    [drinks.length >= 4 || inputs.concept === "qsr", 15, `${drinks.length} drinks on this menu.`, "Few or no drinks on this menu. If they're on another list, add it to the X-ray."]
  ];
  let s = 0;
  for (const [ok, pts, good, bad] of checks) {
    if (ok) s += pts;
    ev.push({ text: ok ? good : bad, tone: ok ? "gain" : "leak" });
  }
  return { key: "upsell", label: "Upsell paths", weight: WEIGHTS.upsell, score: round(clamp(s)), evidence: ev, missing: [] };
}
function compareToBenchmark(items, rows, inputs, minObs = MIN_BENCHMARK_OBS) {
  const city = inputs.city.trim().toLowerCase();
  const byKey = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (r.city.trim().toLowerCase() !== city) continue;
    const a = byKey.get(r.dish_key) ?? [];
    a.push(r.price);
    byKey.set(r.dish_key, a);
  }
  const out = [];
  for (const it of items) {
    if (it.price == null) continue;
    const key = compareKey(it.name);
    const obs = byKey.get(key) ?? byKey.get(key.split(":")[0]);
    if (!obs || obs.length < minObs) continue;
    const sorted = [...obs].sort((a, b) => a - b);
    const q = (p) => {
      const pos = (sorted.length - 1) * p;
      const lo = Math.floor(pos);
      return sorted[lo] + (sorted[Math.ceil(pos)] - sorted[lo]) * (pos - lo);
    };
    const med = q(0.5);
    out.push({ item: it.name, price: it.price, key, n: sorted.length, median: med, p25: q(0.25), p75: q(0.75), gap: (it.price - med) / med });
  }
  return out;
}
function priceDrift(points, inputs, now = currentMonth()) {
  if (!inputs.lastPriceChange) return null;
  const series = points.filter((p) => p.country === inputs.country).sort((a, b) => a.month.localeCompare(b.month));
  if (series.length < 2) return null;
  const from = [...series].reverse().find((p) => p.month <= inputs.lastPriceChange) ?? null;
  const to = [...series].reverse().find((p) => p.month <= now) ?? null;
  if (!from || !to || from.month === to.month) return null;
  return { drift: to.value / from.value - 1, from: from.month, to: to.month, months: monthsBetween(from.month, to.month) };
}
function scoreMarket(items, inputs, rows, index2) {
  const ev = [];
  const missing = [];
  const comps = compareToBenchmark(items, rows, inputs);
  const drift = priceDrift(index2, inputs);
  const parts = [];
  if (comps.length >= MIN_BENCHMARK_DISHES) {
    const under = comps.filter((c) => c.gap < -0.08), over = comps.filter((c) => c.gap > 0.15);
    const avgAbs = comps.reduce((a, c) => a + Math.abs(c.gap), 0) / comps.length;
    parts.push(clamp(100 - avgAbs * 250));
    ev.push({ text: `${comps.length} dishes compared with local prices in ${inputs.city} (${Math.min(...comps.map((c) => c.n))}+ menus each).`, tone: "neutral" });
    if (under.length) ev.push({ text: `${under.length} priced more than 8% below the local median: ${under.slice(0, 4).map((c) => c.item).join(", ")}${under.length > 4 ? "\u2026" : ""}.`, tone: "leak" });
    if (over.length) ev.push({ text: `${over.length} priced more than 15% above the local median. Fine if the dish earns it, risky if not.`, tone: "neutral" });
  } else missing.push(`Local price data: we need ${MIN_BENCHMARK_OBS}+ menus per dish in ${inputs.city || "your city"}. Use Price Check to add competitors you know.`);
  if (drift) {
    const d = drift.drift;
    parts.push(d < 0.02 ? 100 : d < 0.05 ? 75 : d < 0.1 ? 50 : 25);
    ev.push({ text: `Restaurant prices in your country have moved ${pct(d)} since your last price change (${drift.from} \u2192 ${drift.to}, official price index). Your menu is that much cheaper in real terms.`, tone: d >= 0.03 ? "leak" : "gain" });
  } else if (!inputs.lastPriceChange) missing.push("When you last changed prices");
  const score = parts.length ? round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
  return { key: "market", label: "Market position", weight: WEIGHTS.market, score, evidence: ev, missing };
}

// src/core/xray.ts
var ENGINE_VERSION = "xray-1.0.0";
function verdictFor(score, coverage) {
  const v = score >= 80 ? "A well-built menu. The gains are in the details." : score >= 65 ? "Solid, with money left on the table." : score >= 50 ? "Busy, but not earning in the right places." : "This menu is working against you.";
  return coverage < 0.75 ? `${v} (Partial read: add the missing inputs for a full score.)` : v;
}
function buildRewrites(items, max = 3) {
  const candidates = items.filter((i) => i.dishKey && DISH_BY_KEY[i.dishKey] && i.description.trim().split(/\s+/).filter(Boolean).length < 6).filter((i) => FOOD_SECTIONS.includes(i.section) || DRINK_SECTIONS.includes(i.section)).sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const it of candidates) {
    if (seen.has(it.dishKey)) continue;
    seen.add(it.dishKey);
    out.push({ item: it.name, before: it.description || "(no description)", after: DISH_BY_KEY[it.dishKey].desc, note: "Starting point from the classic recipe. Edit it to match yours." });
    if (out.length >= max) break;
  }
  return out;
}
function runXray(items, inputs, opts = {}) {
  const currency = opts.currency ?? COUNTRY_CURRENCY[inputs.country];
  const a = opts.assumptions ?? DEFAULT_ASSUMPTIONS;
  const bench = opts.benchmark ?? [];
  const idx = opts.priceIndex ?? [];
  const symbols = opts.currencySymbolsOnItems ?? 0;
  const dims = [
    scoreStructure(items, inputs),
    scorePricing(items, symbols),
    scoreMerchandising(items),
    scoreUpsell(items, inputs),
    scoreMarket(items, inputs, bench, idx)
  ];
  const assessed = dims.filter((d) => d.score != null);
  const wSum = assessed.reduce((s, d) => s + d.weight, 0);
  const score = wSum ? round(assessed.reduce((s, d) => s + d.score * d.weight, 0) / wSum) : 0;
  const coverage = round(wSum, 2);
  const F = [];
  const drift = priceDrift(idx, inputs);
  if (drift && drift.drift > 0.02) {
    F.push({
      id: "reprice",
      lever: "Catch up with rising costs",
      why: `Restaurant prices in your market have moved ${Math.round(drift.drift * 100)}% since you last changed yours (${drift.from}).`,
      action: "Reprice in one planned step: raise your strongest sellers and dishes with no close competitor first; hold your entry-price items.",
      items: [],
      priority: 90 + drift.drift * 100,
      confidence: "high",
      money: repriceLever(inputs, drift.drift, currency, a)
    });
  }
  const comps = compareToBenchmark(items, bench, inputs).filter((c) => c.gap < -0.08).sort((x, y) => x.gap - y.gap);
  if (comps.length) {
    const perSale = comps.slice(0, 6).map((c) => ({ item: c.item, from: c.price, to: testPrice(c.price, c.median) }));
    const unitsKnown = items.filter((i) => i.weeklyUnits && comps.some((c) => c.item === i.name));
    let money = null;
    if (unitsKnown.length) {
      const m = unitsKnown.reduce((s, i) => {
        const p = perSale.find((x) => x.item === i.name);
        return s + (p ? (p.to - p.from) * i.weeklyUnits * 52 / 12 : 0);
      }, 0);
      money = { low: Math.round(m * 0.6), high: Math.round(m), currency, period: "month", assumptions: ["Weekly units you entered", "Low end assumes 40% of the gain is lost to fewer orders"] };
    }
    F.push({
      id: "underpriced",
      lever: "Dishes priced below the local market",
      why: `${comps.length} dish${comps.length > 1 ? "es sit" : " sits"} more than 8% under what comparable places in ${inputs.city} charge.`,
      action: "Test a small step toward the local median on these dishes for 4 weeks and watch orders.",
      items: comps.map((c) => c.item),
      priority: 85,
      confidence: "medium",
      money,
      perSale
    });
  }
  const up = dims.find((d) => d.key === "upsell");
  const hasAddons = up.evidence[0]?.tone === "gain";
  if (!hasAddons) {
    F.push({
      id: "addons",
      lever: "Add an add-on line",
      why: "Nothing on the menu invites a second purchase on the same dish.",
      action: "Add 3\u20135 add-ons where they fit naturally: extra shot, add cheese, add a side, make it a meal. Price them as round, easy numbers.",
      items: [],
      priority: 80,
      confidence: "medium",
      money: addonLever(inputs, currency, a)
    });
  }
  const desserts = items.filter((i) => i.section === "desserts" || i.section === "bakery").length;
  const drinks = items.filter((i) => DRINK_SECTIONS.includes(i.section)).length;
  if (desserts < 2 || drinks < 4 && inputs.concept !== "qsr") {
    F.push({
      id: "closer",
      lever: desserts < 2 ? "Build the dessert close" : "Give drinks a proper section",
      why: desserts < 2 ? "There is almost nothing to order after the main course." : "Drinks are thin on this menu, and they usually carry the best margin.",
      action: desserts < 2 ? "Offer 3\u20134 desserts, including one to share, and have staff mention them as plates are cleared." : "List 6\u201310 drinks with short descriptions and one house signature.",
      items: [],
      priority: 60,
      confidence: "medium",
      money: closerLever(inputs, currency, a)
    });
  }
  for (const c of categoryPricing(items)) {
    if (!c.hasAnchor && c.n >= 4) {
      const top = items.filter((i) => i.category === c.category && i.price != null).sort((x, y) => y.price - x.price)[0];
      F.push({
        id: `anchor:${c.category}`,
        lever: `Add a premium anchor to ${c.category}`,
        why: `${c.category} runs ${round(c.min, 1)}\u2013${round(c.max, 1)} with no stand-out dish. Without a high anchor, mid-priced dishes don't look like good value.`,
        action: `Add one premium version (bigger cut, better ingredient, sharing size) priced about 30\u201340% above ${top?.name ?? "the current top dish"}, and place it first.`,
        items: [],
        priority: 55 + c.n,
        confidence: "medium"
      });
    }
    if (c.ascending) {
      F.push({
        id: `order:${c.category}`,
        lever: `Stop listing ${c.category} cheapest-first`,
        why: "A list that climbs in price invites guests to choose by price, and they choose the cheapest.",
        action: "Put your best-earning dish first or boxed, and scatter prices so they don't form a column to scan.",
        items: [],
        priority: 50,
        confidence: "high"
      });
    }
  }
  const mer = dims.find((d) => d.key === "merchandising");
  if (mer.score != null && mer.score < 60) {
    F.push({
      id: "descriptions",
      lever: "Make the dishes you want to sell sound worth it",
      why: "Most dishes are listed by name only, or with flat wording.",
      action: "Write 10\u201320 words for your top 8 earners: one taste word, one cooking method, one detail of origin. See the suggested rewrites below.",
      items: [],
      priority: 58,
      confidence: "medium"
    });
  }
  if (!items.some((i) => SIGNATURE_MARKERS.test(`${i.name} ${i.description} ${i.category}`)) && items.length >= 10) {
    F.push({
      id: "signature",
      lever: "Point guests to two or three dishes",
      why: "Nothing is marked as a signature or chef's pick, so guests default to what they already know.",
      action: `Mark 2\u20133 high-earning dishes as "Chef's pick" or box them. Not more: if everything is special, nothing is.`,
      items: [],
      priority: 52,
      confidence: "medium"
    });
  }
  const st = dims.find((d) => d.key === "structure");
  if (st.score != null && st.score < 70) {
    F.push({
      id: "structure",
      lever: "Cut and regroup the menu",
      why: st.evidence.find((e) => e.tone === "leak")?.text ?? "The menu structure makes choosing harder than it needs to be.",
      action: "Remove the slowest sellers in crowded sections and merge thin sections. Fewer choices usually means faster orders and less waste.",
      items: [],
      priority: 48,
      confidence: "medium"
    });
  }
  F.sort((x, y) => (y.money ? y.money.high : 0) - (x.money ? x.money.high : 0) || y.priority - x.priority);
  const priced = items.map((i) => i.price).filter((p) => p != null);
  return {
    version: ENGINE_VERSION,
    score,
    coverage,
    assessed: assessed.length,
    verdict: verdictFor(score, coverage),
    dimensions: dims,
    findings: F,
    rewrites: buildRewrites(items),
    stats: {
      items: items.length,
      priced: priced.length,
      categories: new Set(items.map((i) => i.category)).size,
      withDescription: items.filter((i) => i.description.trim()).length,
      medianPrice: median(priced),
      currency
    },
    disclaimer: "A PIHOCO diagnostic, not an industry rating. Scores come from the menu text only; money figures are scenarios from your own numbers, not forecasts. Profitability needs recipe costs and sales data, which the full audit covers."
  };
}

// src/core/pricecheck.ts
function priceCheck(own, competitors) {
  const parsed = competitors.map((c) => ({ c, items: parseMenu(c.text).items.filter((i) => i.price != null) }));
  const rows = [];
  for (const it of own) {
    if (it.price == null) continue;
    const key = compareKey(it.name);
    const matches = [];
    for (const { c, items } of parsed) {
      let best = null;
      for (const ci of items) {
        const sameKey = compareKey(ci.name) === key;
        const sim = sameKey ? Math.max(0.85, similarity(it.name, ci.name)) : similarity(it.name, ci.name);
        if (sim >= 0.72 && (!best || sim > best.similarity)) best = { name: ci.name, price: ci.price, similarity: sim };
      }
      if (best) matches.push({ competitor: c.name, ...best });
    }
    if (!matches.length) continue;
    const med = median(matches.map((m) => m.price));
    const minSim = Math.min(...matches.map((m) => m.similarity));
    rows.push({
      item: it.name,
      yourPrice: it.price,
      matches,
      median: med,
      gap: med ? round((it.price - med) / med, 3) : null,
      confidence: minSim >= 0.9 ? "high" : minSim >= 0.8 ? "medium" : "low"
    });
  }
  return rows.sort((a, b) => (a.gap ?? 0) - (b.gap ?? 0));
}
function toBenchmarkRows(competitor, city, currency, area) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return parseMenu(competitor.text).items.filter((i) => i.price != null && i.confidence !== "low").map((i) => ({
    city,
    area: area ?? null,
    dish_key: compareKey(i.name),
    dish_name: i.name,
    price: i.price,
    currency,
    channel: "dine_in",
    source_url: competitor.url ?? null,
    collected_at: today
  }));
}

// src/core/osm.ts
var NOMINATIM = "https://nominatim.openstreetmap.org/search";
var OVERPASS = "https://overpass-api.de/api/interpreter";
async function geocode(query) {
  const url = `${NOMINATIM}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  const [hit] = await res.json();
  return hit ? { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon), label: hit.display_name } : null;
}
function overpassQuery(lat, lon, radiusM) {
  const sel = `["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court)$"]["name"]`;
  return `[out:json][timeout:25];(node${sel}(around:${radiusM},${lat},${lon});way${sel}(around:${radiusM},${lat},${lon}););out center tags 200;`;
}
function haversine(aLat, aLon, bLat, bLon) {
  const R = 6371e3, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function parseOverpass(json, lat, lon) {
  return (json?.elements ?? []).map((e) => {
    const t = e.tags ?? {};
    const plat = e.lat ?? e.center?.lat, plon = e.lon ?? e.center?.lon;
    const addr = [t["addr:housenumber"], t["addr:street"], t["addr:suburb"] ?? t["addr:city"]].filter(Boolean).join(" ");
    return {
      id: `${e.type}/${e.id}`,
      name: t.name,
      kind: t.amenity,
      cuisine: (t.cuisine ?? "").split(/[;,]/).map((s) => s.trim()).filter(Boolean),
      website: t.website ?? t["contact:website"] ?? void 0,
      lat: plat,
      lon: plon,
      distanceM: Math.round(haversine(lat, lon, plat, plon)),
      address: addr || void 0
    };
  }).filter((p) => p.name && isFinite(p.distanceM)).sort((a, b) => a.distanceM - b.distanceM);
}
async function nearbyCompetitors(address, opts = {}) {
  const at = await geocode(address);
  if (!at) return { origin: null, places: [] };
  const res = await fetch(OVERPASS, { method: "POST", body: "data=" + encodeURIComponent(overpassQuery(at.lat, at.lon, opts.radiusM ?? 1500)) });
  if (!res.ok) return { origin: at, places: [] };
  let places = parseOverpass(await res.json(), at.lat, at.lon);
  if (opts.kinds?.length) places = places.filter((p) => opts.kinds.includes(p.kind));
  if (opts.cuisine) {
    const c = opts.cuisine.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 2);
    const hit = places.filter((p) => p.cuisine.some((pc) => c.some((w) => pc.toLowerCase().includes(w))));
    places = hit.length >= 3 ? hit : places;
  }
  return { origin: at, places: places.slice(0, opts.limit ?? 25) };
}
var OSM_ATTRIBUTION = "\xA9 OpenStreetMap contributors";
export {
  COUNTRY_CURRENCY,
  CURRENCY_SYMBOL,
  DEFAULT_ASSUMPTIONS,
  DISHES,
  DISH_BY_KEY,
  ENGINE_VERSION,
  MIN_BENCHMARK_OBS,
  OSM_ATTRIBUTION,
  WEIGHTS,
  addonLever,
  buildRewrites,
  categoryPricing,
  closerLever,
  compareKey,
  compareToBenchmark,
  geocode,
  matchDish,
  monthlyRevenue,
  nearbyCompetitors,
  normalise,
  parseMenu,
  priceCheck,
  priceDrift,
  refreshItem,
  repriceLever,
  roundMoney,
  runXray,
  sectionFor,
  similarity,
  sumRanges,
  testPrice,
  toBenchmarkRows
};
