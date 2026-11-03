(() => {
      "use strict";

      const STORAGE_KEY = "kainMunaMealPlanner.v1";
      const THEME_KEY = "kainMunaTheme.v1";
      const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const CATEGORIES = ["all", "vegetable", "chicken", "pork", "fish", "egg", "mixed"];
      const CATEGORY_LABELS = { all: "All", vegetable: "Vegetable", chicken: "Chicken", pork: "Pork", fish: "Fish", egg: "Egg", mixed: "Mixed" };
      const CATEGORY_EMOJI = { vegetable: "🥬", chicken: "🍗", pork: "🥘", fish: "🐟", egg: "🍳", mixed: "🍲" };
      const MEAT_CATEGORIES = new Set(["chicken", "pork", "fish", "mixed"]);
      const PRICE_SOURCE_URL = "https://www.da.gov.ph/wp-content/uploads/2026/11/Weekly-Average-Prices-October-26-November-1-2026.pdf";
      const UNIT_INFO = {
        g: { family: "mass", factor: 1 }, kg: { family: "mass", factor: 1000 },
        oz: { family: "mass", factor: 28.3495 }, lb: { family: "mass", factor: 453.592 },
        ml: { family: "volume", factor: 1 }, L: { family: "volume", factor: 1000 },
        tsp: { family: "volume", factor: 5 }, tbsp: { family: "volume", factor: 15 }, cup: { family: "volume", factor: 240 },
        pcs: { family: "piece", factor: 1 }, dozen: { family: "piece", factor: 12 },
        cloves: { family: "clove", factor: 1 }, heads: { family: "clove", factor: 8 },
        bunch: { family: "bunch", factor: 1 }, pack: { family: "pack", factor: 1 },
        can: { family: "can", factor: 1 }, bottle: { family: "bottle", factor: 1 }, item: { family: "item", factor: 1 }
      };
      const UNIT_ALIASES = {
        g: "g", gram: "g", grams: "g", kg: "kg", kilo: "kg", kilos: "kg", kilogram: "kg", kilograms: "kg", oz: "oz", ounce: "oz", ounces: "oz", lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
        ml: "ml", milliliter: "ml", milliliters: "ml", l: "L", liter: "L", liters: "L", litre: "L", litres: "L",
        tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp", tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
        cup: "cup", cups: "cup", pc: "pcs", pcs: "pcs", piece: "pcs", pieces: "pcs", egg: "pcs", eggs: "pcs",
        dozen: "dozen", cloves: "cloves", clove: "cloves", head: "heads", heads: "heads",
        bunch: "bunch", bunches: "bunch", pack: "pack", packs: "pack", can: "can", cans: "can",
        bottle: "bottle", bottles: "bottle", item: "item", items: "item"
      };
      const MARKET_PRICE_PER_KG = {
        pork: 359.55, chicken: 205.40, mung: 147.03, sitaw: 116.10, cabbage: 171.63,
        carrot: 150.09, sayote: 53.36, cauliflower: 324.75, eggplant: 99.88,
        ampalaya: 115.70, chili: 166.27, squash: 61.11, tomato: 99.58,
        garlic: 151.15, ginger: 196.00, onion: 125.26, salt: 44.04, beans: 126.23,
        radish: 55, okra: 100, kangkong: 75, papaya: 82.29, malunggay: 80,
        calamansi: 107.42, flour: 70, tinapa: 300
      };

      const starterMeals = [
        { name: "Adobong Sitaw", category: "mixed", ingredients: "Sitaw (yardlong beans)\nPork, sliced\nSoy sauce\nVinegar\nGarlic\nOnion\nCooking oil\nBlack pepper", procedure: "Saute garlic and onion in a little oil.\nAdd pork and cook until lightly browned.\nStir in soy sauce, vinegar, and pepper; let it simmer briefly.\nAdd sitaw and a splash of water. Cover and cook until tender-crisp.\nTaste, adjust seasoning, and serve with rice." },
        { name: "Chop Suey", category: "vegetable", ingredients: "Cabbage\nCarrot\nSayote\nBaguio beans\nCauliflower\nGarlic\nOnion\nOyster sauce\nWater\nCooking oil", procedure: "Wash and slice all the vegetables.\nSaute garlic and onion until fragrant.\nAdd carrot, sayote, and beans; stir-fry for a few minutes.\nAdd cabbage, cauliflower, oyster sauce, and a little water.\nCover briefly until just tender, then serve." },
        { name: "Ginisang Monggo", category: "mixed", ingredients: "Mung beans\nPork or tinapa flakes\nMalunggay leaves\nTomato\nGarlic\nOnion\nFish sauce\nWater\nCooking oil", procedure: "Rinse mung beans and simmer in water until soft.\nSaute garlic, onion, and tomato in a separate pot.\nAdd pork or tinapa and cook through.\nStir in cooked mung beans and simmer for 10 minutes.\nAdd malunggay and fish sauce; cook until the leaves wilt." },
        { name: "Tortang Talong", category: "egg", ingredients: "Eggplant\nEggs\nGarlic\nSalt\nBlack pepper\nCooking oil", procedure: "Grill or boil the eggplant until soft, then peel the skin.\nFlatten the eggplant gently with a fork.\nBeat eggs with minced garlic, salt, and pepper.\nDip eggplant in the egg mixture.\nPan-fry until golden on both sides." },
        { name: "Ginisang Repolyo", category: "vegetable", ingredients: "Cabbage\nCarrot\nGarlic\nOnion\nSoy sauce\nWater\nCooking oil\nBlack pepper", procedure: "Slice cabbage and carrot into bite-size pieces.\nSaute garlic and onion until fragrant.\nAdd carrot and a splash of water; cook for 2 minutes.\nAdd cabbage, soy sauce, and pepper.\nStir-fry until the cabbage is tender but still crisp." },
        { name: "Adobong Kangkong", category: "vegetable", ingredients: "Kangkong (water spinach)\nSoy sauce\nVinegar\nGarlic\nOnion\nWater\nCooking oil\nBlack pepper", procedure: "Wash kangkong well and separate stems from leaves.\nSaute garlic and onion in a little oil.\nAdd stems, soy sauce, vinegar, pepper, and a splash of water.\nSimmer for 2 minutes, then add leaves.\nToss until just wilted and serve." },
        { name: "Tinolang Manok", category: "chicken", ingredients: "Chicken pieces\nGreen papaya or sayote\nMalunggay or chili leaves\nGinger\nGarlic\nOnion\nFish sauce\nWater\nCooking oil", procedure: "Saute ginger, garlic, and onion until fragrant.\nAdd chicken and fish sauce; cook until lightly browned.\nPour in water and simmer until chicken is tender.\nAdd papaya or sayote and cook until soft.\nStir in leaves, simmer for a minute, and serve hot." },
        { name: "Sinigang na Baboy", category: "pork", ingredients: "Pork ribs or pork belly\nSinigang mix\nKangkong\nRadish\nTomato\nOnion\nSitaw\nWater\nFish sauce", procedure: "Simmer pork in water with tomato and onion until tender.\nAdd radish and sitaw; cook until nearly soft.\nStir in sinigang mix and season with fish sauce.\nAdd kangkong and simmer until wilted.\nServe hot with rice." },
        { name: "Ginisang Sayote", category: "vegetable", ingredients: "Sayote\nGarlic\nOnion\nTomato\nSoy sauce or fish sauce\nWater\nCooking oil\nBlack pepper", procedure: "Peel, remove the seed, and slice sayote thinly.\nSaute garlic, onion, and tomato until soft.\nAdd sayote and stir to coat.\nAdd a splash of water and a little soy sauce or fish sauce.\nCover and cook until tender, stirring occasionally." },
        { name: "Sardinas with Misua", category: "fish", ingredients: "Canned sardines in tomato sauce\nMisua noodles\nGarlic\nOnion\nGinger\nWater\nGreen onion\nBlack pepper", procedure: "Saute garlic, onion, and ginger until fragrant.\nAdd sardines with their sauce and gently break them into pieces.\nPour in water and bring to a simmer.\nAdd misua and cook for 2 to 3 minutes.\nTop with green onion and pepper; serve while warm." },
        { name: "Egg Omelette", category: "egg", ingredients: "Eggs\nTomato\nOnion\nSalt\nBlack pepper\nCooking oil", procedure: "Beat the eggs with salt and pepper.\nChop tomato and onion, then mix into the eggs.\nHeat a little oil in a pan.\nPour in the mixture and cook until the bottom is set.\nFold, cook through, and serve with rice." },
        { name: "Fried Chicken", category: "chicken", ingredients: "Chicken pieces\nCalamansi juice\nGarlic\nSalt\nBlack pepper\nFlour\nCooking oil", procedure: "Season chicken with calamansi, crushed garlic, salt, and pepper.\nRest for at least 20 minutes.\nLightly coat each piece in flour.\nFry over medium heat until golden and cooked through.\nDrain on a rack or paper towel before serving." },
        { name: "Pakbet", category: "vegetable", ingredients: "Kalabasa (squash)\nTalong (eggplant)\nAmpalaya\nOkra\nSitaw\nTomato\nOnion\nBagoong\nWater", procedure: "Saute onion and tomato in a pot until soft.\nAdd kalabasa and a little water; simmer until nearly tender.\nAdd sitaw, okra, talong, and ampalaya.\nStir in bagoong to taste and cover the pot.\nCook until vegetables are tender, keeping them as whole as possible." },
        { name: "Ginisang Ampalaya", category: "egg", ingredients: "Ampalaya (bitter melon)\nEggs\nTomato\nGarlic\nOnion\nSalt\nCooking oil", procedure: "Slice ampalaya thinly and rub with a little salt; rinse if desired.\nSaute garlic, onion, and tomato until soft.\nAdd ampalaya and stir-fry until just tender.\nPour in beaten eggs and let them set slightly.\nGently stir, cook through, and serve." },
        { name: "Bicol Express", category: "pork", ingredients: "Pork belly, sliced\nCoconut milk\nChili peppers\nBagoong alamang\nGarlic\nOnion\nGinger\nCooking oil", procedure: "Saute garlic, onion, and ginger until fragrant.\nAdd pork and cook until browned.\nStir in bagoong and chili peppers.\nPour in coconut milk and simmer gently until the pork is tender.\nReduce the sauce to your preferred thickness and serve with rice." }
      ].map((meal, index) => ({ id: `starter-${index + 1}`, ...meal }));

      const blankSchedule = () => Object.fromEntries(DAYS.map(day => [day, []]));
      const makeId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `dish-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
      const freshState = () => ({ meals: starterMeals.map(meal => ({ ...meal })), schedule: blankSchedule(), shoppingChecked: {}, shoppingAdjustments: {} });

      function readState() {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) return freshState();
          const parsed = JSON.parse(stored);
          if (!parsed || !Array.isArray(parsed.meals)) return freshState();
          const schedule = blankSchedule();
          for (const day of DAYS) {
            const entries = parsed.schedule && Array.isArray(parsed.schedule[day]) ? parsed.schedule[day] : [];
            schedule[day] = entries.filter(entry => entry && typeof entry.dishId === "string").map(entry => ({
              id: typeof entry.id === "string" ? entry.id : makeId(),
              dishId: entry.dishId,
              checkedIngredients: entry.checkedIngredients && typeof entry.checkedIngredients === "object" ? entry.checkedIngredients : {}
            }));
          }
          const meals = parsed.meals.filter(meal => meal && typeof meal.name === "string").map(meal => ({
            id: typeof meal.id === "string" ? meal.id : makeId(),
            name: meal.name,
            category: CATEGORIES.includes(meal.category) && meal.category !== "all" ? meal.category : "mixed",
            ingredients: typeof meal.ingredients === "string" ? meal.ingredients : "",
            procedure: typeof meal.procedure === "string" ? meal.procedure : ""
          }));
          const existingIds = new Set(meals.map(meal => meal.id));
          for (const day of DAYS) schedule[day] = schedule[day].filter(entry => existingIds.has(entry.dishId));
          return {
            meals,
            schedule,
            shoppingChecked: parsed.shoppingChecked && typeof parsed.shoppingChecked === "object" ? parsed.shoppingChecked : {},
            shoppingAdjustments: parsed.shoppingAdjustments && typeof parsed.shoppingAdjustments === "object" ? parsed.shoppingAdjustments : {}
          };
        } catch (error) {
          console.warn("Could not read the saved meal plan. Starting with the sample library.", error);
          return freshState();
        }
      }

      let state = readState();
      let activeCategory = "all";
      let toastTimer;
      const els = {
        dashboard: document.getElementById("dashboardGrid"), week: document.getElementById("weekGrid"),
        library: document.getElementById("mealGrid"), filters: document.getElementById("categoryFilters"),
        search: document.getElementById("searchDish"), shopping: document.getElementById("shoppingItems"),
        shoppingSummary: document.getElementById("shoppingSummary"), shoppingGrandTotal: document.getElementById("shoppingGrandTotal"),
        shoppingCount: document.getElementById("shoppingCount"), dialog: document.getElementById("addDishDialog"),
        addForm: document.getElementById("addDishForm"), toast: document.getElementById("toast"), toastMessage: document.getElementById("toastMessage"),
        menuToggle: document.getElementById("menuToggle"), mobileDrawer: document.getElementById("mobileDrawer"), drawerBackdrop: document.getElementById("drawerBackdrop")
      };
      const openDays = new Set();
      const openMeals = new Set();
      let lastMobileLayout = window.matchMedia("(max-width: 767px)").matches;

      function persist() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          return true;
        } catch (error) {
          console.error("Could not save the meal plan.", error);
          showToast("Storage is full. Try removing a few saved dishes.");
          return false;
        }
      }

      function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
      }

      function ingredientLines(value) {
        return String(value || "").split(/\r?\n/).map(line => line.trim().replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, "").trim()).filter(Boolean);
      }

      function procedureLines(value) {
        return String(value || "").split(/\r?\n/).map(line => line.trim().replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, "").trim()).filter(Boolean);
      }

      function ingredientKey(value) { return String(value).trim().toLocaleLowerCase().replace(/\s+/g, " "); }
      function getDish(id) { return state.meals.find(meal => meal.id === id); }
      function showToast(message) {
        els.toastMessage.textContent = message;
        els.toast.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
      }

      function isMobileLayout() { return window.matchMedia("(max-width: 767px)").matches; }
      function formatMoney(value) {
        return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
      }
      function formatQuantity(value) {
        const amount = Number(value) || 0;
        return String(Number(amount.toFixed(3)));
      }
      function parseAmount(value) {
        const source = String(value).replace(",", ".").trim();
        if (source.includes("/")) {
          const [numerator, denominator] = source.split("/").map(Number);
          return denominator ? numerator / denominator : NaN;
        }
        return Number(source);
      }
      function normalizeUnit(value) {
        const source = String(value || "").trim().toLowerCase().replace(/[.]/g, "");
        return UNIT_ALIASES[source] || UNIT_ALIASES[source.replace(/\s+/g, "")] || source;
      }
      function convertQuantity(amount, fromUnit, toUnit) {
        const from = UNIT_INFO[fromUnit];
        const to = UNIT_INFO[toUnit];
        if (!from || !to || from.family !== to.family) return null;
        return Number(amount) * from.factor / to.factor;
      }
      function convertUnitPrice(price, fromUnit, toUnit) {
        const from = UNIT_INFO[fromUnit];
        const to = UNIT_INFO[toUnit];
        if (!from || !to || from.family !== to.family) return null;
        return Number(price) * to.factor / from.factor;
      }
      function gramsPerNamedUnit(name, unit) {
        const key = canonicalShoppingName(name);
        const weights = {
          onion: { pcs: 70 }, "green onion": { bunch: 100 }, tomato: { pcs: 60 }, carrot: { pcs: 110 },
          eggplant: { pcs: 200 }, sayote: { pcs: 350 }, ampalaya: { pcs: 250 }, squash: { pcs: 800 },
          cabbage: { pcs: 750 }, cauliflower: { pcs: 700 }, sitaw: { bunch: 150 }, "baguio beans": { bunch: 150 },
          chili: { pcs: 10 }, garlic: { cloves: 4, heads: 32 }, ginger: { item: 30 }, egg: { pcs: 58 },
          chicken: { pcs: 300 }, pork: { pcs: 250 }, "pork belly": { pcs: 250 }, kangkong: { bunch: 200 }, "malunggay leaves": { bunch: 100 }
        };
        return weights[key] && weights[key][unit] ? weights[key][unit] : null;
      }
      function convertShoppingQuantity(name, quantity, fromUnit, toUnit) {
        const direct = convertQuantity(quantity, fromUnit, toUnit);
        if (direct !== null) return direct;
        const fromInfo = UNIT_INFO[fromUnit];
        const toInfo = UNIT_INFO[toUnit];
        if (!fromInfo || !toInfo) return null;
        if (fromInfo.family === "mass" && toInfo.family !== "mass") {
          const grams = gramsPerNamedUnit(name, toUnit);
          return grams ? Number(quantity) * fromInfo.factor / grams : null;
        }
        if (fromInfo.family !== "mass" && toInfo.family === "mass") {
          const grams = gramsPerNamedUnit(name, fromUnit);
          return grams ? Number(quantity) * grams / toInfo.factor : null;
        }
        return null;
      }
      function convertShoppingUnitPrice(name, price, fromUnit, toUnit) {
        const oldUnitsPerNewUnit = convertShoppingQuantity(name, 1, toUnit, fromUnit);
        return oldUnitsPerNewUnit === null ? null : Number(price) * oldUnitsPerNewUnit;
      }
      function canonicalShoppingName(value) {
        const name = String(value || "").toLocaleLowerCase()
          .replace(/\([^)]*\)/g, " ")
          .replace(/\b(canned|sliced|pieces|piece|local|fresh|chopped|thinly sliced)\b/g, " ")
          .replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
        if (/yardlong bean|\bsitaw\b/.test(name)) return "sitaw";
        if (/eggplant|\btalong\b/.test(name)) return "eggplant";
        if (/squash|\bkalabasa\b/.test(name)) return "squash";
        if (/bitter melon|\bampalaya\b/.test(name)) return "ampalaya";
        if (/water spinach|\bkangkong\b/.test(name)) return "kangkong";
        if (/mung bean|\bmonggo\b/.test(name)) return "mung beans";
        if (/\bgreen onion\b|\bspring onion\b/.test(name)) return "green onion";
        if (/\beggs?\b/.test(name)) return "egg";
        if (/\bpork belly\b|\bliempo\b/.test(name)) return "pork belly";
        if (/\bpork\b/.test(name)) return "pork";
        if (/\bchicken\b/.test(name)) return "chicken";
        if (/\bgarlic\b/.test(name)) return "garlic";
        if (/\bginger\b/.test(name)) return "ginger";
        if (/\bonion\b/.test(name)) return "onion";
        if (/\bcabbage\b/.test(name)) return "cabbage";
        if (/\bcarrots?\b/.test(name)) return "carrot";
        if (/\bsayote\b|\bchayote\b/.test(name)) return "sayote";
        if (/\bcauliflower\b/.test(name)) return "cauliflower";
        if (/\btomatoes?\b/.test(name)) return "tomato";
        if (/\bchil+ies?\b|\bchili peppers?\b/.test(name)) return "chili";
        if (/\bbaguio beans?\b|\bhabichuelas\b/.test(name)) return "baguio beans";
        if (/\bmalunggay\b/.test(name)) return "malunggay leaves";
        if (/\bmisua\b/.test(name)) return "misua";
        if (/\bsardines?\b/.test(name)) return "sardines";
        if (/\bsoy sauce\b/.test(name)) return "soy sauce";
        if (/\bfish sauce\b/.test(name)) return "fish sauce";
        if (/\boyster sauce\b/.test(name)) return "oyster sauce";
        if (/\bcooking oil\b/.test(name)) return "cooking oil";
        if (/\bblack pepper\b/.test(name)) return "black pepper";
        if (/\bsalt\b/.test(name)) return "salt";
        return name;
      }
      function parseIngredientLine(line) {
        const match = String(line || "").trim().match(/^(\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+)\s*(.*)$/);
        if (!match) return { name: String(line || "").trim(), quantity: null, unit: null };
        const quantity = parseAmount(match[1]);
        let rest = match[2].trim();
        const first = rest.match(/^([a-zA-Z]+)(?:\s+|$)(.*)$/);
        if (first) {
          const alias = UNIT_ALIASES[first[1].toLowerCase()];
          if (alias) {
            const name = first[2].trim() || (alias === "pcs" ? first[1].replace(/s$/i, "") : "");
            if (name) return { name, quantity, unit: alias };
          }
        }
        const suffix = rest.match(/^(.*\S)\s+([a-zA-Z]+)$/);
        if (suffix && UNIT_ALIASES[suffix[2].toLowerCase()]) {
          return { name: suffix[1].trim(), quantity, unit: UNIT_ALIASES[suffix[2].toLowerCase()] };
        }
        return { name: rest, quantity, unit: "pcs" };
      }
      function defaultShoppingEstimate(rawName) {
        const key = canonicalShoppingName(rawName);
        const byKg = (rate, quantity = 0.2) => ({ quantity, unit: "kg", unitCost: rate });
        if (/\bwater\b/.test(key)) return { quantity: 0.5, unit: "L", unitCost: 0 };
        if (/\bgarlic\b/.test(key)) return { quantity: 2, unit: "cloves", unitCost: MARKET_PRICE_PER_KG.garlic * 0.004 };
        if (/\bonion\b/.test(key) && key !== "green onion") return { quantity: 0.5, unit: "pcs", unitCost: MARKET_PRICE_PER_KG.onion * 0.07 };
        if (/\bgreen onion\b/.test(key)) return { quantity: 1, unit: "bunch", unitCost: 18 };
        if (/\begg\b/.test(key)) return { quantity: 2, unit: "pcs", unitCost: 8.82 };
        if (/\b(pork|chicken)\b/.test(key)) return byKg(key.includes("chicken") ? MARKET_PRICE_PER_KG.chicken : MARKET_PRICE_PER_KG.pork, 0.25);
        if (/\bsardines\b/.test(key)) return { quantity: 1, unit: "can", unitCost: 20 };
        if (/\bmisua\b/.test(key)) return { quantity: 1, unit: "pack", unitCost: 18 };
        if (/\b(malunggay|kangkong)\b/.test(key)) return { quantity: 1, unit: "bunch", unitCost: key.includes("malunggay") ? 20 : 25 };
        if (/\bsoy sauce\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 2.25 };
        if (/\bfish sauce\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 2.5 };
        if (/\bvinegar\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 1.5 };
        if (/\boyster sauce\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 3.5 };
        if (/\bbagoong\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 4 };
        if (/\bsinigang mix\b/.test(key)) return { quantity: 1, unit: "pack", unitCost: 12 };
        if (/\bcoconut milk\b/.test(key)) return { quantity: 1, unit: "pack", unitCost: 28 };
        if (/\bcooking oil\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 101.84 / 1000 * 15 };
        if (/\bsalt\b/.test(key)) return { quantity: 0.5, unit: "tsp", unitCost: 44.04 / 1000 * 5 };
        if (/\bblack pepper\b/.test(key)) return { quantity: 0.5, unit: "tsp", unitCost: 0.8 };
        if (/\bflour\b/.test(key)) return { quantity: 0.25, unit: "cup", unitCost: 8.4 };
        if (/\bcalamansi juice\b/.test(key)) return { quantity: 1, unit: "tbsp", unitCost: 1.7 };
        if (/\bgreen papaya\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.papaya, 0.25);
        if (/\bradish\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.radish, 0.15);
        if (/\bokra\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.okra, 0.1);
        if (/\bampalaya\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.ampalaya, 0.15);
        if (/\bchili\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.chili, 0.03);
        if (/\bsquash\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.squash, 0.2);
        if (/\bsitaw\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.sitaw, 0.15);
        if (/\bcabbage\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.cabbage, 0.2);
        if (/\bcarrot\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.carrot, 0.1);
        if (/\bsayote\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.sayote, 0.2);
        if (/\bcauliflower\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.cauliflower, 0.15);
        if (/\beggplant\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.eggplant, 0.2);
        if (/\btomato\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.tomato, 0.1);
        if (/\bbaguio beans\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.beans, 0.1);
        if (/\bmung beans\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.mung, 0.2);
        if (/\bginger\b/.test(key)) return { quantity: 30, unit: "g", unitCost: MARKET_PRICE_PER_KG.ginger / 1000 };
        if (/\b(tinapa|smoked fish)\b/.test(key)) return byKg(MARKET_PRICE_PER_KG.tinapa, 0.1);
        return { quantity: 1, unit: "item", unitCost: 10 };
      }
      function unitOptionsFor(unit) {
        const family = (UNIT_INFO[unit] || UNIT_INFO.item).family;
        return Object.entries(UNIT_INFO).filter(([, info]) => info.family === family).map(([name]) => name);
      }
      function suggestedUnitCost(name, unit) {
        const base = defaultShoppingEstimate(name);
        const converted = convertShoppingUnitPrice(name, base.unitCost, base.unit, unit);
        return converted === null ? base.unitCost : converted;
      }
      function shoppingStats(items) {
        const mealEntries = DAYS.flatMap(day => state.schedule[day]);
        const scheduledDays = DAYS.filter(day => state.schedule[day].length > 0).length;
        const totalOccurrences = items.reduce((sum, item) => sum + item.occurrences, 0);
        const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
        return { totalMeals: mealEntries.length, totalIngredients: totalOccurrences, distinctIngredients: items.length, scheduledDays, totalCost };
      }

      function renderDashboard() {
        const entries = DAYS.flatMap(day => state.schedule[day].map(entry => ({ ...entry, day })));
        const useCounts = new Map();
        const uniqueIngredients = new Set();
        let vegetableMeals = 0;
        let meatMeals = 0;
        for (const entry of entries) {
          const meal = getDish(entry.dishId);
          if (!meal) continue;
          if (meal.category === "vegetable") vegetableMeals += 1;
          if (MEAT_CATEGORIES.has(meal.category)) meatMeals += 1;
          for (const ingredient of ingredientLines(meal.ingredients)) {
            const key = ingredientKey(ingredient);
            uniqueIngredients.add(key);
            const prior = useCounts.get(key);
            useCounts.set(key, { name: prior ? prior.name : ingredient, count: (prior ? prior.count : 0) + 1 });
          }
        }
        const mostUsed = [...useCounts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0];
        const stats = [
          { label: "Scheduled meals", value: entries.length, foot: "across week", icon: "🍱" },
          { label: "Ingredients needed", value: uniqueIngredients.size, foot: "ingredients to shop for", icon: "🧺" },
          { label: "Most used ingredient", value: mostUsed ? mostUsed.name : "—", foot: mostUsed ? `in ${mostUsed.count} planned meal${mostUsed.count === 1 ? "" : "s"}` : "add a meal to get started", icon: "✦" },
          { label: "Vegetable / meat dishes", value: `${vegetableMeals} / ${meatMeals}`, foot: "scheduled this week", icon: "🥬" }
        ];
        els.dashboard.innerHTML = stats.map(stat => `<article class="stat-card"><div class="stat-top"><span>${escapeHTML(stat.label)}</span><span class="stat-icon" aria-hidden="true">${stat.icon}</span></div><div class="stat-value">${escapeHTML(stat.value)}</div><div class="stat-foot">${escapeHTML(stat.foot)}</div></article>`).join("");
      }

      function dishOptions(selectedId = "") {
        const options = state.meals.slice().sort((a, b) => a.name.localeCompare(b.name)).map(meal => `<option value="${escapeHTML(meal.id)}" ${meal.id === selectedId ? "selected" : ""}>${escapeHTML(meal.name)}</option>`).join("");
        return `<option value="">${state.meals.length ? "Choose a dish…" : "Add a dish to your library"}</option>${options}`;
      }

      function renderScheduledMeal(day, entry) {
        const dish = getDish(entry.dishId);
        if (!dish) return "";
        const ingredients = ingredientLines(dish.ingredients);
        const steps = procedureLines(dish.procedure);
        const mealChecks = ingredients.length ? ingredients.map((ingredient, index) => {
          const key = ingredientKey(ingredient);
          const checked = Boolean(entry.checkedIngredients && entry.checkedIngredients[key]);
          return `<label class="ingredient-check"><input type="checkbox" data-action="check-meal-ingredient" data-day="${escapeHTML(day)}" data-entry="${escapeHTML(entry.id)}" data-ingredient="${escapeHTML(key)}" ${checked ? "checked" : ""}><span>${escapeHTML(ingredient)}</span></label>`;
        }).join("") : `<span class="recipe-empty">No ingredients saved yet.</span>`;
        const stepsMarkup = steps.length ? `<ol class="steps-list">${steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>` : `<span class="recipe-empty">No procedure saved yet.</span>`;
        return `<article class="scheduled-card" data-entry-card="${escapeHTML(entry.id)}">
          <div class="scheduled-title-row"><div><h4 class="scheduled-title">${escapeHTML(dish.name)}</h4><span class="scheduled-category">${escapeHTML(CATEGORY_LABELS[dish.category] || "Mixed")}</span></div>
            <div class="scheduled-actions"><button class="mini-icon-btn" type="button" data-action="toggle-replace" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="Replace ${escapeHTML(dish.name)}">↻</button><button class="mini-icon-btn remove" type="button" data-action="remove-scheduled" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="Remove ${escapeHTML(dish.name)}">✕</button></div>
          </div>
          <div class="replace-row" data-replace-row="${escapeHTML(entry.id)}"><select class="control" aria-label="Choose replacement dish">${dishOptions(dish.id)}</select><button class="btn btn-primary btn-small" type="button" data-action="replace-scheduled" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}">Replace</button></div>
          <div class="recipe-part"><h4>Ingredients</h4><div class="ingredient-checks">${mealChecks}</div></div>
          <div class="recipe-part"><h4>Procedure</h4>${stepsMarkup}</div>
        </article>`;
      }

      function renderWeek() {
        els.week.innerHTML = DAYS.map(day => {
          const entries = state.schedule[day];
          const meals = entries.map(entry => renderScheduledMeal(day, entry)).join("");
          const open = !isMobileLayout() || openDays.has(day) ? "open" : "";
          return `<details class="day-card" data-day-card="${escapeHTML(day)}" ${open}><summary class="day-head"><h3>${escapeHTML(day)}</h3><span class="day-count" aria-label="${entries.length} meals">${entries.length}</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
            <div class="day-card-content"><div class="day-add-row"><select class="control" data-day-select="${escapeHTML(day)}" aria-label="Select a dish for ${escapeHTML(day)}">${dishOptions()}</select><button class="btn btn-primary btn-small" type="button" data-action="add-scheduled" data-day="${escapeHTML(day)}" ${state.meals.length ? "" : "disabled"}>＋ Add</button></div>
            <div class="day-meals">${meals || `<div class="day-empty">Meal Here</div>`}</div></div></details>`;
        }).join("");
      }

      function renderFilters() {
        els.filters.innerHTML = CATEGORIES.map(category => `<button class="filter-chip" type="button" data-filter="${category}" aria-pressed="${activeCategory === category}">${CATEGORY_LABELS[category]}</button>`).join("");
      }

      function renderLibrary() {
        const query = els.search.value.trim().toLocaleLowerCase();
        const meals = state.meals.filter(meal => {
          const matchesCategory = activeCategory === "all" || meal.category === activeCategory;
          const matchesSearch = !query || `${meal.name} ${meal.ingredients} ${meal.procedure}`.toLocaleLowerCase().includes(query);
          return matchesCategory && matchesSearch;
        }).sort((a, b) => a.name.localeCompare(b.name));
        if (!meals.length) {
          const noMeals = state.meals.length === 0;
          els.library.innerHTML = `<div class="empty-state"><div><div class="empty-illustration" aria-hidden="true">${noMeals ? "🥣" : "🔎"}</div><h3>${noMeals ? "Your library is ready for a first dish." : "No dishes found."}</h3><p>${noMeals ? "Add a student-budget favorite and save its ingredients and steps here." : "Try another search or category, or add this dish to your library."}</p>${noMeals ? `<button class="btn btn-primary btn-small" type="button" data-action="open-add">Add your first dish</button>` : ""}</div></div>`;
          return;
        }
        els.library.innerHTML = meals.map(meal => {
          const ingredients = ingredientLines(meal.ingredients);
          const steps = procedureLines(meal.procedure);
          const open = !isMobileLayout() || openMeals.has(meal.id) ? "open" : "";
          const ingredientPreview = ingredients.length
            ? `<div class="ingredient-chips">${ingredients.map(ingredient => `<span class="ingredient-chip">${escapeHTML(ingredient)}</span>`).join("")}</div>`
            : `<span class="empty-recipe">No ingredients saved yet.</span>`;
          const procedurePreview = steps.length
            ? `<ol class="preview-steps">${steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>`
            : `<span class="empty-recipe">No procedure saved yet.</span>`;
          return `<details class="meal-card" data-meal-card="${escapeHTML(meal.id)}" data-category="${escapeHTML(meal.category)}" ${open}>
            <summary class="meal-card-head"><div style="display:flex;align-items:center;gap:11px;min-width:0"><span class="meal-emoji" aria-hidden="true">${CATEGORY_EMOJI[meal.category] || "🍲"}</span><div><h3>${escapeHTML(meal.name)}</h3><span class="category-tag">${escapeHTML(CATEGORY_LABELS[meal.category] || "Mixed")}</span></div></div><span class="recipe-meta">${ingredients.length} ${ingredients.length === 1 ? "ingredient" : "ingredients"}<br>${steps.length} ${steps.length === 1 ? "step" : "steps"}</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
            <div class="meal-card-body">
              <div class="meal-recipe-view">
                <section class="recipe-preview-block"><div class="recipe-preview-heading"><h4>Ingredients</h4><span class="preview-count">${ingredients.length}</span></div>${ingredientPreview}</section>
                <section class="recipe-preview-block"><div class="recipe-preview-heading"><h4>How to make it</h4><span class="preview-count">${steps.length}</span></div>${procedurePreview}</section>
              </div>
              <div class="meal-editor">
                <label class="field-label">Ingredients <span class="field-hint">One ingredient per line</span><textarea class="recipe-textarea" data-field="ingredients" aria-label="Ingredients for ${escapeHTML(meal.name)}">${escapeHTML(meal.ingredients)}</textarea></label>
                <label class="field-label">Procedure <span class="field-hint">One step per line</span><textarea class="recipe-textarea" data-field="procedure" aria-label="Procedure for ${escapeHTML(meal.name)}">${escapeHTML(meal.procedure)}</textarea></label>
              </div>
            </div>
            <div class="meal-card-actions">
              <button class="btn btn-primary btn-small edit-open" type="button" data-action="edit-meal" data-id="${escapeHTML(meal.id)}">✎ Edit recipe</button>
              <button class="btn btn-primary btn-small edit-save" type="button" data-action="save-meal" data-id="${escapeHTML(meal.id)}">Save changes</button>
              <button class="btn btn-secondary btn-small edit-cancel" type="button" data-action="cancel-edit" data-id="${escapeHTML(meal.id)}">Cancel</button>
              <button class="btn btn-danger btn-small" type="button" data-action="delete-meal" data-id="${escapeHTML(meal.id)}">Delete</button>
            </div>
          </details>`;
        }).join("");
      }

      function collectShoppingItems() {
        const items = new Map();
        for (const day of DAYS) {
          for (const entry of state.schedule[day]) {
            const dish = getDish(entry.dishId);
            if (!dish) continue;
            for (const line of ingredientLines(dish.ingredients)) {
              const parsed = parseIngredientLine(line);
              const key = canonicalShoppingName(parsed.name);
              if (!key) continue;
              const estimate = defaultShoppingEstimate(parsed.name);
              const quantity = parsed.quantity === null ? estimate.quantity : parsed.quantity;
              const unit = parsed.unit || estimate.unit;
              const existing = items.get(key);
              if (existing) {
                const converted = convertShoppingQuantity(existing.name, quantity, unit, existing.unit);
                if (converted !== null) existing.quantity += converted;
                else if (unit === existing.unit) existing.quantity += quantity;
                existing.occurrences += 1;
              } else {
                items.set(key, {
                  key,
                  name: parsed.name,
                  quantity,
                  unit,
                  unitCost: suggestedUnitCost(parsed.name, unit),
                  occurrences: 1
                });
              }
            }
          }
        }
        return [...items.values()].map(item => {
          item.baseQuantity = item.quantity;
          item.baseUnit = item.unit;
          const saved = state.shoppingAdjustments[item.key] || {};
          const savedUnit = typeof saved.unit === "string" && UNIT_INFO[normalizeUnit(saved.unit)] ? normalizeUnit(saved.unit) : item.unit;
          const baseInSavedUnit = convertShoppingQuantity(item.name, item.baseQuantity, item.baseUnit, savedUnit);
          item.baseQuantityInUnit = baseInSavedUnit === null ? item.baseQuantity : baseInSavedUnit;
          item.unit = savedUnit;
          if (Number.isFinite(Number(saved.quantity)) && saved.quantity !== "") {
            const originalBase = Number.isFinite(Number(saved.baseQuantityAtEdit)) ? Number(saved.baseQuantityAtEdit) : item.baseQuantityInUnit;
            item.quantity = Math.max(0, Number(saved.quantity) + item.baseQuantityInUnit - originalBase);
          } else item.quantity = item.baseQuantityInUnit;
          if (Number.isFinite(Number(saved.unitCost)) && saved.unitCost !== "") item.unitCost = Math.max(0, Number(saved.unitCost));
          item.subtotal = item.quantity * item.unitCost;
          return item;
        }).sort((a, b) => a.name.localeCompare(b.name));
      }

      function renderShopping() {
        const items = collectShoppingItems();
        const stats = shoppingStats(items);
        els.shoppingCount.textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;
        els.shoppingGrandTotal.textContent = formatMoney(stats.totalCost);
        els.shoppingSummary.innerHTML = [
          { label: "Total ingredients", value: stats.totalIngredients, icon: "☷" },
          { label: "Distinct ingredients", value: stats.distinctIngredients, icon: "✦" },
          { label: "Estimated grocery budget", value: formatMoney(stats.totalCost), icon: "₱", cost: true },
          { label: "Scheduled days", value: stats.scheduledDays, icon: "▦" }
        ].map(card => `<article class="shopping-stat-card"><span class="shopping-stat-icon" aria-hidden="true">${card.icon}</span><span class="shopping-stat-label">${escapeHTML(card.label)}</span><strong class="shopping-stat-value ${card.cost ? "is-cost" : ""}">${escapeHTML(card.value)}</strong></article>`).join("");
        if (!items.length) {
          els.shopping.innerHTML = `<div class="shopping-empty"><span aria-hidden="true">🧺</span><strong>Your shopping list will appear here.</strong><small>Schedule meals to gather and estimate ingredients.</small></div>`;
          return;
        }
        els.shopping.innerHTML = items.map(item => {
          const units = unitOptionsFor(item.unit);
          const options = units.includes(item.unit) ? units : [item.unit, ...units];
          return `<article class="shopping-row">
            <div class="shopping-cell ingredient-cell ${state.shoppingChecked[item.key] ? "is-checked" : ""}" data-label="Ingredient"><label class="shopping-check"><input type="checkbox" data-action="check-shopping-item" data-ingredient="${escapeHTML(item.key)}" ${state.shoppingChecked[item.key] ? "checked" : ""} aria-label="Mark ${escapeHTML(item.name)} as purchased"><span aria-hidden="true"></span></label><div class="shopping-ingredient-copy"><strong>${escapeHTML(item.name)}</strong><small>Used in ${item.occurrences} planned meal${item.occurrences === 1 ? "" : "s"}</small></div></div>
            <div class="shopping-cell" data-label="Quantity"><input class="shopping-input" type="number" min="0" step="0.01" value="${escapeHTML(formatQuantity(item.quantity))}" data-shopping-field="quantity" data-ingredient="${escapeHTML(item.key)}" aria-label="Quantity for ${escapeHTML(item.name)}"></div>
            <div class="shopping-cell" data-label="Unit"><select class="shopping-unit" data-shopping-field="unit" data-ingredient="${escapeHTML(item.key)}" aria-label="Unit for ${escapeHTML(item.name)}">${options.map(unit => `<option value="${escapeHTML(unit)}" ${unit === item.unit ? "selected" : ""}>${escapeHTML(unit)}</option>`).join("")}</select></div>
            <div class="shopping-cell" data-label="Unit cost"><label class="money-input"><span>₱</span><input class="shopping-input" type="number" min="0" step="0.01" value="${escapeHTML(Number(item.unitCost.toFixed(2)))}" data-shopping-field="unitCost" data-ingredient="${escapeHTML(item.key)}" aria-label="Estimated unit cost for ${escapeHTML(item.name)}"></label></div>
            <div class="shopping-cell subtotal-cell" data-label="Subtotal"><strong>${escapeHTML(formatMoney(item.subtotal))}</strong></div>
          </article>`;
        }).join("");
      }

      function renderAll() {
        renderDashboard();
        renderWeek();
        renderFilters();
        renderLibrary();
        renderShopping();
      }

      function addScheduledMeal(day, dishId) {
        if (!DAYS.includes(day) || !getDish(dishId)) return;
        state.schedule[day].push({ id: makeId(), dishId, checkedIngredients: {} });
        openDays.add(day);
        persist();
        renderAll();
        showToast(`Added to ${day}. Looking good!`);
      }

      function openAddDialog() {
        els.dialog.showModal();
        els.addForm.elements.name.focus();
      }

      function closeDialog() { els.dialog.close(); }
      function setDrawerOpen(open) {
        els.mobileDrawer.classList.toggle("is-open", open);
        els.mobileDrawer.setAttribute("aria-hidden", String(!open));
        els.menuToggle.setAttribute("aria-expanded", String(open));
        els.menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        els.drawerBackdrop.hidden = !open;
        document.body.classList.toggle("menu-open", open);
        if (open) document.getElementById("closeMenu").focus();
        else els.menuToggle.focus();
      }
      function applyTheme(isDark) {
        document.body.classList.toggle("dark", isDark);
        for (const button of [document.getElementById("themeToggle"), document.getElementById("mobileThemeToggle")]) {
          button.setAttribute("aria-pressed", String(isDark));
          button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
          button.querySelector("span").textContent = isDark ? "Light mode" : "Dark mode";
          button.firstChild.textContent = isDark ? "☼ " : "◐ ";
        }
        try { localStorage.setItem(THEME_KEY, isDark ? "dark" : "light"); } catch (error) { /* Appearance preference is optional. */ }
      }

      document.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const action = button.dataset.action;

        if (action === "open-add") { openAddDialog(); return; }
        if (action === "add-scheduled") {
          const select = document.querySelector(`[data-day-select="${CSS.escape(button.dataset.day)}"]`);
          if (!select || !select.value) { showToast("Choose a dish first."); return; }
          addScheduledMeal(button.dataset.day, select.value);
          return;
        }
        if (action === "edit-meal") {
          const card = button.closest("[data-meal-card]");
          if (!card) return;
          openMeals.add(card.dataset.mealCard);
          card.open = true;
          card.classList.add("is-editing");
          card.querySelector('[data-field="ingredients"]').focus();
          return;
        }
        if (action === "cancel-edit") {
          renderLibrary();
          return;
        }
        if (action === "save-meal") {
          const card = button.closest("[data-meal-card]");
          const meal = getDish(button.dataset.id);
          if (!card || !meal) return;
          meal.ingredients = card.querySelector('[data-field="ingredients"]').value;
          meal.procedure = card.querySelector('[data-field="procedure"]').value;
          persist();
          renderAll();
          showToast(`${meal.name} saved to your library.`);
          return;
        }
        if (action === "delete-meal") {
          const meal = getDish(button.dataset.id);
          if (!meal) return;
          const scheduledCount = DAYS.reduce((count, day) => count + state.schedule[day].filter(entry => entry.dishId === meal.id).length, 0);
          const scheduleNote = scheduledCount ? ` It is scheduled ${scheduledCount} time${scheduledCount === 1 ? "" : "s"}, and those plan entries will also be removed.` : "";
          if (!window.confirm(`Delete “${meal.name}” from your master meal library?${scheduleNote}`)) return;
          state.meals = state.meals.filter(item => item.id !== meal.id);
          for (const day of DAYS) state.schedule[day] = state.schedule[day].filter(entry => entry.dishId !== meal.id);
          persist();
          renderAll();
          showToast(`${meal.name} deleted.`);
          return;
        }
        if (action === "remove-scheduled") {
          const day = button.dataset.day;
          state.schedule[day] = state.schedule[day].filter(entry => entry.id !== button.dataset.entry);
          persist();
          renderAll();
          showToast(`Meal removed from ${day}.`);
          return;
        }
        if (action === "toggle-replace") {
          const row = document.querySelector(`[data-replace-row="${CSS.escape(button.dataset.entry)}"]`);
          if (!row) return;
          row.classList.toggle("is-open");
          if (row.classList.contains("is-open")) row.querySelector("select").focus();
          return;
        }
        if (action === "replace-scheduled") {
          const day = button.dataset.day;
          const entry = state.schedule[day].find(item => item.id === button.dataset.entry);
          const row = document.querySelector(`[data-replace-row="${CSS.escape(button.dataset.entry)}"]`);
          const replacement = row && row.querySelector("select").value;
          if (!entry || !getDish(replacement)) { showToast("Choose a replacement dish first."); return; }
          entry.dishId = replacement;
          entry.checkedIngredients = {};
          persist();
          renderAll();
          showToast("Meal updated in your plan.");
          return;
        }
      });

      document.addEventListener("toggle", event => {
        if (!isMobileLayout()) return;
        const panel = event.target;
        if (panel.matches("details[data-day-card]")) {
          if (panel.open) openDays.add(panel.dataset.dayCard);
          else openDays.delete(panel.dataset.dayCard);
        } else if (panel.matches("details[data-meal-card]")) {
          if (panel.open) openMeals.add(panel.dataset.mealCard);
          else openMeals.delete(panel.dataset.mealCard);
        }
      }, true);

      document.addEventListener("change", event => {
        const target = event.target;
        if (target.matches("[data-action='check-meal-ingredient']")) {
          const day = target.dataset.day;
          const entry = state.schedule[day].find(item => item.id === target.dataset.entry);
          if (!entry) return;
          entry.checkedIngredients[target.dataset.ingredient] = target.checked;
          persist();
          return;
        }
        if (target.matches("[data-action='check-shopping-item']")) {
          state.shoppingChecked[target.dataset.ingredient] = target.checked;
          target.closest(".ingredient-cell")?.classList.toggle("is-checked", target.checked);
          persist();
          return;
        }
        if (target.matches("[data-shopping-field]")) {
          if ((target.dataset.shoppingField === "quantity" || target.dataset.shoppingField === "unitCost") && target.value === "") return;
          const key = target.dataset.ingredient;
          const item = collectShoppingItems().find(candidate => candidate.key === key);
          if (!item) return;
          const adjustment = state.shoppingAdjustments[key] || {};
          adjustment.unit = item.unit;
          adjustment.baseQuantityAtEdit = item.baseQuantityInUnit;
          adjustment.quantity = item.quantity;
          if (target.dataset.shoppingField === "quantity") {
            adjustment.quantity = Math.max(0, Number(target.value) || 0);
          } else if (target.dataset.shoppingField === "unitCost") {
            adjustment.unitCost = Math.max(0, Number(target.value) || 0);
          } else if (target.dataset.shoppingField === "unit") {
            const nextUnit = normalizeUnit(target.value);
            if (!UNIT_INFO[nextUnit]) return;
            const convertedQuantity = convertShoppingQuantity(item.name, item.quantity, item.unit, nextUnit);
            const convertedBase = convertShoppingQuantity(item.name, item.baseQuantityInUnit, item.unit, nextUnit);
            const convertedCost = convertShoppingUnitPrice(item.name, item.unitCost, item.unit, nextUnit);
            adjustment.unit = nextUnit;
            adjustment.quantity = convertedQuantity === null ? item.quantity : convertedQuantity;
            adjustment.baseQuantityAtEdit = convertedBase === null ? item.baseQuantityInUnit : convertedBase;
            adjustment.unitCost = convertedCost === null ? suggestedUnitCost(item.name, nextUnit) : convertedCost;
          }
          state.shoppingAdjustments[key] = adjustment;
          persist();
          renderShopping();
          return;
        }
      });

      document.addEventListener("click", event => {
        const filter = event.target.closest("[data-filter]");
        if (!filter) return;
        activeCategory = filter.dataset.filter;
        renderFilters();
        renderLibrary();
      });

      els.search.addEventListener("input", renderLibrary);
      els.menuToggle.addEventListener("click", () => setDrawerOpen(!els.mobileDrawer.classList.contains("is-open")));
      document.getElementById("closeMenu").addEventListener("click", () => setDrawerOpen(false));
      els.drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));
      els.mobileDrawer.addEventListener("click", event => { if (event.target.closest("a")) setDrawerOpen(false); });
      document.addEventListener("keydown", event => { if (event.key === "Escape" && els.mobileDrawer.classList.contains("is-open")) setDrawerOpen(false); });
      els.mobileDrawer.addEventListener("keydown", event => {
        if (event.key !== "Tab") return;
        const focusable = [...els.mobileDrawer.querySelectorAll("a[href], button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      let resizeTimer;
      window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          const mobile = isMobileLayout();
          if (mobile !== lastMobileLayout) {
            lastMobileLayout = mobile;
            renderWeek();
            renderLibrary();
          }
        }, 140);
      });
      document.getElementById("openAddDialog").addEventListener("click", openAddDialog);
      document.getElementById("closeDialog").addEventListener("click", closeDialog);
      document.getElementById("cancelDialog").addEventListener("click", closeDialog);
      els.dialog.addEventListener("click", event => { if (event.target === els.dialog) closeDialog(); });
      els.addForm.addEventListener("submit", event => {
        event.preventDefault();
        const form = new FormData(els.addForm);
        const name = String(form.get("name") || "").trim();
        if (!name) return;
        const meal = { id: makeId(), name, category: String(form.get("category") || "mixed"), ingredients: String(form.get("ingredients") || "").trim(), procedure: String(form.get("procedure") || "").trim() };
        state.meals.push(meal);
        openMeals.add(meal.id);
        persist();
        els.addForm.reset();
        activeCategory = "all";
        els.search.value = "";
        renderAll();
        closeDialog();
        showToast(`${meal.name} added to your library.`);
      });

      for (const button of [document.getElementById("themeToggle"), document.getElementById("mobileThemeToggle")]) {
        button.addEventListener("click", () => applyTheme(!document.body.classList.contains("dark")));
      }

      function downloadShoppingReport() {
        const items = collectShoppingItems();
        const stats = shoppingStats(items);
        const now = new Date();
        const generatedAt = new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" }).format(now);
        const dateParts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Manila" }).formatToParts(now);
        const reportDate = `${dateParts.find(part => part.type === "year").value}-${dateParts.find(part => part.type === "month").value}-${dateParts.find(part => part.type === "day").value}`;
        const rows = items.length ? items.map(item => `<tr>
          <td data-label="Ingredient"><strong>${escapeHTML(item.name)}</strong><small>Used in ${item.occurrences} planned meal${item.occurrences === 1 ? "" : "s"}</small></td>
          <td data-label="Quantity">${escapeHTML(formatQuantity(item.quantity))}</td>
          <td data-label="Unit">${escapeHTML(item.unit)}</td>
          <td data-label="Unit cost">${escapeHTML(formatMoney(item.unitCost))}</td>
          <td data-label="Subtotal"><strong>${escapeHTML(formatMoney(item.subtotal))}</strong></td>
        </tr>`).join("") : `<tr><td colspan="5" class="empty-row">No ingredients yet. Add meals to your weekly plan to build the list.</td></tr>`;
        const report = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Shopping List · Jercyrendipity Meal Planner</title>
<style>
:root{--sage:#edf0e5;--paper:#fffdf5;--ink:#21392d;--soft:#697769;--line:#e3e7da;--green:#284a34;--shadow:0 18px 55px rgba(40,60,43,.12)}*{box-sizing:border-box}body{margin:0;padding:38px 20px;background:linear-gradient(140deg,#edf0e5,#f7f5eb);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;line-height:1.5}.report{width:min(980px,100%);margin:0 auto}.toolbar{display:flex;justify-content:flex-end;margin:0 0 14px}.print-button{min-height:44px;padding:0 18px;border:0;border-radius:99px;background:var(--green);color:#fffdf5;font:inherit;font-weight:750;cursor:pointer;box-shadow:0 8px 18px rgba(40,74,52,.17)}
.report-header{position:relative;overflow:hidden;padding:clamp(26px,5vw,52px);border:1px solid rgba(87,112,73,.16);border-radius:26px;background:linear-gradient(120deg,#fffdf5 0%,#f8f8ef 60%,#e9efdf 100%);box-shadow:var(--shadow)}.report-header:after{position:absolute;right:-72px;top:-110px;width:270px;height:270px;border:1px solid rgba(92,122,73,.18);border-radius:50%;content:"";box-shadow:0 0 0 24px rgba(92,122,73,.04),0 0 0 48px rgba(92,122,73,.025)}.brand{position:relative;z-index:1;display:flex;align-items:center;gap:12px;color:var(--green);font-size:12px;font-weight:800;letter-spacing:.04em}.brand-icon{display:grid;width:46px;height:46px;place-items:center;border-radius:15px;background:var(--green);color:#fffdf5;font-size:22px;box-shadow:0 8px 18px rgba(40,74,52,.18)}.eyebrow{margin:26px 0 5px;color:#7d8b70;font-size:10px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}.report-header h1{position:relative;z-index:1;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,6vw,57px);font-weight:500;letter-spacing:-.055em;line-height:1.05}.generated{position:relative;z-index:1;margin:13px 0 0;color:var(--soft);font-size:12px}
.summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:18px 0}.summary-card{min-height:116px;padding:18px;border:1px solid var(--line);border-radius:17px;background:rgba(255,253,245,.9);box-shadow:0 9px 22px rgba(40,60,43,.06)}.summary-label{display:block;color:var(--soft);font-size:10px;font-weight:750;letter-spacing:.04em}.summary-value{display:block;margin-top:12px;color:var(--green);font-family:Georgia,"Times New Roman",serif;font-size:25px;font-weight:700;letter-spacing:-.04em}.summary-value.money{font-size:21px}.table-card{overflow:hidden;border:1px solid var(--line);border-radius:21px;background:var(--paper);box-shadow:var(--shadow)}.table-title{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;padding:23px 25px 17px}.table-title h2{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:25px;font-weight:500;letter-spacing:-.035em}.table-title span{color:var(--soft);font-size:11px}table{width:100%;border-collapse:collapse;text-align:left}thead{background:#e9efdf;color:#61705e;font-size:10px;letter-spacing:.09em;text-transform:uppercase}th,td{padding:13px 16px}th:first-child,td:first-child{padding-left:25px}th:last-child,td:last-child{padding-right:25px;text-align:right}tbody tr:nth-child(even){background:#f7f7ef}tbody tr:nth-child(odd){background:#fffdf5}tbody td{border-top:1px solid #edf0e7;font-variant-numeric:tabular-nums}tbody td small{display:block;margin-top:2px;color:#899386;font-size:10px}.empty-row{padding:30px!important;text-align:center!important;color:var(--soft)}tfoot td{padding:17px 25px;border-top:1px solid var(--line);background:#eff2e8;font-weight:800}tfoot td:last-child{color:var(--green);font-size:19px}.estimate-note{margin:13px 3px 0;color:var(--soft);font-size:10px}.estimate-note a{color:var(--green);text-decoration:underline;text-underline-offset:2px}.report-footer{display:flex;justify-content:space-between;gap:15px;margin-top:23px;padding-top:16px;border-top:1px solid rgba(77,99,67,.18);color:#778374;font-size:11px}.report-footer strong{color:var(--green)}
@media(max-width:700px){body{padding:18px 12px}.summary{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.summary-card{min-height:100px;padding:14px}.summary-value{font-size:21px}.table-title{align-items:flex-start;flex-direction:column;padding:18px 17px 12px}thead{display:none}table,tbody,tfoot,tr{display:block}tbody tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 10px;padding:10px 14px;border-top:1px solid #edf0e7}tbody td{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border:0;text-align:right!important}tbody td:before{content:attr(data-label);color:#778374;font-size:10px;font-weight:700}tbody td:first-child{grid-column:1/-1;display:block;padding:7px 0 10px;text-align:left!important}tbody td:first-child:before{display:none}tbody td:last-child{padding-right:0}tfoot tr{display:grid;grid-template-columns:1fr auto;align-items:center;padding:12px 16px}tfoot td{padding:8px 0!important;border:0}tfoot td:first-child{padding-left:0!important}tfoot td:last-child{padding-right:0!important}.report-footer{flex-direction:column;gap:4px}}@media print{body{padding:0;background:#fff}.toolbar{display:none}.report{width:100%}.report-header,.summary-card,.table-card{box-shadow:none;break-inside:avoid}.table-card{overflow:visible}.report-footer{margin-top:16px}a{color:inherit;text-decoration:none}}
</style></head><body><div class="report"><div class="toolbar"><button class="print-button" type="button" onclick="window.print()">Print / Save as PDF</button></div>
<header class="report-header"><div class="brand"><span class="brand-icon" aria-hidden="true">🍽</span><span>Jercyrendipity Meal Planner &amp; Weekly Scheduler</span></div><p class="eyebrow">Kitchen list</p><h1>Shopping List</h1><p class="generated">Generated ${escapeHTML(generatedAt)}</p></header>
<section class="summary" aria-label="Shopping summary"><article class="summary-card"><span class="summary-label">Total meals planned</span><strong class="summary-value">${stats.totalMeals}</strong></article><article class="summary-card"><span class="summary-label">Total ingredients needed</span><strong class="summary-value">${stats.totalIngredients}</strong></article><article class="summary-card"><span class="summary-label">Distinct ingredients</span><strong class="summary-value">${stats.distinctIngredients}</strong></article><article class="summary-card"><span class="summary-label">Estimated grocery budget</span><strong class="summary-value money">${escapeHTML(formatMoney(stats.totalCost))}</strong></article><article class="summary-card"><span class="summary-label">Scheduled days</span><strong class="summary-value">${stats.scheduledDays}</strong></article></section>
<main class="table-card"><div class="table-title"><h2>Ingredients to buy</h2><span>${stats.totalIngredients} ingredient entries · ${stats.distinctIngredients} distinct items</span></div><table><thead><tr><th>Ingredient</th><th>Quantity</th><th>Unit</th><th>Unit cost</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Grand Total Shopping Cost</td><td>${escapeHTML(formatMoney(stats.totalCost))}</td></tr></tfoot></table></main>
<p class="estimate-note">Prices can be edited <a href="${PRICE_SOURCE_URL}">Price reference</a>.</p><footer class="report-footer"><strong>Generated using Jercyrendipity Meal Planner &amp; Weekly Scheduler</strong><span>Jercyrendipity · ${escapeHTML(reportDate)}</span></footer></div></body></html>`;
        const blob = new Blob([report], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `jercyrendipity-shopping-list-${reportDate}.html`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Your branded Shopping List is ready.");
      }

      document.getElementById("printButton").addEventListener("click", () => window.print());
      document.getElementById("exportButton").addEventListener("click", downloadShoppingReport);

      try {
        if (localStorage.getItem(THEME_KEY) === "dark") {
          applyTheme(true);
        }
      } catch (error) { /* Theme preference is optional when storage is unavailable. */ }

      renderAll();
    })();
