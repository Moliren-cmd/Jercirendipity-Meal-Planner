(() => {
      "use strict";

      const STORAGE_KEY = "kainMunaMealPlanner.v1";
      const THEME_KEY = "kainMunaTheme.v1";
      const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const MEAL_PERIODS = ["Breakfast", "Lunch", "Dinner"];
      const CATEGORIES = ["all", "vegetable", "chicken", "pork", "fish", "egg", "mixed"];
      const CATEGORY_LABELS = { all: "All", vegetable: "Vegetable", chicken: "Chicken", pork: "Pork", fish: "Fish", egg: "Egg", mixed: "Mixed" };
      const CATEGORY_EMOJI = { vegetable: "🥬", chicken: "🍗", pork: "🥘", fish: "🐟", egg: "🍳", mixed: "🍲" };
      const MEAT_CATEGORIES = new Set(["chicken", "pork", "fish", "mixed"]);
      const DIET_TAGS = ["vegetarian", "vegan", "pescatarian", "gluten-free", "dairy-free", "halal"];
      const ALLERGEN_TAGS = ["egg", "fish", "shellfish", "soy", "wheat", "dairy", "peanut"];
      const STARTER_DIET_TAGS = {
        "Tortang Talong": ["vegetarian", "gluten-free", "dairy-free"],
        "Ginisang Repolyo": ["vegetarian", "vegan", "dairy-free"],
        "Adobong Kangkong": ["vegetarian", "vegan", "dairy-free"],
        "Tinolang Manok": ["dairy-free"],
        "Sardinas with Misua": ["pescatarian", "dairy-free"],
        "Egg Omelette": ["vegetarian", "gluten-free", "dairy-free"],
        "Fried Chicken": ["dairy-free"],
        "Ginisang Ampalaya": ["vegetarian", "gluten-free", "dairy-free"]
      };
      const STARTER_TIMES = {
        "Adobong Sitaw": [15, 30], "Chop Suey": [15, 15], "Ginisang Monggo": [10, 50], "Tortang Talong": [15, 20],
        "Ginisang Repolyo": [10, 12], "Adobong Kangkong": [10, 10], "Tinolang Manok": [15, 45], "Sinigang na Baboy": [15, 75],
        "Ginisang Sayote": [10, 15], "Sardinas with Misua": [8, 12], "Egg Omelette": [8, 10], "Fried Chicken": [30, 30],
        "Pakbet": [20, 25], "Ginisang Ampalaya": [12, 15], "Bicol Express": [15, 60]
      };
      const NUTRITION_SOURCE_URL = "https://fdc.nal.usda.gov/";
      const NUTRIENTS_PER_100G = {
        pork: [297, 25, 0, 21], chicken: [215, 27, 0, 12], "mung beans": [347, 24, 63, 1.2],
        sitaw: [47, 2.8, 8.4, 0.4], cabbage: [25, 1.3, 6, 0.1], carrot: [41, 0.9, 9.6, 0.2],
        sayote: [19, 0.8, 4.5, 0.1], cauliflower: [25, 1.9, 5, 0.3], eggplant: [25, 1, 6, 0.2],
        ampalaya: [17, 1, 3.7, 0.2], chili: [40, 2, 9, 0.4], squash: [26, 1, 6, 0.1], tomato: [18, 0.9, 3.9, 0.2],
        garlic: [149, 6.4, 33, 0.5], ginger: [80, 1.8, 18, 0.8], onion: [40, 1.1, 9.3, 0.1], egg: [143, 12.6, 0.7, 9.5],
        sardines: [208, 25, 0, 11.5], misua: [360, 12, 75, 2], "malunggay leaves": [64, 9, 8, 1.4],
        kangkong: [19, 2.6, 3.1, 0.2], papaya: [43, 0.5, 11, 0.3], calamansi: [30, 0.7, 9, 0.2],
        flour: [364, 10, 76, 1], tinapa: [200, 25, 0, 10], "soy sauce": [53, 8, 5.6, 0.6],
        "fish sauce": [35, 5.1, 3.6, 0], "oyster sauce": [51, 1.4, 12, 0.3], "cooking oil": [884, 0, 0, 100],
        vinegar: [18, 0, 0.04, 0], "coconut milk": [230, 2.3, 5.5, 23.8], bagoong: [140, 13, 15, 2]
      };
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
      function currentWeekKey() {
        const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        const year = Number(parts.find(part => part.type === "year").value);
        const month = Number(parts.find(part => part.type === "month").value);
        const day = Number(parts.find(part => part.type === "day").value);
        const monday = new Date(Date.UTC(year, month - 1, day));
        monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
        return monday.toISOString().slice(0, 10);
      }
      function shiftWeekKey(weekKey, weeks) {
        const monday = new Date(`${weekKey}T00:00:00Z`);
        monday.setUTCDate(monday.getUTCDate() + Number(weeks) * 7);
        return monday.toISOString().slice(0, 10);
      }
      const freshState = () => ({
        meals: starterMeals.map(meal => ({ ...meal, servings: 2, prepMinutes: (STARTER_TIMES[meal.name] || [15, 25])[0], cookMinutes: (STARTER_TIMES[meal.name] || [15, 25])[1], substitutions: "", favorite: false, rating: 0, dietTags: [...(STARTER_DIET_TAGS[meal.name] || [])], allergens: inferAllergens(meal.ingredients) })),
        schedule: blankSchedule(), shoppingChecked: {}, shoppingAdjustments: {}, pantry: [], leftovers: [], history: [],
        weekKey: currentWeekKey(), actualWeekKey: currentWeekKey(), weekPlans: {}, prepChecked: {}, busyDays: [],
        budgetLimit: 0, customAisles: [], shoppingAisles: {}, planTemplates: [], foodSavings: []
      });

      function sanitizeTags(value, allowed) {
        const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,]+/) : [];
        return [...new Set(values.map(tag => String(tag).trim().toLowerCase()).filter(tag => allowed.includes(tag)))];
      }

      function inferAllergens(ingredients) {
        const source = String(ingredients || "").toLowerCase();
        const inferred = [];
        if (/\b(egg|eggs)\b/.test(source)) inferred.push("egg");
        if (/\b(fish|sardine|sardines|tinapa|patis|bagoong)\b/.test(source)) inferred.push("fish");
        if (/\b(oyster|shrimp|bagoong|alamang)\b/.test(source)) inferred.push("shellfish");
        if (/\b(soy|tofu)\b/.test(source)) inferred.push("soy");
        if (/\b(flour|wheat|misua|noodles)\b/.test(source)) inferred.push("wheat");
        if (/\b(milk|cheese|butter|cream)\b/.test(source)) inferred.push("dairy");
        if (/\b(peanut|groundnut)\b/.test(source)) inferred.push("peanut");
        return inferred;
      }

      function normalizePlanData(parsed) {
        if (!parsed || !Array.isArray(parsed.meals)) return freshState();
        const schedule = blankSchedule();
        for (const day of DAYS) {
          const entries = parsed.schedule && Array.isArray(parsed.schedule[day]) ? parsed.schedule[day] : [];
          schedule[day] = entries.filter(entry => entry && typeof entry.dishId === "string").map(entry => ({
            id: typeof entry.id === "string" ? entry.id : makeId(),
            dishId: entry.dishId,
            period: MEAL_PERIODS.includes(entry.period) ? entry.period : "Lunch",
            checkedIngredients: entry.checkedIngredients && typeof entry.checkedIngredients === "object" ? entry.checkedIngredients : {},
            servings: Math.max(1, Math.min(24, Number(entry.servings) || 2)),
            reminderAt: typeof entry.reminderAt === "string" && !Number.isNaN(Date.parse(entry.reminderAt)) ? entry.reminderAt.slice(0, 32) : "",
            reminderSent: Boolean(entry.reminderSent),
            cookedAt: typeof entry.cookedAt === "string" ? entry.cookedAt : ""
          }));
        }
        const meals = parsed.meals.filter(meal => meal && typeof meal.name === "string").map(meal => ({
          id: typeof meal.id === "string" ? meal.id : makeId(),
          name: meal.name,
          category: CATEGORIES.includes(meal.category) && meal.category !== "all" ? meal.category : "mixed",
          ingredients: typeof meal.ingredients === "string" ? meal.ingredients : "",
          procedure: typeof meal.procedure === "string" ? meal.procedure : "",
          servings: Math.max(1, Math.min(24, Number(meal.servings) || 2)),
          prepMinutes: Number.isFinite(Number(meal.prepMinutes)) ? Math.max(0, Math.min(1440, Number(meal.prepMinutes))) : (STARTER_TIMES[meal.name] || [0, 0])[0],
          cookMinutes: Number.isFinite(Number(meal.cookMinutes)) ? Math.max(0, Math.min(1440, Number(meal.cookMinutes))) : (STARTER_TIMES[meal.name] || [0, 0])[1],
          substitutions: typeof meal.substitutions === "string" ? meal.substitutions : "",
          favorite: Boolean(meal.favorite),
          rating: Math.max(0, Math.min(5, Math.round(Number(meal.rating) || 0))),
          dietTags: Array.isArray(meal.dietTags) ? sanitizeTags(meal.dietTags, DIET_TAGS) : String(meal.id || "").startsWith("starter-") ? [...(STARTER_DIET_TAGS[meal.name] || [])] : [],
          allergens: Array.isArray(meal.allergens) ? sanitizeTags(meal.allergens, ALLERGEN_TAGS) : inferAllergens(meal.ingredients)
        }));
        const existingIds = new Set(meals.map(meal => meal.id));
        for (const day of DAYS) schedule[day] = schedule[day].filter(entry => existingIds.has(entry.dishId));
        return {
          meals,
          schedule,
          shoppingChecked: parsed.shoppingChecked && typeof parsed.shoppingChecked === "object" ? parsed.shoppingChecked : {},
          shoppingAdjustments: parsed.shoppingAdjustments && typeof parsed.shoppingAdjustments === "object" ? parsed.shoppingAdjustments : {}
        };
      }

      function normalizeState(parsed) {
        if (!parsed || !Array.isArray(parsed.meals)) return freshState();
        const normalized = normalizePlanData(parsed);
        normalized.pantry = Array.isArray(parsed.pantry) ? parsed.pantry.filter(item => item && typeof item.name === "string").map(item => ({
          id: typeof item.id === "string" ? item.id : makeId(),
          name: item.name.trim(),
          key: canonicalShoppingName(item.name),
          quantity: Math.max(0, Number(item.quantity) || 0),
          unit: UNIT_INFO[normalizeUnit(item.unit)] ? normalizeUnit(item.unit) : "item",
          expiresOn: /^\d{4}-\d{2}-\d{2}$/.test(item.expiresOn || "") ? item.expiresOn : "",
          minQuantity: Math.max(0, Number(item.minQuantity) || 0)
        })) : [];
        normalized.leftovers = Array.isArray(parsed.leftovers) ? parsed.leftovers.filter(item => item && typeof item.name === "string").map(item => ({
          id: typeof item.id === "string" ? item.id : makeId(), name: item.name.trim(),
          quantity: Math.max(0, Number(item.quantity) || 0), unit: String(item.unit || "portion").slice(0, 16),
          expiresOn: /^\d{4}-\d{2}-\d{2}$/.test(item.expiresOn || "") ? item.expiresOn : ""
        })) : [];
        normalized.budgetLimit = Math.max(0, Number(parsed.budgetLimit) || 0);
        normalized.customAisles = Array.isArray(parsed.customAisles) ? [...new Set(parsed.customAisles.map(name => String(name).trim().slice(0, 32)).filter(Boolean))].slice(0, 15) : [];
        normalized.shoppingAisles = parsed.shoppingAisles && typeof parsed.shoppingAisles === "object" && !Array.isArray(parsed.shoppingAisles) ? parsed.shoppingAisles : {};
        normalized.planTemplates = Array.isArray(parsed.planTemplates) ? parsed.planTemplates.filter(template => template && typeof template.name === "string" && template.schedule).map(template => {
          const snapshot = normalizePlanData({ meals: Array.isArray(template.meals) ? template.meals : normalized.meals, schedule: template.schedule });
          return { id: typeof template.id === "string" ? template.id : makeId(), name: template.name.trim().slice(0, 50), meals: snapshot.meals, schedule: snapshot.schedule, busyDays: Array.isArray(template.busyDays) ? template.busyDays.filter(day => DAYS.includes(day)) : [] };
        }) : [];
        normalized.foodSavings = Array.isArray(parsed.foodSavings) ? parsed.foodSavings.filter(item => item && typeof item.name === "string").slice(-200).map(item => ({
          name: item.name.slice(0, 80), kind: item.kind === "leftover" ? "leftover" : "pantry",
          savedAt: typeof item.savedAt === "string" ? item.savedAt : new Date().toISOString(),
          quantity: Math.max(0, Number(item.quantity) || 0), unit: String(item.unit || "item").slice(0, 16),
          estimatedValue: Math.max(0, Number(item.estimatedValue) || 0)
        })) : [];
        normalized.weekKey = /^\d{4}-\d{2}-\d{2}$/.test(parsed.weekKey || "") ? parsed.weekKey : currentWeekKey();
        normalized.actualWeekKey = /^\d{4}-\d{2}-\d{2}$/.test(parsed.actualWeekKey || "") ? parsed.actualWeekKey : normalized.weekKey;
        normalized.weekPlans = {};
        if (parsed.weekPlans && typeof parsed.weekPlans === "object" && !Array.isArray(parsed.weekPlans)) {
          for (const key of Object.keys(parsed.weekPlans)) {
            const plan = parsed.weekPlans[key];
            if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !plan || typeof plan !== "object") continue;
            const normalizedPlan = normalizePlanData({ meals: normalized.meals, schedule: plan.schedule });
            normalized.weekPlans[key] = {
              schedule: normalizedPlan.schedule,
              shoppingChecked: plan.shoppingChecked && typeof plan.shoppingChecked === "object" ? plan.shoppingChecked : {},
              prepChecked: plan.prepChecked && typeof plan.prepChecked === "object" ? plan.prepChecked : {},
              busyDays: Array.isArray(plan.busyDays) ? plan.busyDays.filter(day => DAYS.includes(day)) : [],
              budgetLimit: Math.max(0, Number(plan.budgetLimit) || 0)
            };
          }
        }
        normalized.prepChecked = parsed.prepChecked && typeof parsed.prepChecked === "object" ? parsed.prepChecked : {};
        normalized.busyDays = Array.isArray(parsed.busyDays) ? parsed.busyDays.filter(day => DAYS.includes(day)) : [];
        normalized.weekPlans[normalized.weekKey] = { schedule: cloneData(normalized.schedule), shoppingChecked: cloneData(normalized.shoppingChecked), prepChecked: cloneData(normalized.prepChecked), busyDays: cloneData(normalized.busyDays), budgetLimit: normalized.budgetLimit };
        normalized.history = Array.isArray(parsed.history) ? parsed.history.filter(item => item && Array.isArray(item.meals) && typeof item.weekStart === "string").map(item => {
          const snapshot = normalizePlanData(item);
          return {
            id: typeof item.id === "string" ? item.id : item.weekStart,
            weekStart: item.weekStart,
            savedAt: typeof item.savedAt === "string" ? item.savedAt : `${item.weekStart}T00:00:00.000Z`,
            meals: snapshot.meals,
            schedule: snapshot.schedule
          };
        }) : [];
        return normalized;
      }

      function cloneData(value) { return JSON.parse(JSON.stringify(value)); }
      function rollWeekForward() {
        const thisWeek = currentWeekKey();
        let savedWeek = state.actualWeekKey || state.weekKey || thisWeek;
        if (savedWeek >= thisWeek) return false;
        while (savedWeek < thisWeek) {
          const plan = state.weekPlans[savedWeek] || (state.weekKey === savedWeek ? { schedule: state.schedule, shoppingChecked: state.shoppingChecked } : null);
          const archivedSchedule = plan && plan.schedule ? plan.schedule : blankSchedule();
          if (DAYS.some(day => archivedSchedule[day] && archivedSchedule[day].length > 0) && !state.history.some(record => record.weekStart === savedWeek)) {
            const scheduledDishIds = new Set(DAYS.flatMap(day => archivedSchedule[day] || []).map(entry => entry.dishId));
            state.history.push({ id: savedWeek, weekStart: savedWeek, savedAt: new Date().toISOString(), meals: cloneData(state.meals.filter(meal => scheduledDishIds.has(meal.id))), schedule: cloneData(archivedSchedule) });
          }
          delete state.weekPlans[savedWeek];
          savedWeek = shiftWeekKey(savedWeek, 1);
        }
        state.history.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
        state.actualWeekKey = thisWeek;
        if (state.weekKey < thisWeek) {
          state.weekKey = thisWeek;
          const currentPlan = state.weekPlans[thisWeek];
          state.schedule = currentPlan ? cloneData(currentPlan.schedule) : blankSchedule();
          state.shoppingChecked = currentPlan ? cloneData(currentPlan.shoppingChecked) : {};
          state.prepChecked = currentPlan ? cloneData(currentPlan.prepChecked || {}) : {};
          state.busyDays = currentPlan ? cloneData(currentPlan.busyDays || []) : [];
          state.budgetLimit = currentPlan ? Math.max(0, Number(currentPlan.budgetLimit) || 0) : 0;
        }
        return true;
      }

      function readState() {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) return freshState();
          return normalizeState(JSON.parse(stored));
        } catch (error) {
          console.warn("Could not read the local meal plan cache. Starting with the sample library.", error);
          return freshState();
        }
      }

      let state = readState();
      let sharedRevision = 0;
      let sharedDataReady = false;
      let pendingSharedSnapshot = null;
      let sharedSaveInProgress = false;
      let sharedRetryTimer = null;
      let sharedSaveErrorShown = false;
      let expiryReminderShown = false;
      let activeCategory = "all";
      let toastTimer;
      const activeTimers = new Map();
      let cookingSession = null;
      let cookingWakeLock = null;
      const notifiedReminders = new Set();
      const els = {
        dashboard: document.getElementById("dashboardGrid"), week: document.getElementById("weekGrid"),
        library: document.getElementById("mealGrid"), filters: document.getElementById("categoryFilters"),
        search: document.getElementById("searchDish"), shopping: document.getElementById("shoppingItems"),
        dietFilter: document.getElementById("dietFilter"), allergenFilter: document.getElementById("allergenFilter"), favoritesOnly: document.getElementById("favoritesOnly"),
        shoppingSummary: document.getElementById("shoppingSummary"), shoppingGrandTotal: document.getElementById("shoppingGrandTotal"),
        shoppingCount: document.getElementById("shoppingCount"), dialog: document.getElementById("addDishDialog"),
        addForm: document.getElementById("addDishForm"), toast: document.getElementById("toast"), toastMessage: document.getElementById("toastMessage"),
        menuToggle: document.getElementById("menuToggle"), mobileDrawer: document.getElementById("mobileDrawer"), drawerBackdrop: document.getElementById("drawerBackdrop")
      };
      const openDays = new Set();
      const openPeriods = new Set();
      const openMeals = new Set();
      let lastMobileLayout = window.matchMedia("(max-width: 767px)").matches;

      function persist() {
        if (!state.weekPlans || typeof state.weekPlans !== "object") state.weekPlans = {};
        state.weekPlans[state.weekKey] = { schedule: cloneData(state.schedule), shoppingChecked: cloneData(state.shoppingChecked), prepChecked: cloneData(state.prepChecked || {}), busyDays: cloneData(state.busyDays || []), budgetLimit: state.budgetLimit };
        const snapshot = JSON.parse(JSON.stringify(state));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        } catch (error) {
          console.warn("Could not update the local meal plan cache.", error);
        }
        pendingSharedSnapshot = snapshot;
        if (sharedDataReady) void saveSharedState();
        return true;
      }


      async function saveSharedState() {
        if (sharedSaveInProgress || !sharedDataReady || !pendingSharedSnapshot) return;
        sharedSaveInProgress = true;
        while (pendingSharedSnapshot) {
          const snapshot = pendingSharedSnapshot;
          pendingSharedSnapshot = null;
          try {
            const response = await fetch("api.php?action=state", {
              method: "PUT",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json", "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content },
              body: JSON.stringify({ state: snapshot, revision: sharedRevision })
            });
            const result = await response.json();
            if (response.status === 401) { window.location.reload(); return; }
            if (response.status === 409) {
              sharedRevision = Number(result.revision) || sharedRevision;
              pendingSharedSnapshot = null;
              state = normalizeState(result.state || null);
              const weekChanged = rollWeekForward();
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* Shared storage remains authoritative. */ }
              renderAll();
              showToast("A newer shared plan was saved in another browser. The latest plan has been loaded; your last change was not saved.");
              if (weekChanged) pendingSharedSnapshot = JSON.parse(JSON.stringify(state));
              break;
            }
            if (!response.ok) throw new Error(result.error || "The shared plan could not be saved.");
            sharedRevision = Number(result.revision) || sharedRevision;
            sharedSaveErrorShown = false;
          } catch (error) {
            if (!pendingSharedSnapshot) pendingSharedSnapshot = snapshot;
            console.error("Could not save the shared meal plan.", error);
            if (!sharedSaveErrorShown) {
              showToast("Could not reach MySQL. This change is saved only in this browser until the server reconnects.");
              sharedSaveErrorShown = true;
            }
            window.clearTimeout(sharedRetryTimer);
            sharedRetryTimer = window.setTimeout(() => { sharedSaveErrorShown = false; void saveSharedState(); }, 8000);
            break;
          }
        }
        sharedSaveInProgress = false;
        if (pendingSharedSnapshot) void saveSharedState();
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

      function stepDurationSeconds(step) {
        const match = String(step).match(/\b(\d+)\s*(minutes?|mins?|seconds?|secs?)\b/i);
        if (!match) return 0;
        return Number(match[1]) * (/^m/i.test(match[2]) ? 60 : 1);
      }
      function renderProcedureSteps(steps, entryId) {
        return steps.map((step, index) => {
          const seconds = stepDurationSeconds(step);
          const timerButton = seconds ? `<button class="step-timer" type="button" data-action="step-timer" data-timer-id="${escapeHTML(entryId)}-${index}" data-seconds="${seconds}" data-dish="${escapeHTML(entryId)}">⏱ Start ${seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds} sec`}</button>` : "";
          return `<li><span>${escapeHTML(step)}</span>${timerButton}</li>`;
        }).join("");
      }

      function startStepTimer(button) {
        const id = button.dataset.timerId;
        const running = activeTimers.get(id);
        if (running) {
          window.clearInterval(running.interval);
          activeTimers.delete(id);
          button.textContent = running.label;
          button.classList.remove("is-running");
          return;
        }
        const seconds = Math.max(1, Number(button.dataset.seconds) || 1);
        const label = `⏱ Start ${seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds} sec`}`;
        let remaining = seconds;
        const tick = () => {
          if (remaining <= 0) {
            window.clearInterval(activeTimers.get(id)?.interval);
            activeTimers.delete(id);
            button.textContent = "⏱ Timer done";
            button.classList.remove("is-running");
            showToast("Cooking timer finished.");
            return;
          }
          const minutes = Math.floor(remaining / 60);
          const secondsLeft = String(remaining % 60).padStart(2, "0");
          button.textContent = `Stop · ${minutes}:${secondsLeft}`;
          remaining -= 1;
        };
        button.classList.add("is-running");
        tick();
        const interval = window.setInterval(tick, 1000);
        activeTimers.set(id, { interval, label });
      }

      function setMealCooked(day, entryId, forceComplete = false) {
        const entry = state.schedule[day]?.find(item => item.id === entryId);
        if (!entry) return;
        entry.cookedAt = forceComplete ? new Date().toISOString() : entry.cookedAt ? "" : new Date().toISOString();
        persist();
        renderAll();
        showToast(entry.cookedAt ? "Meal marked cooked." : "Cooked status cleared.");
      }

      function openCookingMode(day, entryId) {
        const entry = state.schedule[day]?.find(item => item.id === entryId);
        const dish = entry && getDish(entry.dishId);
        const steps = dish ? procedureLines(dish.procedure) : [];
        if (!dish || !steps.length) { showToast("Add cooking steps to this recipe first."); return; }
        cookingSession = { day, entryId, dish, steps, index: 0 };
        renderCookingStep();
        document.getElementById("cookModeDialog").showModal();
      }

      function renderCookingStep() {
        if (!cookingSession) return;
        const { dish, steps, index } = cookingSession;
        const step = steps[index];
        document.getElementById("cookModeTitle").textContent = dish.name;
        document.getElementById("cookStepCopy").textContent = step;
        document.getElementById("cookProgressText").textContent = `Step ${index + 1} of ${steps.length}`;
        document.getElementById("cookProgressBar").style.width = `${Math.round(((index + 1) / steps.length) * 100)}%`;
        document.getElementById("cookModePreviousButton").disabled = index === 0;
        document.getElementById("cookModeNextButton").textContent = index === steps.length - 1 ? "Finish cooking ✓" : "Next step →";
        const seconds = stepDurationSeconds(step);
        document.getElementById("cookModeTimer").innerHTML = seconds ? `<button class="step-timer" type="button" data-action="step-timer" data-timer-id="cook-${escapeHTML(cookingSession.entryId)}-${index}" data-seconds="${seconds}">⏱ Start ${seconds >= 60 ? `${Math.floor(seconds / 60)} min` : `${seconds} sec`}</button>` : "";
      }

      async function setKeepScreenOn() {
        if (!navigator.wakeLock || !navigator.wakeLock.request) { showToast("Keep screen on is not supported by this browser."); return; }
        try {
          cookingWakeLock = await navigator.wakeLock.request("screen");
          cookingWakeLock.addEventListener("release", () => { cookingWakeLock = null; });
          document.getElementById("keepScreenButton").textContent = "Screen will stay on ✓";
        } catch (error) { showToast("The screen could not be kept awake. You can still use cooking mode."); }
      }

      async function requestReminderPermission() {
        if (!("Notification" in window)) throw new Error("This browser does not support notifications.");
        if (Notification.permission === "granted") return;
        if (Notification.permission === "denied") throw new Error("Notifications are blocked in this browser's site settings.");
        const result = await Notification.requestPermission();
        if (result !== "granted") throw new Error("Allow notifications to receive cooking reminders.");
      }

      function checkMealReminders() {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        for (const day of DAYS) for (const entry of state.schedule[day]) {
          const at = Date.parse(entry.reminderAt || "");
          if (!entry.reminderAt || !Number.isFinite(at) || at > Date.now() || entry.reminderSent || notifiedReminders.has(entry.id)) continue;
          const dish = getDish(entry.dishId);
          try { new Notification("Meal prep reminder", { body: `${day} ${entry.period.toLowerCase()}: ${dish ? dish.name : "planned meal"}`, tag: `meal-${entry.id}` }); } catch (error) { /* The planner will keep the reminder visible in the schedule. */ }
          entry.reminderSent = true;
          notifiedReminders.add(entry.id);
          persist();
        }
      }

      function downloadPlannerBackup() {
        const backup = { application: "Jercyrendipity Meal Planner", version: 2, exportedAt: new Date().toISOString(), state };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `jercyrendipity-planner-backup-${manilaDateKey()}.json`;
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Planner backup downloaded.");
      }

      async function restorePlannerBackup(file) {
        if (!file || file.size > 5 * 1024 * 1024) { showToast("Choose a JSON backup smaller than 5 MB."); return; }
        try {
          const parsed = JSON.parse(await file.text());
          const candidate = parsed.state && typeof parsed.state === "object" ? parsed.state : parsed;
          if (!Array.isArray(candidate.meals) || !candidate.schedule || typeof candidate.schedule !== "object") throw new Error("This file is not a planner backup.");
          if (!window.confirm("Restore this backup? It will replace the current shared planner data.")) return;
          state = normalizeState(candidate);
          renderAll();
          persist();
          showToast("Planner backup restored and sent to the shared database.");
        } catch (error) { showToast(error.message || "The backup could not be read."); }
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
          chicken: { pcs: 300 }, pork: { pcs: 250 }, "pork belly": { pcs: 250 }, kangkong: { bunch: 200 }, "malunggay leaves": { bunch: 100 },
          misua: { pack: 200 }, sardines: { can: 155 }, "coconut milk": { pack: 200 }, "sinigang mix": { pack: 40 }
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
      function nutritionIngredientKey(value) {
        const key = canonicalShoppingName(value);
        if (key.includes("pork")) return "pork";
        if (key.includes("chicken")) return "chicken";
        if (key.includes("bagoong")) return "bagoong";
        if (key.includes("misua")) return "misua";
        if (key.includes("coconut milk")) return "coconut milk";
        return key;
      }
      function ingredientGrams(name, quantity, unit) {
        const key = canonicalShoppingName(name);
        const info = UNIT_INFO[unit];
        if (!info) return null;
        if (info.family === "mass") return Number(quantity) * info.factor;
        if (info.family === "volume") {
          const density = key === "cooking oil" ? 0.92 : 1;
          return Number(quantity) * info.factor * density;
        }
        const grams = gramsPerNamedUnit(key, unit);
        return grams ? Number(quantity) * grams : null;
      }
      function estimateNutrition(dish, servings = dish.servings || 2) {
        const baseServings = Math.max(1, Number(dish.servings) || 2);
        const scale = Math.max(1, Number(servings) || baseServings) / baseServings;
        const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        let matched = 0;
        for (const line of ingredientLines(dish.ingredients)) {
          const parsed = parseIngredientLine(line);
          const fallback = defaultShoppingEstimate(parsed.name);
          const quantity = (parsed.quantity === null ? fallback.quantity : parsed.quantity) * scale;
          const unit = parsed.unit || fallback.unit;
          const grams = ingredientGrams(parsed.name, quantity, unit);
          const nutrients = NUTRIENTS_PER_100G[nutritionIngredientKey(parsed.name)];
          if (!grams || !nutrients) continue;
          matched += 1;
          totals.kcal += grams * nutrients[0] / 100;
          totals.protein += grams * nutrients[1] / 100;
          totals.carbs += grams * nutrients[2] / 100;
          totals.fat += grams * nutrients[3] / 100;
        }
        return {
          kcal: Math.round(totals.kcal / Math.max(1, Number(servings) || baseServings)),
          protein: Math.round(totals.protein / Math.max(1, Number(servings) || baseServings) * 10) / 10,
          carbs: Math.round(totals.carbs / Math.max(1, Number(servings) || baseServings) * 10) / 10,
          fat: Math.round(totals.fat / Math.max(1, Number(servings) || baseServings) * 10) / 10,
          coverage: matched
        };
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
        const totalCost = items.reduce((sum, item) => sum + item.subtotal, 0);
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
          { label: "Vegetable / meat dishes", value: `${vegetableMeals} / ${meatMeals}`, foot: "scheduled this week", icon: "🥬" },
          { label: "Meals cooked", value: entries.filter(entry => entry.cookedAt).length, foot: "completed this week", icon: "✓" },
          { label: "Food rescued", value: state.foodSavings.length, foot: "leftovers or near-expiry items used", icon: "♧" }
        ];
        els.dashboard.innerHTML = stats.map(stat => `<article class="stat-card"><div class="stat-top"><span>${escapeHTML(stat.label)}</span><span class="stat-icon" aria-hidden="true">${stat.icon}</span></div><div class="stat-value">${escapeHTML(stat.value)}</div><div class="stat-foot">${escapeHTML(stat.foot)}</div></article>`).join("");
      }

      function renderPlanningTools() {
        const busySet = new Set(state.busyDays || []);
        document.getElementById("busyDayControls").innerHTML = DAYS.map(day => `<label class="busy-day-chip ${busySet.has(day) ? "is-busy" : ""}"><input type="checkbox" data-busy-day="${day}" ${busySet.has(day) ? "checked" : ""}><span>${day.slice(0, 3)}</span><small>${busySet.has(day) ? "Quick meals" : "Mark busy"}</small></label>`).join("");
        const quickMeals = state.meals.filter(meal => Number(meal.prepMinutes) + Number(meal.cookMinutes) <= 30).sort((a, b) => (a.prepMinutes + a.cookMinutes) - (b.prepMinutes + b.cookMinutes)).slice(0, 3);
        document.getElementById("quickMealSuggestions").innerHTML = [...busySet].map(day => `<div class="quick-day-row"><strong>${escapeHTML(day)} dinner</strong><div>${quickMeals.length ? quickMeals.map(meal => `<button class="quick-meal-chip" type="button" data-action="busy-quick-add" data-day="${day}" data-id="${escapeHTML(meal.id)}"><span>${escapeHTML(meal.name)}</span><small>${Number(meal.prepMinutes) + Number(meal.cookMinutes)} min</small></button>`).join("") : `<small>Add prep and cook times to recipes to see quick ideas.</small>`}</div></div>`).join("") || `<p class="tool-empty">Mark a day busy to see quick recipe ideas.</p>`;
        document.getElementById("savedTemplates").innerHTML = state.planTemplates.length ? state.planTemplates.map(template => `<article class="template-card"><div><strong>${escapeHTML(template.name)}</strong><small>${DAYS.reduce((total, day) => total + (template.schedule[day] || []).length, 0)} planned meals</small></div><div><button class="btn btn-secondary btn-small" type="button" data-action="apply-template" data-id="${escapeHTML(template.id)}">Use template</button><button class="mini-icon-btn remove" type="button" data-action="delete-template" data-id="${escapeHTML(template.id)}" aria-label="Delete ${escapeHTML(template.name)} template">×</button></div></article>`).join("") : `<p class="tool-empty">No saved templates yet.</p>`;
      }

      function saveCurrentTemplate(name) {
        const cleanName = String(name || "").trim().slice(0, 50);
        const mealCount = DAYS.reduce((total, day) => total + state.schedule[day].length, 0);
        if (!cleanName || !mealCount) { showToast("Add meals to this week before saving a template."); return false; }
        if (state.planTemplates.some(template => template.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) { showToast("A template with that name already exists."); return false; }
        const usedIds = new Set(DAYS.flatMap(day => state.schedule[day]).map(entry => entry.dishId));
        state.planTemplates.push({ id: makeId(), name: cleanName, meals: cloneData(state.meals.filter(meal => usedIds.has(meal.id))), schedule: cloneData(state.schedule), busyDays: cloneData(state.busyDays || []) });
        state.planTemplates = state.planTemplates.slice(-20);
        persist();
        renderPlanningTools();
        showToast(`${cleanName} saved as a reusable template.`);
        return true;
      }

      function applyPlanTemplate(templateId) {
        const template = state.planTemplates.find(item => item.id === templateId);
        if (!template || !window.confirm(`Replace the plan for ${formatHistoryDate(state.weekKey)} with “${template.name}”?`)) return;
        const templateMeals = new Map(template.meals.map(meal => [meal.id, cloneData(meal)]));
        state.meals = state.meals.map(meal => templateMeals.get(meal.id) || meal);
        const currentIds = new Set(state.meals.map(meal => meal.id));
        state.meals.push(...template.meals.filter(meal => !currentIds.has(meal.id)).map(meal => cloneData(meal)));
        state.schedule = cloneData(template.schedule);
        state.shoppingChecked = {};
        state.prepChecked = {};
        state.busyDays = cloneData(template.busyDays || []);
        openDays.clear();
        openPeriods.clear();
        persist();
        renderAll();
        showToast("Template loaded into the selected week.");
      }

      function dishOptions(selectedId = "") {
        const options = state.meals.slice().sort((a, b) => a.name.localeCompare(b.name)).map(meal => `<option value="${escapeHTML(meal.id)}" ${meal.id === selectedId ? "selected" : ""}>${escapeHTML(meal.name)}</option>`).join("");
        return `<option value="">${state.meals.length ? "Choose a dish…" : "Add a dish to your library"}</option>${options}`;
      }

      function scaleIngredientLine(line, servings, baseServings) {
        const parsed = parseIngredientLine(line);
        if (parsed.quantity === null) return line;
        const amount = formatQuantity(parsed.quantity * Math.max(1, servings) / Math.max(1, baseServings));
        return `${amount} ${parsed.unit || "pcs"} ${parsed.name}`.trim();
      }

      function nutritionMarkup(dish, servings) {
        const nutrition = estimateNutrition(dish, servings);
        return `<div class="nutrition-estimate"><div class="nutrition-estimate-top"><strong>~${nutrition.kcal} kcal per serving</strong><span>Estimate</span></div><div class="nutrition-macros"><span>Protein <b>${nutrition.protein}g</b></span><span>Carbs <b>${nutrition.carbs}g</b></span><span>Fat <b>${nutrition.fat}g</b></span></div><small>Approximate values from ${nutrition.coverage} measured ingredients · <a href="${NUTRITION_SOURCE_URL}" target="_blank" rel="noreferrer">FoodData Central</a></small></div>`;
      }

      function renderScheduledMeal(day, entry) {
        const dish = getDish(entry.dishId);
        if (!dish) return "";
        const servings = Math.max(1, Number(entry.servings) || Number(dish.servings) || 2);
        const baseServings = Number(dish.servings) || 2;
        const ingredients = ingredientLines(dish.ingredients);
        const steps = procedureLines(dish.procedure);
        const mealChecks = ingredients.length ? ingredients.map((ingredient, index) => {
          const key = ingredientKey(ingredient);
          const checked = Boolean(entry.checkedIngredients && entry.checkedIngredients[key]);
          const shown = scaleIngredientLine(ingredient, servings, baseServings);
          return `<label class="ingredient-check"><input type="checkbox" data-action="check-meal-ingredient" data-day="${escapeHTML(day)}" data-entry="${escapeHTML(entry.id)}" data-ingredient="${escapeHTML(key)}" ${checked ? "checked" : ""}><span>${escapeHTML(shown)}</span></label>`;
        }).join("") : `<span class="recipe-empty">No ingredients saved yet.</span>`;
        const stepsMarkup = steps.length ? `<ol class="steps-list">${renderProcedureSteps(steps, entry.id)}</ol>` : `<span class="recipe-empty">No procedure saved yet.</span>`;
        const timeBadges = [dish.prepMinutes ? `<span>Prep ${dish.prepMinutes} min</span>` : "", dish.cookMinutes ? `<span>Cook ${dish.cookMinutes} min</span>` : ""].filter(Boolean).join("");
        const substitutionLines = ingredientLines(dish.substitutions);
        const reminderLabel = entry.reminderAt ? new Intl.DateTimeFormat("en-PH", { weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(entry.reminderAt)) : "Set a cooking reminder";
        return `<article class="scheduled-card" data-entry-card="${escapeHTML(entry.id)}">
          <div class="scheduled-title-row"><div><h4 class="scheduled-title">${escapeHTML(dish.name)}</h4><span class="scheduled-category">${escapeHTML(CATEGORY_LABELS[dish.category] || "Mixed")}</span></div>
            <div class="scheduled-actions"><button class="mini-icon-btn" type="button" data-action="toggle-replace" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="Replace ${escapeHTML(dish.name)}">↻</button><button class="mini-icon-btn remove" type="button" data-action="remove-scheduled" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="Remove ${escapeHTML(dish.name)}">✕</button></div>
          </div>
          ${timeBadges ? `<div class="recipe-time-badges">${timeBadges}</div>` : ""}
          <div class="replace-row" data-replace-row="${escapeHTML(entry.id)}"><select class="control" aria-label="Choose replacement dish">${dishOptions(dish.id)}</select><button class="btn btn-primary btn-small" type="button" data-action="replace-scheduled" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}">Replace</button></div>
          <div class="servings-control"><span>Servings</span><button class="servings-step" type="button" data-action="serving-step" data-step="-1" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="One fewer serving">−</button><input type="number" min="1" max="24" value="${servings}" data-serving-count data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="Number of servings for ${escapeHTML(dish.name)}"><button class="servings-step" type="button" data-action="serving-step" data-step="1" data-entry="${escapeHTML(entry.id)}" data-day="${escapeHTML(day)}" aria-label="One more serving">＋</button></div>
          <div class="recipe-part"><h4>Ingredients</h4><div class="ingredient-checks">${mealChecks}</div></div>
          ${nutritionMarkup(dish, servings)}
          <div class="recipe-part"><h4>Procedure</h4>${stepsMarkup}</div>
          ${substitutionLines.length ? `<div class="substitution-note"><strong>Easy swaps</strong>${substitutionLines.map(line => `<span>${escapeHTML(line)}</span>`).join("")}</div>` : ""}
          <div class="scheduled-bottom-actions"><button class="btn btn-secondary btn-small" type="button" data-action="cook-mode" data-day="${escapeHTML(day)}" data-entry="${escapeHTML(entry.id)}">▶ Cook step by step</button><button class="btn ${entry.cookedAt ? "btn-cooked" : "btn-secondary"} btn-small" type="button" data-action="mark-cooked" data-day="${escapeHTML(day)}" data-entry="${escapeHTML(entry.id)}">${entry.cookedAt ? "✓ Cooked" : "Mark cooked"}</button></div>
          <details class="reminder-panel"><summary><span>◷ ${escapeHTML(reminderLabel)}</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary><div><input class="control" type="datetime-local" data-reminder-time="${escapeHTML(entry.id)}" aria-label="Reminder time for ${escapeHTML(dish.name)}" value="${escapeHTML(entry.reminderAt)}"><button class="btn btn-secondary btn-small" type="button" data-action="set-reminder" data-day="${escapeHTML(day)}" data-entry="${escapeHTML(entry.id)}">Set reminder</button>${entry.reminderAt ? `<button class="text-button" type="button" data-action="clear-reminder" data-day="${escapeHTML(day)}" data-entry="${escapeHTML(entry.id)}">Clear</button>` : ""}</div></details>
        </article>`;
      }

      function renderWeek() {
        const weekDate = new Date(`${state.weekKey || currentWeekKey()}T00:00:00Z`);
        const weekEnd = new Date(weekDate);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
        const dateFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", timeZone: "UTC" });
        const yearFormatter = new Intl.DateTimeFormat("en-PH", { year: "numeric", timeZone: "UTC" });
        document.getElementById("activeWeekLabel").textContent = `${dateFormatter.format(weekDate)}–${dateFormatter.format(weekEnd)}, ${yearFormatter.format(weekEnd)}`;
        document.getElementById("previousWeekButton").disabled = state.weekKey <= state.actualWeekKey;
        els.week.innerHTML = DAYS.map(day => {
          const entries = state.schedule[day];
          const open = !isMobileLayout() || openDays.has(day) ? "open" : "";
          const periods = MEAL_PERIODS.map(period => {
            const periodEntries = entries.filter(entry => entry.period === period);
            const periodKey = `${day}|${period}`;
            const periodOpen = openPeriods.has(periodKey) || (!isMobileLayout() && periodEntries.length > 0) ? "open" : "";
            const meals = periodEntries.map(entry => renderScheduledMeal(day, entry)).join("");
            return `<details class="meal-period" data-period-card="${escapeHTML(periodKey)}" ${periodOpen}><summary><span>${period}</span><span class="period-count">${periodEntries.length}</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary><div class="period-content"><div class="day-add-row"><select class="control" data-day-select="${escapeHTML(day)}" data-period="${escapeHTML(period)}" aria-label="Choose ${period.toLowerCase()} meal for ${escapeHTML(day)}">${dishOptions()}</select><button class="btn btn-primary btn-small" type="button" data-action="add-scheduled" data-day="${escapeHTML(day)}" data-period="${escapeHTML(period)}" ${state.meals.length ? "" : "disabled"}>＋ Add</button></div><div class="day-meals">${meals || `<div class="day-empty">No ${period.toLowerCase()} planned</div>`}</div></div></details>`;
          }).join("");
          const busy = state.busyDays.includes(day);
          return `<details class="day-card ${busy ? "is-busy-day" : ""}" data-day-card="${escapeHTML(day)}" ${open}><summary class="day-head"><h3>${escapeHTML(day)}</h3>${busy ? `<span class="busy-badge">Busy day</span>` : ""}<span class="day-count" aria-label="${entries.length} meals">${entries.length}</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
            <div class="day-card-content"><label class="busy-day-switch"><input type="checkbox" data-busy-day="${escapeHTML(day)}" ${busy ? "checked" : ""}><span>Busy day · show quick meal ideas</span></label><div class="period-stack">${periods}</div></div></details>`;
        }).join("");
      }

      function navigateWeek(offset) {
        if (els.dialog.open || document.querySelector(".meal-card.is-editing")) {
          showToast("Save or close the open recipe editor before changing weeks.");
          return;
        }
        const nextWeek = shiftWeekKey(state.weekKey, offset);
        if (nextWeek < state.actualWeekKey) return;
        state.weekPlans[state.weekKey] = { schedule: cloneData(state.schedule), shoppingChecked: cloneData(state.shoppingChecked), prepChecked: cloneData(state.prepChecked || {}), busyDays: cloneData(state.busyDays || []), budgetLimit: state.budgetLimit };
        state.weekKey = nextWeek;
        const plan = state.weekPlans[nextWeek];
        state.schedule = plan ? cloneData(plan.schedule) : blankSchedule();
        state.shoppingChecked = plan ? cloneData(plan.shoppingChecked) : {};
        state.prepChecked = plan ? cloneData(plan.prepChecked || {}) : {};
        state.busyDays = plan ? cloneData(plan.busyDays || []) : [];
        state.budgetLimit = plan ? Math.max(0, Number(plan.budgetLimit) || 0) : 0;
        openDays.clear();
        openPeriods.clear();
        renderAll();
        persist();
        showToast(nextWeek === state.actualWeekKey ? "Showing this week." : "Future week ready to plan.");
      }

      function generatedPrepTasks() {
        const tasks = [];
        for (const day of DAYS) {
          for (const entry of state.schedule[day]) {
            const dish = getDish(entry.dishId);
            if (!dish) continue;
            const period = entry.period || "Lunch";
            const ingredients = ingredientLines(dish.ingredients).map(canonicalShoppingName);
            const hasProduce = ingredients.some(name => /sitaw|cabbage|carrot|sayote|cauliflower|eggplant|ampalaya|kangkong|onion|garlic|tomato|squash|okra|papaya|malunggay/.test(name));
            const hasProtein = ingredients.some(name => /pork|chicken|sardine|tinapa|fish|shrimp/.test(name));
            const prefix = `${day} · ${period} · ${dish.name}`;
            if (hasProtein) tasks.push({ id: `${entry.id}-protein`, label: `${prefix}: thaw or portion the protein` });
            if (hasProduce) tasks.push({ id: `${entry.id}-produce`, label: `${prefix}: wash and cut the vegetables` });
            tasks.push({ id: `${entry.id}-measure`, label: `${prefix}: measure remaining ingredients` });
          }
        }
        return tasks;
      }

      function renderPrepChecklist() {
        const tasks = generatedPrepTasks();
        const complete = tasks.filter(task => state.prepChecked[task.id]).length;
        const counter = document.getElementById("prepCount");
        counter.textContent = tasks.length ? `${complete}/${tasks.length} done` : "0 tasks";
        document.getElementById("prepChecklist").innerHTML = tasks.length
          ? tasks.map(task => `<label class="prep-task ${state.prepChecked[task.id] ? "is-done" : ""}"><input type="checkbox" data-action="check-prep" data-task="${escapeHTML(task.id)}" ${state.prepChecked[task.id] ? "checked" : ""}><span>${escapeHTML(task.label)}</span></label>`).join("")
          : `<p class="prep-empty">Add meals to generate a prep checklist for this week.</p>`;
      }

      function remindAboutPantryExpiry() {
        if (expiryReminderShown) return;
        const due = state.pantry.filter(item => {
          const info = pantryExpiry(item.expiresOn);
          return info && (info.tone === "is-expired" || info.tone === "is-expiring");
        }).length;
        if (!due) return;
        expiryReminderShown = true;
        showToast(`${due} pantry item${due === 1 ? "" : "s"} ${due === 1 ? "is" : "are"} expired or nearing its best-before date.`);
      }

      function renderFilters() {
        els.filters.innerHTML = CATEGORIES.map(category => `<button class="filter-chip" type="button" data-filter="${category}" aria-pressed="${activeCategory === category}">${CATEGORY_LABELS[category]}</button>`).join("");
      }

      function renderLibrary() {
        const query = els.search.value.trim().toLocaleLowerCase();
        const selectedDiet = els.dietFilter.value;
        const excludedAllergen = els.allergenFilter.value;
        const favoritesOnly = els.favoritesOnly.checked;
        const meals = state.meals.filter(meal => {
          const matchesCategory = activeCategory === "all" || meal.category === activeCategory;
          const matchesDiet = !selectedDiet || meal.dietTags.includes(selectedDiet);
          const safeForAllergen = !excludedAllergen || !meal.allergens.includes(excludedAllergen);
          const matchesFavorite = !favoritesOnly || meal.favorite;
          const matchesSearch = !query || `${meal.name} ${meal.ingredients} ${meal.procedure} ${meal.dietTags.join(" ")} ${meal.allergens.join(" ")}`.toLocaleLowerCase().includes(query);
          return matchesCategory && matchesDiet && safeForAllergen && matchesFavorite && matchesSearch;
        }).sort((a, b) => a.name.localeCompare(b.name));
        if (!meals.length) {
          const noMeals = state.meals.length === 0;
          els.library.innerHTML = `<div class="empty-state"><div><div class="empty-illustration" aria-hidden="true">${noMeals ? "🥣" : "🔎"}</div><h3>${noMeals ? "Your library is ready for a first dish." : "No dishes found."}</h3><p>${noMeals ? "Add a student-budget favorite and save its ingredients and steps here." : "Try another search or category, or add this dish to your library."}</p>${noMeals ? `<button class="btn btn-primary btn-small" type="button" data-action="open-add">Add your first dish</button>` : ""}</div></div>`;
            return;
        }
        els.library.innerHTML = meals.map(meal => {
          const ingredients = ingredientLines(meal.ingredients);
          const steps = procedureLines(meal.procedure);
          const nutrition = estimateNutrition(meal);
          const open = !isMobileLayout() || openMeals.has(meal.id) ? "open" : "";
          const ingredientPreview = ingredients.length
            ? `<div class="ingredient-chips">${ingredients.map(ingredient => `<span class="ingredient-chip">${escapeHTML(ingredient)}</span>`).join("")}</div>`
            : `<span class="empty-recipe">No ingredients saved yet.</span>`;
          const procedurePreview = steps.length
            ? `<ol class="preview-steps">${steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>`
            : `<span class="empty-recipe">No procedure saved yet.</span>`;
          const timeBadges = [meal.prepMinutes ? `<span>Prep ${meal.prepMinutes} min</span>` : "", meal.cookMinutes ? `<span>Cook ${meal.cookMinutes} min</span>` : ""].filter(Boolean).join("");
          const substitutions = ingredientLines(meal.substitutions);
          const tagMarkup = [...meal.dietTags.map(tag => `<span class="recipe-tag diet-tag">${escapeHTML(tag)}</span>`), ...meal.allergens.map(tag => `<span class="recipe-tag allergen-tag">Contains ${escapeHTML(tag)}</span>`)].join("") || `<span class="recipe-tag">No diet or allergen tags</span>`;
          const ratingButtons = Array.from({ length: 5 }, (_, index) => `<button class="rating-star ${index < meal.rating ? "is-selected" : ""}" type="button" data-action="rate-meal" data-id="${escapeHTML(meal.id)}" data-rating="${index + 1}" aria-label="Rate ${escapeHTML(meal.name)} ${index + 1} out of 5 stars" aria-pressed="${meal.rating === index + 1}">★</button>`).join("");
          return `<details class="meal-card" data-meal-card="${escapeHTML(meal.id)}" data-category="${escapeHTML(meal.category)}" ${open}>
            <summary class="meal-card-head"><div style="display:flex;align-items:center;gap:11px;min-width:0"><span class="meal-emoji" aria-hidden="true">${CATEGORY_EMOJI[meal.category] || "🍲"}</span><div><h3>${escapeHTML(meal.name)}</h3><span class="category-tag">${escapeHTML(CATEGORY_LABELS[meal.category] || "Mixed")}</span></div></div><span class="recipe-meta">${ingredients.length} ${ingredients.length === 1 ? "ingredient" : "ingredients"}<br>${steps.length} ${steps.length === 1 ? "step" : "steps"}<br>${Number(meal.servings) || 2} servings · ${meal.rating ? `${meal.rating}★` : "Unrated"}</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
            <div class="meal-card-body">
              <div class="meal-recipe-view">
                <div class="recipe-tags">${tagMarkup}</div>
                ${timeBadges ? `<div class="recipe-time-badges">${timeBadges}</div>` : ""}
                <section class="recipe-preview-block"><div class="recipe-preview-heading"><h4>Ingredients</h4><span class="preview-count">${ingredients.length}</span></div>${ingredientPreview}</section>
                <section class="recipe-preview-block"><div class="recipe-preview-heading"><h4>How to make it</h4><span class="preview-count">${steps.length}</span></div>${procedurePreview}</section>
                ${substitutions.length ? `<div class="substitution-note"><strong>Easy swaps</strong>${substitutions.map(line => `<span>${escapeHTML(line)}</span>`).join("")}</div>` : ""}
                ${nutritionMarkup(meal)}
                <div class="rating-row"><span>Your rating</span><div class="rating-stars" role="group" aria-label="Rate ${escapeHTML(meal.name)}">${ratingButtons}</div></div>
              </div>
              <div class="meal-editor">
                <label class="field-label">Ingredients <span class="field-hint">One ingredient per line</span><textarea class="recipe-textarea" data-field="ingredients" aria-label="Ingredients for ${escapeHTML(meal.name)}">${escapeHTML(meal.ingredients)}</textarea></label>
                <label class="field-label">Procedure <span class="field-hint">One step per line</span><textarea class="recipe-textarea" data-field="procedure" aria-label="Procedure for ${escapeHTML(meal.name)}">${escapeHTML(meal.procedure)}</textarea></label>
                <label class="field-label">Base servings<input class="control" data-field="servings" type="number" min="1" max="24" value="${Number(meal.servings) || 2}"></label>
                <div class="recipe-time-fields"><label class="field-label">Prep minutes<input class="control" data-field="prepMinutes" type="number" min="0" max="1440" value="${meal.prepMinutes}"></label><label class="field-label">Cook minutes<input class="control" data-field="cookMinutes" type="number" min="0" max="1440" value="${meal.cookMinutes}"></label></div>
                <label class="field-label">Substitution ideas <span class="field-hint">One swap per line</span><textarea class="recipe-textarea recipe-textarea-short" data-field="substitutions" aria-label="Substitutions for ${escapeHTML(meal.name)}">${escapeHTML(meal.substitutions)}</textarea></label>
                <label class="field-label">Diet tags <span class="field-hint">Comma separated; check each ingredient first</span><input class="control" data-field="dietTags" value="${escapeHTML(meal.dietTags.join(", "))}" placeholder="vegetarian, gluten-free"></label>
                <label class="field-label">Allergens <span class="field-hint">Comma separated; verify packaged ingredient labels</span><input class="control" data-field="allergens" value="${escapeHTML(meal.allergens.join(", "))}" placeholder="egg, soy, fish"></label>
              </div>
            </div>
            <div class="meal-card-actions">
              <button class="btn btn-secondary btn-small favorite-toggle" type="button" data-action="toggle-favorite" data-id="${escapeHTML(meal.id)}" aria-pressed="${meal.favorite}">${meal.favorite ? "★ Favorited" : "☆ Favorite"}</button>
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
            const scale = Math.max(1, Number(entry.servings) || Number(dish.servings) || 2) / Math.max(1, Number(dish.servings) || 2);
            for (const line of ingredientLines(dish.ingredients)) {
              const parsed = parseIngredientLine(line);
              const key = canonicalShoppingName(parsed.name);
              if (!key) continue;
              const estimate = defaultShoppingEstimate(parsed.name);
              const quantity = (parsed.quantity === null ? estimate.quantity : parsed.quantity) * scale;
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
          item.pantryQuantity = state.pantry.reduce((sum, stock) => {
            if (stock.key !== item.key) return sum;
            const converted = convertShoppingQuantity(item.name, stock.quantity, stock.unit, item.unit);
            return converted === null ? sum : sum + converted;
          }, 0);
          item.baseToBuyQuantity = Math.max(0, item.baseQuantityInUnit - item.pantryQuantity);
          const calculatedToBuy = Math.max(0, item.quantity - item.pantryQuantity);
          if (Number.isFinite(Number(saved.buyQuantity)) && saved.buyQuantity !== "") {
            const originalBuy = Number.isFinite(Number(saved.baseBuyQuantityAtEdit)) ? Number(saved.baseBuyQuantityAtEdit) : item.baseToBuyQuantity;
            item.toBuyQuantity = Math.max(0, Number(saved.buyQuantity) + item.baseToBuyQuantity - originalBuy);
          } else item.toBuyQuantity = calculatedToBuy;
          item.subtotal = item.toBuyQuantity * item.unitCost;
          return item;
        }).sort((a, b) => {
          const order = ["Produce", "Meat & seafood", "Eggs & dairy", "Pantry", "Other items", ...state.customAisles];
          return order.indexOf(shoppingAisle(a.name)) - order.indexOf(shoppingAisle(b.name)) || a.name.localeCompare(b.name);
        });
      }

      function shoppingAisle(name) {
        const key = canonicalShoppingName(name);
        const custom = state.shoppingAisles && state.shoppingAisles[key];
        if (custom && (custom === "Other items" || ["Produce", "Meat & seafood", "Eggs & dairy", "Pantry"].includes(custom) || state.customAisles.includes(custom))) return custom;
        if (/sitaw|cabbage|carrot|sayote|cauliflower|eggplant|ampalaya|kangkong|onion|garlic|ginger|tomato|squash|okra|papaya|malunggay|calamansi|chili|radish|beans/.test(key)) return "Produce";
        if (/pork|chicken|sardine|tinapa|fish|shrimp|beef/.test(key)) return "Meat & seafood";
        if (/egg|milk|cheese|butter/.test(key)) return "Eggs & dairy";
        if (/rice|misua|noodle|flour|soy sauce|fish sauce|oyster sauce|vinegar|oil|salt|pepper|bagoong|sinigang mix|mung beans/.test(key)) return "Pantry";
        return "Other items";
      }

      function estimateDishBudgetCost(dish, servings = dish.servings || 2) {
        const scale = Math.max(1, Number(servings) || 2) / Math.max(1, Number(dish.servings) || 2);
        return ingredientLines(dish.ingredients).reduce((total, line) => {
          const parsed = parseIngredientLine(line);
          const fallback = defaultShoppingEstimate(parsed.name);
          const quantity = (parsed.quantity === null ? fallback.quantity : parsed.quantity) * scale;
          const unit = parsed.unit || fallback.unit;
          return total + quantity * suggestedUnitCost(parsed.name, unit);
        }, 0);
      }

      function renderBudgetStatus(items, stats) {
        const input = document.getElementById("budgetLimitInput");
        input.value = state.budgetLimit ? String(state.budgetLimit) : "";
        const status = document.getElementById("budgetStatus");
        if (!state.budgetLimit) {
          status.innerHTML = `<span class="budget-status-dot"></span><span>Set a limit to get a live budget check and lower-cost meal ideas.</span>`;
          return;
        }
        const remaining = state.budgetLimit - stats.totalCost;
        const over = remaining < 0;
        const suggestions = [];
        if (over) {
          for (const day of DAYS) for (const entry of state.schedule[day]) {
            const dish = getDish(entry.dishId);
            if (!dish) continue;
            const originalCost = estimateDishBudgetCost(dish, entry.servings);
            const alternatives = state.meals.filter(candidate => candidate.id !== dish.id && (candidate.category === dish.category || candidate.category === "vegetable") && estimateDishBudgetCost(candidate, entry.servings) < originalCost * .82).map(candidate => ({ candidate, saving: originalCost - estimateDishBudgetCost(candidate, entry.servings) })).sort((a, b) => b.saving - a.saving)[0];
            if (alternatives) suggestions.push({ day, entry, dish, ...alternatives });
          }
        }
        status.innerHTML = `<div class="budget-status-line ${over ? "is-over" : "is-under"}"><span class="budget-status-dot"></span><strong>${over ? `${formatMoney(Math.abs(remaining))} over your limit` : `${formatMoney(remaining)} left this week`}</strong><span>Estimated total ${formatMoney(stats.totalCost)} / ${formatMoney(state.budgetLimit)}</span></div>${suggestions.length ? `<div class="budget-suggestions"><strong>Lower-cost swaps</strong>${suggestions.slice(0, 3).map(item => `<div><span>${escapeHTML(item.day)} · ${escapeHTML(item.dish.name)} → <b>${escapeHTML(item.candidate.name)}</b></span><button class="text-button" type="button" data-action="budget-swap" data-day="${escapeHTML(item.day)}" data-entry="${escapeHTML(item.entry.id)}" data-id="${escapeHTML(item.candidate.id)}">Save about ${escapeHTML(formatMoney(item.saving))}</button></div>`).join("")}</div>` : ""}`;
      }

      function renderFoodSavings() {
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit" }).format(monthStart);
        const saved = state.foodSavings.filter(item => String(item.savedAt).slice(0, 7) === monthKey);
        const savedValue = saved.reduce((sum, item) => sum + item.estimatedValue, 0);
        const restockCount = state.pantry.filter(item => item.minQuantity > 0 && item.quantity <= item.minQuantity).length;
        document.getElementById("shoppingInsights").innerHTML = `<article class="waste-summary"><span class="waste-icon" aria-hidden="true">♧</span><div><strong>Food saved this month</strong><small>${saved.filter(item => item.kind === "leftover").length} leftover portions · ${saved.filter(item => item.kind === "pantry").length} near-expiry pantry items used</small></div><b>${formatMoney(savedValue)} estimated value</b></article>${restockCount ? `<div class="restock-summary"><span aria-hidden="true">↻</span><span><strong>${restockCount} pantry item${restockCount === 1 ? "" : "s"} below your restock level.</strong> Check the pantry inventory below.</span></div>` : ""}`;
      }

      function renderLeftovers() {
        const items = state.leftovers;
        document.getElementById("leftoverCount").textContent = `${items.length} saved`;
        document.getElementById("leftoverItems").innerHTML = items.length ? items.map(item => {
          const expiry = pantryExpiry(item.expiresOn);
          return `<article class="leftover-card"><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(formatQuantity(item.quantity))} ${escapeHTML(item.unit)}${expiry ? ` · ${escapeHTML(expiry.label)}` : ""}</small></div><div><button class="btn btn-secondary btn-small" type="button" data-action="use-leftover" data-id="${escapeHTML(item.id)}">Used</button><button class="mini-icon-btn remove" type="button" data-action="remove-leftover" data-id="${escapeHTML(item.id)}" aria-label="Remove leftover ${escapeHTML(item.name)}">×</button></div></article>`;
        }).join("") : `<p class="tool-empty">Add cooked portions here to plan their next meal.</p>`;
      }

      function findExpiringMeals() {
        const daysUntil = date => date ? Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${manilaDateKey()}T00:00:00Z`)) / 86400000) : Infinity;
        const dueItems = [
          ...state.pantry.filter(item => daysUntil(item.expiresOn) >= 0 && daysUntil(item.expiresOn) <= 7).map(item => ({ key: item.key, name: item.name, type: "pantry", expiresOn: item.expiresOn })),
          ...state.leftovers.filter(item => daysUntil(item.expiresOn) >= 0 && daysUntil(item.expiresOn) <= 7).map(item => ({ key: canonicalShoppingName(item.name), name: item.name, type: "leftover", expiresOn: item.expiresOn }))
        ];
        return dueItems.map(source => {
          const sourceWords = source.key.split(/\s+/).filter(word => word.length > 3);
          const meal = state.meals.map(dish => {
            const title = canonicalShoppingName(dish.name);
            const ingredientMatch = ingredientLines(dish.ingredients).some(line => canonicalShoppingName(parseIngredientLine(line).name) === source.key);
            const leftoverTitleMatch = source.type === "leftover" && sourceWords.some(word => title.includes(word));
            return { dish, matches: ingredientMatch || leftoverTitleMatch };
          }).find(item => item.matches)?.dish;
          return meal ? { ...source, meal } : null;
        }).filter(Boolean).slice(0, 5);
      }

      function renderUseSoonSuggestions() {
        const matches = findExpiringMeals();
        document.getElementById("useSoonSuggestions").innerHTML = matches.length ? `<div class="use-soon-grid">${matches.map(item => `<article class="use-soon-card"><span class="use-soon-label">${item.type === "leftover" ? "Leftover" : "Use soon"}</span><strong>${escapeHTML(item.name)}</strong><span>Try ${escapeHTML(item.meal.name)}</span><button class="btn btn-secondary btn-small" type="button" data-action="schedule-use-soon" data-id="${escapeHTML(item.meal.id)}">Add a dinner →</button></article>`).join("")}</div>` : `<p class="tool-empty">Best-before/Use-before items</p>`;
      }

      function renderCustomAisles() {
        document.getElementById("customAisleTags").innerHTML = state.customAisles.length ? state.customAisles.map(aisle => `<span class="custom-aisle-tag">${escapeHTML(aisle)}<button type="button" data-action="delete-aisle" data-name="${escapeHTML(aisle)}" aria-label="Delete ${escapeHTML(aisle)} aisle">×</button></span>`).join("") : `<p class="tool-empty">Aisles you add will appear here.</p>`;
      }

      function renderPantryItems() {
        const container = document.getElementById("pantryItems");
        if (!state.pantry.length) {
          container.innerHTML = `<p class="pantry-empty">Your pantry list is empty.</p>`;
          return;
        }
        container.innerHTML = state.pantry.map(item => {
          const expiry = pantryExpiry(item.expiresOn);
          const restock = item.minQuantity > 0 && item.quantity <= item.minQuantity;
          return `<article class="pantry-item"><div class="pantry-name"><strong>${escapeHTML(item.name)}</strong>${expiry ? `<span class="expiry-badge ${expiry.tone}">${escapeHTML(expiry.label)}</span>` : ""}${restock ? `<span class="restock-badge">Low · restock</span>` : ""}<button class="text-button pantry-use-button" type="button" data-action="use-pantry" data-id="${escapeHTML(item.id)}">Mark used</button></div><label class="pantry-field"><span>Amount</span><input class="control" type="number" min="0" step="0.01" value="${escapeHTML(formatQuantity(item.quantity))}" data-pantry-field="quantity" data-id="${escapeHTML(item.id)}" aria-label="Pantry amount for ${escapeHTML(item.name)}"></label><label class="pantry-field"><span>Unit</span><select class="control" data-pantry-field="unit" data-id="${escapeHTML(item.id)}" aria-label="Pantry unit for ${escapeHTML(item.name)}">${Object.keys(UNIT_INFO).map(unit => `<option value="${escapeHTML(unit)}" ${unit === item.unit ? "selected" : ""}>${escapeHTML(unit)}</option>`).join("")}</select></label><label class="pantry-field pantry-expiry-field"><span>Best before</span><input class="control" type="date" value="${escapeHTML(item.expiresOn || "")}" data-pantry-field="expiresOn" data-id="${escapeHTML(item.id)}" aria-label="Best before date for ${escapeHTML(item.name)}"></label><label class="pantry-field pantry-restock-field"><span>Restock below</span><input class="control" type="number" min="0" step="0.01" value="${escapeHTML(item.minQuantity || 0)}" data-pantry-field="minQuantity" data-id="${escapeHTML(item.id)}" aria-label="Restock amount for ${escapeHTML(item.name)}"></label><button class="mini-icon-btn remove" type="button" data-action="remove-pantry" data-id="${escapeHTML(item.id)}" aria-label="Remove ${escapeHTML(item.name)} from pantry">✕</button></article>`;
        }).join("");
      }

      function manilaDateKey() {
        const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        return `${parts.find(part => part.type === "year").value}-${parts.find(part => part.type === "month").value}-${parts.find(part => part.type === "day").value}`;
      }
      function pantryExpiry(expiresOn) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOn || "")) return null;
        const days = Math.round((Date.parse(`${expiresOn}T00:00:00Z`) - Date.parse(`${manilaDateKey()}T00:00:00Z`)) / 86400000);
        if (days < 0) return { tone: "is-expired", label: `Expired ${Math.abs(days)}d ago` };
        if (days === 0) return { tone: "is-expired", label: "Expires today" };
        if (days <= 7) return { tone: "is-expiring", label: `Expires in ${days}d` };
        return { tone: "is-fresh", label: `Best before ${formatHistoryDate(expiresOn, { month: "short", day: "numeric" })}` };
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
        renderPantryItems();
        renderLeftovers();
        renderUseSoonSuggestions();
        renderFoodSavings();
        renderCustomAisles();
        renderBudgetStatus(items, stats);
        if (!items.length) {
          els.shopping.innerHTML = `<div class="shopping-empty"><span aria-hidden="true">🧺</span><strong>Your shopping list will appear here.</strong><small></small></div>`;
            return;
        }
        const aisleGroups = new Map();
        for (const item of items) {
          const aisle = shoppingAisle(item.key);
          if (!aisleGroups.has(aisle)) aisleGroups.set(aisle, []);
          aisleGroups.get(aisle).push(item);
        }
        const aisleOrder = ["Produce", "Meat & seafood", "Eggs & dairy", "Pantry", "Other items", ...state.customAisles];
        els.shopping.innerHTML = [...aisleGroups.entries()].sort(([a], [b]) => aisleOrder.indexOf(a) - aisleOrder.indexOf(b)).map(([aisle, aisleItems]) => `<section class="shopping-aisle"><div class="shopping-aisle-heading"><h4>${escapeHTML(aisle)}</h4><span>${aisleItems.length}</span></div>${aisleItems.map(item => {
          const units = unitOptionsFor(item.unit);
          const options = units.includes(item.unit) ? units : [item.unit, ...units];
          const aisleOptions = [...new Set([shoppingAisle(item.key), "Produce", "Meat & seafood", "Eggs & dairy", "Pantry", "Other items", ...state.customAisles])];
          return `<article class="shopping-row">
            <div class="shopping-cell ingredient-cell ${state.shoppingChecked[item.key] ? "is-checked" : ""}" data-label="Ingredient"><label class="shopping-check"><input type="checkbox" data-action="check-shopping-item" data-ingredient="${escapeHTML(item.key)}" ${state.shoppingChecked[item.key] ? "checked" : ""} aria-label="Mark ${escapeHTML(item.name)} as purchased"><span aria-hidden="true"></span></label><div class="shopping-ingredient-copy"><strong>${escapeHTML(item.name)}</strong><small>Used in ${item.occurrences} planned meal${item.occurrences === 1 ? "" : "s"}</small><select class="shopping-aisle-select" data-shopping-aisle="${escapeHTML(item.key)}" aria-label="Grocery aisle for ${escapeHTML(item.name)}">${aisleOptions.map(option => `<option value="${escapeHTML(option)}" ${option === shoppingAisle(item.key) ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select></div></div>
            <div class="shopping-cell" data-label="To buy"><input class="shopping-input" type="number" min="0" step="0.01" value="${escapeHTML(formatQuantity(item.toBuyQuantity))}" data-shopping-field="buyQuantity" data-ingredient="${escapeHTML(item.key)}" aria-label="Quantity to buy for ${escapeHTML(item.name)}"><small class="pantry-used">Need ${escapeHTML(formatQuantity(item.quantity))} ${escapeHTML(item.unit)} · have ${escapeHTML(formatQuantity(item.pantryQuantity))} in pantry</small></div>
            <div class="shopping-cell" data-label="Unit"><select class="shopping-unit" data-shopping-field="unit" data-ingredient="${escapeHTML(item.key)}" aria-label="Unit for ${escapeHTML(item.name)}">${options.map(unit => `<option value="${escapeHTML(unit)}" ${unit === item.unit ? "selected" : ""}>${escapeHTML(unit)}</option>`).join("")}</select></div>
            <div class="shopping-cell" data-label="Unit cost"><label class="money-input"><span>₱</span><input class="shopping-input" type="number" min="0" step="0.01" value="${escapeHTML(Number(item.unitCost.toFixed(2)))}" data-shopping-field="unitCost" data-ingredient="${escapeHTML(item.key)}" aria-label="Estimated unit cost for ${escapeHTML(item.name)}"></label></div>
            <div class="shopping-cell subtotal-cell" data-label="Subtotal"><strong>${escapeHTML(formatMoney(item.subtotal))}</strong></div>
          </article>`;
        }).join("")}</section>`).join("");
      }

      function formatHistoryDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
        const date = new Date(`${value}T00:00:00Z`);
        return new Intl.DateTimeFormat("en-PH", { ...options, timeZone: "UTC" }).format(date);
      }

      function renderHistory() {
        const history = [...state.history].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
        if (!history.length) {
          document.getElementById("historyList").innerHTML = `<div class="history-empty"><span aria-hidden="true">🗓️</span><strong>Your saved weeks will appear here.</strong><small>At the start of a new week, the completed plan is stored as a milestone.</small></div>`;
          return;
        }
        const groups = new Map();
        for (const record of history) {
          const monthKey = record.weekStart.slice(0, 7);
          if (!groups.has(monthKey)) groups.set(monthKey, []);
          groups.get(monthKey).push(record);
        }
        document.getElementById("historyList").innerHTML = [...groups.entries()].map(([monthKey, records], index) => {
          const monthDate = new Date(`${monthKey}-01T00:00:00Z`);
          const monthLabel = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric", timeZone: "UTC" }).format(monthDate);
          const weekCards = records.map(record => {
            const mealsById = new Map(record.meals.map(meal => [meal.id, meal]));
            const scheduled = DAYS.flatMap(day => record.schedule[day] || []).map(entry => mealsById.get(entry.dishId)).filter(Boolean);
            const uniqueNames = [...new Set(scheduled.map(meal => meal.name))];
            return `<article class="history-week-card"><div><strong>Week of ${escapeHTML(formatHistoryDate(record.weekStart))}</strong><span>${scheduled.length} meal${scheduled.length === 1 ? "" : "s"}${uniqueNames.length ? ` · ${escapeHTML(uniqueNames.slice(0, 3).join(", "))}${uniqueNames.length > 3 ? ` +${uniqueNames.length - 3} more` : ""}` : ""}</span></div><button class="btn btn-secondary btn-small" type="button" data-action="copy-history" data-id="${escapeHTML(record.id)}">Copy to selected week</button></article>`;
          }).join("");
          return `<details class="history-month" ${index === 0 ? "open" : ""}><summary><span><strong>${escapeHTML(monthLabel)}</strong><small>${records.length} saved week${records.length === 1 ? "" : "s"}</small></span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary><div class="history-month-content">${weekCards}</div></details>`;
        }).join("");
      }

      function downloadHistoryReport() {
        const records = [...state.history].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
        const generated = new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date());
        const months = new Map();
        for (const record of records) {
          const key = record.weekStart.slice(0, 7);
          if (!months.has(key)) months.set(key, []);
          months.get(key).push(record);
        }
        const content = records.length ? [...months.entries()].map(([key, weeks]) => {
          const label = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${key}-01T00:00:00Z`));
          const cards = weeks.map(record => {
            const mealsById = new Map(record.meals.map(meal => [meal.id, meal]));
            const days = DAYS.map(day => {
              const slots = MEAL_PERIODS.map(period => {
                const names = (record.schedule[day] || []).filter(entry => entry.period === period).map(entry => mealsById.get(entry.dishId)?.name).filter(Boolean);
                return names.length ? `<p><b>${escapeHTML(period)}:</b> ${names.map(escapeHTML).join(", ")}</p>` : "";
              }).join("");
              return slots ? `<div class="day"><strong>${escapeHTML(day)}</strong>${slots}</div>` : "";
            }).join("");
            return `<article class="week"><header><h3>Week of ${escapeHTML(formatHistoryDate(record.weekStart))}</h3><span>${DAYS.flatMap(day => record.schedule[day] || []).length} meals</span></header><div class="days">${days}</div></article>`;
          }).join("");
          return `<section class="month"><h2>${escapeHTML(label)}</h2>${cards}</section>`;
        }).join("") : `<p class="empty">No completed plans have been saved yet.</p>`;
        const report = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Meal plan history · Jercyrendipity</title><style>*{box-sizing:border-box}body{margin:0;padding:32px 18px;background:#edf0e5;color:#21392d;font:14px/1.5 Inter,system-ui,sans-serif}.page{max-width:900px;margin:auto}.hero,.month,.week{border:1px solid #e1e6d9;border-radius:20px;background:#fffdf5;box-shadow:0 12px 32px #25392712}.hero{padding:clamp(22px,5vw,42px);background:linear-gradient(125deg,#fffdf5,#e9efdf)}.brand{color:#284a34;font-weight:800}.mark{display:inline-grid;width:42px;height:42px;margin-right:8px;place-items:center;border-radius:13px;background:#284a34;color:#fff}.hero h1{margin:22px 0 4px;font:500 clamp(32px,7vw,50px)/1.05 Georgia,serif;letter-spacing:-.04em}.generated{color:#697769;font-size:12px}.toolbar{text-align:right;margin:0 0 14px}.toolbar button{min-height:44px;padding:0 18px;border:0;border-radius:99px;background:#284a34;color:white;font:inherit;font-weight:750}.month{margin-top:18px;padding:20px}.month h2{margin:0 0 12px;color:#284a34;font:500 26px Georgia,serif}.week{margin-top:10px;padding:16px}.week header{display:flex;justify-content:space-between;gap:12px}.week h3{margin:0;font-size:15px}.week header span{color:#697769;font-size:11px}.days{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.day{padding:10px;border-radius:12px;background:#f4f5ed}.day p{margin:4px 0 0;color:#536355;font-size:12px}.empty{padding:26px;text-align:center}.footer{margin:24px 0;color:#697769;font-size:11px}@media(max-width:600px){body{padding:16px 10px}.days{grid-template-columns:1fr}.month{padding:14px}.week{padding:13px}}@media print{body{padding:0;background:white}.toolbar{display:none}.hero,.month,.week{box-shadow:none;break-inside:avoid}}</style></head><body><div class="page"><div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button></div><header class="hero"><div class="brand"><span class="mark">🍽</span>Jercyrendipity Meal Planner</div><h1>Meal Plan History</h1><p class="generated">Generated ${escapeHTML(generated)}</p></header>${content}<footer class="footer">Generated using Jercyrendipity Meal Planner</footer></div></body></html>`;
        const blob = new Blob([report], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `jercyrendipity-meal-history-${manilaDateKey()}.html`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Meal history report downloaded.");
      }

      function copyHistoryPlan(recordId) {
        const record = state.history.find(item => item.id === recordId);
        if (!record) return;
        if (!window.confirm(`Copy this saved plan into the week of ${formatHistoryDate(state.weekKey)}? Its current schedule will be replaced.`)) return;
        const archivedMeals = new Map(record.meals.map(meal => [meal.id, cloneData(meal)]));
        state.meals = state.meals.map(meal => archivedMeals.get(meal.id) || meal);
        const currentMealIds = new Set(state.meals.map(meal => meal.id));
        state.meals.push(...record.meals.filter(meal => !currentMealIds.has(meal.id)).map(meal => cloneData(meal)));
        state.schedule = cloneData(record.schedule);
        state.shoppingChecked = {};
        state.prepChecked = {};
        openDays.clear();
        openPeriods.clear();
        persist();
        renderAll();
        showToast("Saved plan copied into the selected week.");
      }

      function renderAll() {
        renderDashboard();
        renderWeek();
        renderFilters();
        renderLibrary();
        renderShopping();
        renderHistory();
        renderPrepChecklist();
        renderPlanningTools();
      }

      function addScheduledMeal(day, dishId, period = "Lunch") {
        const dish = getDish(dishId);
        if (!DAYS.includes(day) || !dish) return;
        const entry = { id: makeId(), dishId, period: MEAL_PERIODS.includes(period) ? period : "Lunch", checkedIngredients: {}, servings: Number(dish.servings) || 2 };
        state.schedule[day].push(entry);
        openDays.add(day);
        openPeriods.add(`${day}|${entry.period}`);
        persist();
        renderAll();
        showToast(`${dish.name} added to ${day} ${entry.period.toLowerCase()}.`);
      }

      function scheduleSuggestedDinner(dishId) {
        const day = DAYS.find(candidate => !state.busyDays.includes(candidate) && !state.schedule[candidate].some(entry => entry.period === "Dinner")) || DAYS.find(candidate => !state.schedule[candidate].some(entry => entry.period === "Dinner")) || "Sunday";
        addScheduledMeal(day, dishId, "Dinner");
      }

      function markPantryUsed(itemId) {
        const item = state.pantry.find(stock => stock.id === itemId);
        if (!item) return;
        const daysLeft = item.expiresOn ? Math.round((Date.parse(`${item.expiresOn}T00:00:00Z`) - Date.parse(`${manilaDateKey()}T00:00:00Z`)) / 86400000) : Infinity;
        if (daysLeft >= 0 && daysLeft <= 7) state.foodSavings.push({ name: item.name, kind: "pantry", quantity: item.quantity, unit: item.unit, estimatedValue: item.quantity * suggestedUnitCost(item.name, item.unit), savedAt: new Date().toISOString() });
        state.foodSavings = state.foodSavings.slice(-200);
        state.pantry = state.pantry.filter(stock => stock.id !== itemId);
        persist();
        renderAll();
        showToast(daysLeft >= 0 && daysLeft <= 7 ? `${item.name} recorded as saved from waste.` : `${item.name} marked as used.`);
      }

      function useLeftover(leftoverId) {
        const item = state.leftovers.find(leftover => leftover.id === leftoverId);
        if (!item) return;
        state.foodSavings.push({ name: item.name, kind: "leftover", quantity: item.quantity, unit: item.unit, estimatedValue: 0, savedAt: new Date().toISOString() });
        state.foodSavings = state.foodSavings.slice(-200);
        state.leftovers = state.leftovers.filter(leftover => leftover.id !== leftoverId);
        persist();
        renderAll();
        showToast("Leftover marked used and counted in this month’s food-saved summary.");
      }

      function parsePastedRecipe(text) {
        const lines = String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const heading = value => /^(ingredients?|what you need)\s*:?$/i.test(value);
        const directions = value => /^(procedure|directions?|instructions?|method|steps?)\s*:?$/i.test(value);
        const ingredientIndex = lines.findIndex(heading);
        const procedureIndex = lines.findIndex(directions);
        if (!lines.length || ingredientIndex < 0 || procedureIndex < 0 || procedureIndex <= ingredientIndex) throw new Error("Paste a recipe with Ingredients and Procedure or Instructions headings.");
        const firstLine = lines[0] || "";
        const name = heading(firstLine) || directions(firstLine) ? "" : firstLine.replace(/^recipe(?:\s+name)?\s*:\s*/i, "").replace(/[:—-]$/, "").trim();
        const ingredients = lines.slice(ingredientIndex + 1, procedureIndex).map(line => line.replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, "")).filter(Boolean);
        const procedure = lines.slice(procedureIndex + 1).map(line => line.replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, "")).filter(Boolean);
        if (!name || !ingredients.length || !procedure.length) throw new Error("Include a recipe name, at least one ingredient, and at least one cooking step.");
        return { name, ingredients: ingredients.join("\n"), procedure: procedure.join("\n") };
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

      function setHistoryVisible(visible, shouldScroll = true) {
        const section = document.getElementById("meal-history");
        section.hidden = !visible;
        document.querySelectorAll("[data-history-toggle]").forEach(button => {
          button.setAttribute("aria-expanded", String(visible));
          const firstText = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
          if (firstText) firstText.textContent = visible ? "Hide history " : "View history ";
        });
        if (visible && shouldScroll) section.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!visible && shouldScroll) document.getElementById("scheduler").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function setMasterlistVisible(visible, shouldScroll = true) {
        const section = document.getElementById("meal-library");
        section.hidden = !visible;
        document.querySelectorAll("[data-masterlist-toggle]").forEach(button => {
          button.setAttribute("aria-expanded", String(visible));
          const firstText = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
          if (firstText) firstText.textContent = visible ? "Hide masterlist " : "View masterlist ";
        });
        if (visible && shouldScroll) section.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!visible && shouldScroll) document.getElementById("scheduler").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      async function lockWebsite() {
        for (const button of [document.getElementById("logoutButton"), document.getElementById("mobileLogoutButton")]) button.disabled = true;
        try {
          const response = await fetch("api.php?action=logout", {
            method: "POST",
            credentials: "same-origin",
            headers: { "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content }
          });
          if (!response.ok) throw new Error("The website could not be locked right now.");
          window.location.reload();
        } catch (error) {
          for (const button of [document.getElementById("logoutButton"), document.getElementById("mobileLogoutButton")]) button.disabled = false;
          showToast(error.message || "The website could not be locked right now.");
        }
      }

      async function loadSharedState() {
        const gate = document.getElementById("databaseGate");
        const title = document.getElementById("databaseGateTitle");
        const message = document.getElementById("databaseGateMessage");
        const retryButton = document.getElementById("databaseRetryButton");
        gate.hidden = false;
        gate.classList.remove("has-error");
        title.textContent = "Connecting to shared meal plan";
        message.textContent = "Loading recipes and your weekly plan from MySQL…";
        retryButton.hidden = true;
        try {
          const response = await fetch("api.php?action=state", { credentials: "same-origin", cache: "no-store" });
          const result = await response.json();
          if (response.status === 401) { window.location.reload(); return; }
          if (!response.ok) throw new Error(result.error || "The shared database could not be reached.");
          sharedRevision = Number(result.revision) || 0;
          if (result.state) {
            state = normalizeState(result.state);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* MySQL remains authoritative. */ }
          }
          const weekChanged = rollWeekForward();
          sharedDataReady = true;
          renderAll();
          gate.hidden = true;
          remindAboutPantryExpiry();
          checkMealReminders();
          if (!result.state || weekChanged) persist();
        } catch (error) {
          gate.classList.add("has-error");
          title.textContent = "The shared database is not ready";
          message.textContent = `${error.message} Import database.sql in phpMyAdmin and check the MySQL login in api/config.php, then try again.`;
          retryButton.hidden = false;
        }
      }

      async function refreshSharedState() {
        if (!sharedDataReady || document.hidden || sharedSaveInProgress || pendingSharedSnapshot) return;
        if (rollWeekForward()) {
          renderAll();
          persist();
          showToast("Last week's plan was saved to meal history.");
          return;
        }
        const active = document.activeElement;
        if (els.dialog.open || document.querySelector(".meal-card.is-editing") || (active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName))) return;
        try {
          const response = await fetch("api.php?action=state", { credentials: "same-origin", cache: "no-store" });
          const result = await response.json();
          if (response.status === 401) { window.location.reload(); return; }
          if (!response.ok || Number(result.revision) <= sharedRevision) return;
          sharedRevision = Number(result.revision) || sharedRevision;
          state = normalizeState(result.state || null);
          const weekChanged = rollWeekForward();
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* MySQL remains authoritative. */ }
          renderAll();
          showToast("Shared meal plan updated from another device.");
          if (weekChanged) persist();
        } catch (error) {
          /* The next polling cycle will retry without interrupting the planner. */
        }
      }

      document.addEventListener("click", event => {
        const weekStep = event.target.closest("[data-week-step]");
        if (weekStep) { navigateWeek(Number(weekStep.dataset.weekStep)); return; }
        const historyToggle = event.target.closest("[data-history-toggle]");
        if (historyToggle) {
          const show = document.getElementById("meal-history").hidden;
          setHistoryVisible(show);
          if (historyToggle.closest(".mobile-drawer")) setDrawerOpen(false);
          return;
        }
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const action = button.dataset.action;

        if (action === "open-add") { openAddDialog(); return; }
        if (action === "busy-quick-add") { addScheduledMeal(button.dataset.day, button.dataset.id, "Dinner"); return; }
        if (action === "apply-template") { applyPlanTemplate(button.dataset.id); return; }
        if (action === "delete-template") {
          const template = state.planTemplates.find(item => item.id === button.dataset.id);
          if (!template || !window.confirm(`Delete the “${template.name}” template?`)) return;
          state.planTemplates = state.planTemplates.filter(item => item.id !== template.id);
          persist(); renderPlanningTools(); showToast("Plan template deleted."); return;
        }
        if (action === "budget-swap") {
          const entry = state.schedule[button.dataset.day]?.find(item => item.id === button.dataset.entry);
          const replacement = getDish(button.dataset.id);
          if (!entry || !replacement) return;
          entry.dishId = replacement.id; entry.checkedIngredients = {}; entry.servings = Number(replacement.servings) || 2;
          persist(); renderAll(); showToast(`${replacement.name} added as a lower-cost option.`); return;
        }
        if (action === "schedule-use-soon") { scheduleSuggestedDinner(button.dataset.id); return; }
        if (action === "use-pantry") { markPantryUsed(button.dataset.id); return; }
        if (action === "use-leftover") { useLeftover(button.dataset.id); return; }
        if (action === "remove-leftover") {
          state.leftovers = state.leftovers.filter(item => item.id !== button.dataset.id);
          persist(); renderShopping(); showToast("Leftover removed."); return;
        }
        if (action === "delete-aisle") {
          const name = button.dataset.name;
          if (!window.confirm(`Remove the “${name}” aisle? Items assigned there will return to their suggested aisles.`)) return;
          state.customAisles = state.customAisles.filter(aisle => aisle !== name);
          for (const [key, aisle] of Object.entries(state.shoppingAisles)) if (aisle === name) delete state.shoppingAisles[key];
          persist(); renderShopping(); return;
        }
        if (action === "cook-mode") { openCookingMode(button.dataset.day, button.dataset.entry); return; }
        if (action === "mark-cooked") { setMealCooked(button.dataset.day, button.dataset.entry); return; }
        if (action === "set-reminder") {
          void (async () => {
            try {
              await requestReminderPermission();
              const entry = state.schedule[button.dataset.day]?.find(item => item.id === button.dataset.entry);
              const input = document.querySelector(`[data-reminder-time="${CSS.escape(button.dataset.entry)}"]`);
              const timestamp = input && Date.parse(input.value);
              if (!entry || !input || !input.value || !Number.isFinite(timestamp) || timestamp <= Date.now()) throw new Error("Choose a future reminder time.");
              entry.reminderAt = input.value; entry.reminderSent = false; notifiedReminders.delete(entry.id);
              persist(); renderAll(); showToast("Cooking reminder saved. Keep the planner open to receive it.");
            } catch (error) { showToast(error.message || "Could not set that reminder."); }
          })();
          return;
        }
        if (action === "clear-reminder") {
          const entry = state.schedule[button.dataset.day]?.find(item => item.id === button.dataset.entry);
          if (entry) { entry.reminderAt = ""; entry.reminderSent = false; notifiedReminders.delete(entry.id); persist(); renderAll(); }
          return;
        }
        if (action === "add-scheduled") {
          const select = document.querySelector(`[data-day-select="${CSS.escape(button.dataset.day)}"][data-period="${CSS.escape(button.dataset.period)}"]`);
          if (!select || !select.value) { showToast("Choose a dish first."); return; }
          addScheduledMeal(button.dataset.day, select.value, button.dataset.period);
          return;
        }
        if (action === "step-timer") { startStepTimer(button); return; }
        if (action === "copy-history") { copyHistoryPlan(button.dataset.id); return; }
        if (action === "serving-step") {
          const day = button.dataset.day;
          const entry = state.schedule[day].find(item => item.id === button.dataset.entry);
          if (!entry) return;
          entry.servings = Math.max(1, Math.min(24, (Number(entry.servings) || 2) + Number(button.dataset.step)));
          persist();
          renderAll();
          return;
        }
        if (action === "toggle-favorite" || action === "rate-meal") {
          const meal = getDish(button.dataset.id);
          if (!meal) return;
          if (action === "toggle-favorite") meal.favorite = !meal.favorite;
          else meal.rating = Number(button.dataset.rating);
          persist();
          renderAll();
          showToast(action === "toggle-favorite" ? `${meal.name} ${meal.favorite ? "added to" : "removed from"} favorites.` : `Rating saved for ${meal.name}.`);
          return;
        }
        if (action === "remove-pantry") {
          state.pantry = state.pantry.filter(item => item.id !== button.dataset.id);
          persist();
          renderShopping();
          showToast("Pantry item removed.");
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
          meal.servings = Math.max(1, Math.min(24, Number(card.querySelector('[data-field="servings"]').value) || 2));
          meal.prepMinutes = Math.max(0, Math.min(1440, Number(card.querySelector('[data-field="prepMinutes"]').value) || 0));
          meal.cookMinutes = Math.max(0, Math.min(1440, Number(card.querySelector('[data-field="cookMinutes"]').value) || 0));
          meal.substitutions = card.querySelector('[data-field="substitutions"]').value.trim();
          meal.dietTags = sanitizeTags(card.querySelector('[data-field="dietTags"]').value, DIET_TAGS);
          meal.allergens = sanitizeTags(card.querySelector('[data-field="allergens"]').value, ALLERGEN_TAGS);
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
          for (const plan of Object.values(state.weekPlans)) {
            for (const day of DAYS) plan.schedule[day] = (plan.schedule[day] || []).filter(entry => entry.dishId !== meal.id);
          }
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
          entry.servings = Number(getDish(replacement).servings) || 2;
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
        } else if (panel.matches("details[data-period-card]")) {
          if (panel.open) openPeriods.add(panel.dataset.periodCard);
          else openPeriods.delete(panel.dataset.periodCard);
        } else if (panel.matches("details[data-meal-card]")) {
          if (panel.open) openMeals.add(panel.dataset.mealCard);
          else openMeals.delete(panel.dataset.mealCard);
        }
      }, true);

      document.addEventListener("change", event => {
        const target = event.target;
        if (target.matches("[data-busy-day]")) {
          const day = target.dataset.busyDay;
          state.busyDays = state.busyDays.includes(day) ? state.busyDays.filter(item => item !== day) : [...state.busyDays, day];
          persist(); renderWeek(); renderPlanningTools(); showToast(`${day} ${state.busyDays.includes(day) ? "marked busy" : "removed from busy days"}.`); return;
        }
        if (target.matches("[data-shopping-aisle]")) {
          const key = target.dataset.shoppingAisle;
          if (["Produce", "Meat & seafood", "Eggs & dairy", "Pantry", "Other items", ...state.customAisles].includes(target.value)) state.shoppingAisles[key] = target.value;
          persist(); renderShopping(); return;
        }
        if (target.id === "budgetLimitInput") {
          state.budgetLimit = Math.max(0, Number(target.value) || 0);
          persist(); renderShopping(); showToast(state.budgetLimit ? "Weekly budget limit saved." : "Weekly budget limit cleared."); return;
        }
        if (target.matches("[data-action='check-prep']")) {
          state.prepChecked[target.dataset.task] = target.checked;
          persist();
          renderPrepChecklist();
          return;
        }
        if (target.matches("[data-serving-count]")) {
          const day = target.dataset.day;
          const entry = state.schedule[day].find(item => item.id === target.dataset.entry);
          if (!entry) return;
          entry.servings = Math.max(1, Math.min(24, Number(target.value) || 1));
          persist();
          renderAll();
          return;
        }
        if (target.matches("[data-pantry-field]")) {
          const stock = state.pantry.find(item => item.id === target.dataset.id);
          if (!stock) return;
          if (target.dataset.pantryField === "quantity") stock.quantity = Math.max(0, Number(target.value) || 0);
          if (target.dataset.pantryField === "expiresOn") stock.expiresOn = target.value;
          if (target.dataset.pantryField === "minQuantity") stock.minQuantity = Math.max(0, Number(target.value) || 0);
          if (target.dataset.pantryField === "unit") {
            const oldUnit = stock.unit;
            const nextUnit = normalizeUnit(target.value);
            const converted = convertShoppingQuantity(stock.name, stock.quantity, stock.unit, nextUnit);
            if (converted === null) {
              target.value = stock.unit;
              showToast("Those units cannot be converted for this ingredient. Its pantry amount was kept as entered.");
              return;
            }
            stock.quantity = converted;
            const threshold = convertShoppingQuantity(stock.name, stock.minQuantity, oldUnit, nextUnit);
            if (threshold !== null) stock.minQuantity = threshold;
            stock.unit = nextUnit;
          }
          persist();
          renderShopping();
          return;
        }
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
          if ((target.dataset.shoppingField === "buyQuantity" || target.dataset.shoppingField === "unitCost") && target.value === "") return;
          const key = target.dataset.ingredient;
          const item = collectShoppingItems().find(candidate => candidate.key === key);
          if (!item) return;
          const adjustment = state.shoppingAdjustments[key] || {};
          adjustment.unit = item.unit;
          adjustment.baseQuantityAtEdit = item.baseQuantityInUnit;
          adjustment.quantity = item.quantity;
          if (target.dataset.shoppingField === "buyQuantity") {
            adjustment.buyQuantity = Math.max(0, Number(target.value) || 0);
            adjustment.baseBuyQuantityAtEdit = item.baseToBuyQuantity;
          } else if (target.dataset.shoppingField === "unitCost") {
            adjustment.unitCost = Math.max(0, Number(target.value) || 0);
          } else if (target.dataset.shoppingField === "unit") {
            const nextUnit = normalizeUnit(target.value);
            if (!UNIT_INFO[nextUnit]) return;
            const convertedQuantity = convertShoppingQuantity(item.name, item.quantity, item.unit, nextUnit);
            const convertedBase = convertShoppingQuantity(item.name, item.baseQuantityInUnit, item.unit, nextUnit);
            const convertedCost = convertShoppingUnitPrice(item.name, item.unitCost, item.unit, nextUnit);
            const convertedBuy = convertShoppingQuantity(item.name, item.toBuyQuantity, item.unit, nextUnit);
            const convertedBaseBuy = convertShoppingQuantity(item.name, item.baseToBuyQuantity, item.unit, nextUnit);
            adjustment.unit = nextUnit;
            adjustment.quantity = convertedQuantity === null ? item.quantity : convertedQuantity;
            adjustment.baseQuantityAtEdit = convertedBase === null ? item.baseQuantityInUnit : convertedBase;
            adjustment.buyQuantity = convertedBuy === null ? item.toBuyQuantity : convertedBuy;
            adjustment.baseBuyQuantityAtEdit = convertedBaseBuy === null ? item.baseToBuyQuantity : convertedBaseBuy;
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
      els.dietFilter.addEventListener("change", renderLibrary);
      els.allergenFilter.addEventListener("change", renderLibrary);
      els.favoritesOnly.addEventListener("change", renderLibrary);
      els.menuToggle.addEventListener("click", () => setDrawerOpen(!els.mobileDrawer.classList.contains("is-open")));
      document.getElementById("closeMenu").addEventListener("click", () => setDrawerOpen(false));
      els.drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));
      els.mobileDrawer.addEventListener("click", event => { if (event.target.closest("a")) setDrawerOpen(false); });
      document.querySelectorAll("[data-masterlist-toggle]").forEach(button => button.addEventListener("click", () => {
        const show = document.getElementById("meal-library").hidden;
        setMasterlistVisible(show);
        if (button.closest(".mobile-drawer")) setDrawerOpen(false);
      }));
      document.getElementById("hideMasterlistButton").addEventListener("click", () => setMasterlistVisible(false));
      document.getElementById("logoutButton").addEventListener("click", lockWebsite);
      document.getElementById("mobileLogoutButton").addEventListener("click", lockWebsite);
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
        const ingredients = String(form.get("ingredients") || "").trim();
        const meal = {
          id: makeId(), name, category: String(form.get("category") || "mixed"), ingredients,
          procedure: String(form.get("procedure") || "").trim(), servings: Math.max(1, Math.min(24, Number(form.get("servings")) || 2)),
          prepMinutes: Math.max(0, Math.min(1440, Number(form.get("prepMinutes")) || 0)),
          cookMinutes: Math.max(0, Math.min(1440, Number(form.get("cookMinutes")) || 0)),
          substitutions: String(form.get("substitutions") || "").trim(),
          favorite: false, rating: 0,
          dietTags: sanitizeTags(String(form.get("dietTags") || ""), DIET_TAGS),
          allergens: sanitizeTags(String(form.get("allergens") || ""), ALLERGEN_TAGS)
        };
        if (!meal.allergens.length) meal.allergens = inferAllergens(ingredients);
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

      document.getElementById("parseRecipeButton").addEventListener("click", () => {
        try {
          const recipe = parsePastedRecipe(document.getElementById("recipeImportText").value);
          els.addForm.elements.name.value = recipe.name;
          els.addForm.elements.ingredients.value = recipe.ingredients;
          els.addForm.elements.procedure.value = recipe.procedure;
          document.querySelector(".recipe-import-panel").open = false;
          showToast("Recipe fields filled. Review them before saving.");
        } catch (error) { showToast(error.message); }
      });

      document.getElementById("templateForm").addEventListener("submit", event => {
        event.preventDefault();
        const name = new FormData(event.currentTarget).get("name");
        if (saveCurrentTemplate(name)) event.currentTarget.reset();
      });

      document.getElementById("leftoverForm").addEventListener("submit", event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") || "").trim();
        const quantity = Math.max(0, Number(form.get("quantity")) || 0);
        if (!name || quantity <= 0) { showToast("Enter a leftover and the amount you have."); return; }
        state.leftovers.push({ id: makeId(), name, quantity, unit: String(form.get("unit") || "portion"), expiresOn: String(form.get("expiresOn") || "") });
        persist(); event.currentTarget.reset(); renderShopping(); showToast("Leftover saved to your tracker.");
      });

      document.getElementById("aisleForm").addEventListener("submit", event => {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get("name") || "").trim().slice(0, 32);
        if (!name) return;
        if (["Produce", "Meat & seafood", "Eggs & dairy", "Pantry", "Other items", ...state.customAisles].some(item => item.toLocaleLowerCase() === name.toLocaleLowerCase())) { showToast("That aisle already exists."); return; }
        if (state.customAisles.length >= 15) { showToast("You can save up to 15 custom aisles."); return; }
        state.customAisles.push(name); persist(); event.currentTarget.reset(); renderShopping(); showToast(`${name} aisle added.`);
      });

      document.getElementById("pantryForm").addEventListener("submit", event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") || "").trim();
        const key = canonicalShoppingName(name);
        const quantity = Math.max(0, Number(form.get("quantity")) || 0);
        const minQuantity = Math.max(0, Number(form.get("minQuantity")) || 0);
        const unit = normalizeUnit(String(form.get("unit") || "item"));
        if (!name || !key || quantity <= 0) return;
        const existing = state.pantry.find(item => item.key === key && item.unit === unit);
        const expiresOn = String(form.get("expiresOn") || "");
        if (existing) {
          existing.quantity += quantity;
          if (expiresOn && (!existing.expiresOn || expiresOn < existing.expiresOn)) existing.expiresOn = expiresOn;
          if (minQuantity) existing.minQuantity = minQuantity;
        } else state.pantry.push({ id: makeId(), name, key, quantity, unit, expiresOn, minQuantity });
        persist();
        event.currentTarget.reset();
        renderShopping();
        showToast(`${name} added to your pantry.`);
      });

      document.getElementById("exportBackupButton").addEventListener("click", downloadPlannerBackup);
      document.getElementById("importBackupButton").addEventListener("click", () => document.getElementById("backupFileInput").click());
      document.getElementById("backupFileInput").addEventListener("change", event => { const file = event.target.files && event.target.files[0]; void restorePlannerBackup(file); event.target.value = ""; });

      document.getElementById("cookModeClose").addEventListener("click", () => document.getElementById("cookModeDialog").close());
      document.getElementById("cookModePreviousButton").addEventListener("click", () => { if (cookingSession && cookingSession.index > 0) { cookingSession.index -= 1; renderCookingStep(); } });
      document.getElementById("cookModeNextButton").addEventListener("click", () => {
        if (!cookingSession) return;
        if (cookingSession.index < cookingSession.steps.length - 1) { cookingSession.index += 1; renderCookingStep(); return; }
        const { day, entryId } = cookingSession;
        cookingSession = null;
        document.getElementById("cookModeDialog").close();
        setMealCooked(day, entryId, true);
      });
      document.getElementById("keepScreenButton").addEventListener("click", () => void setKeepScreenOn());
      document.getElementById("cookModeDialog").addEventListener("close", () => { cookingSession = null; cookingWakeLock?.release(); cookingWakeLock = null; document.getElementById("keepScreenButton").textContent = "Keep screen on"; });


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
        const reportAisles = new Map();
        for (const item of items) { const aisle = shoppingAisle(item.key); if (!reportAisles.has(aisle)) reportAisles.set(aisle, []); reportAisles.get(aisle).push(item); }
        const rows = items.length ? [...reportAisles.entries()].map(([aisle, aisleItems]) => `<tr class="aisle-group"><th colspan="5" style="padding:10px 18px;background:#e9efdf;color:#42644a;font-size:10px;letter-spacing:.08em;text-align:left;text-transform:uppercase">${escapeHTML(aisle)}</th></tr>${aisleItems.map(item => `<tr>
          <td data-label="Ingredient"><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(aisle)} · used in ${item.occurrences} planned meal${item.occurrences === 1 ? "" : "s"}; ${escapeHTML(formatQuantity(item.pantryQuantity))} ${escapeHTML(item.unit)} in pantry</small></td>
          <td data-label="Quantity">${escapeHTML(formatQuantity(item.toBuyQuantity))}</td>
          <td data-label="Unit">${escapeHTML(item.unit)}</td>
          <td data-label="Unit cost">${escapeHTML(formatMoney(item.unitCost))}</td>
          <td data-label="Subtotal"><strong>${escapeHTML(formatMoney(item.subtotal))}</strong></td>
        </tr>`).join("")}`).join("") : `<tr><td colspan="5" class="empty-row">No ingredients yet. Add meals to your weekly plan to build the list.</td></tr>`;
        const report = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Shopping List Report · Jercyrendipity Meal Planner</title>
<style>
:root{--sage:#edf0e5;--paper:#fffdf5;--ink:#21392d;--soft:#697769;--line:#e3e7da;--green:#284a34;--shadow:0 18px 55px rgba(40,60,43,.12)}*{box-sizing:border-box}body{margin:0;padding:38px 20px;background:linear-gradient(140deg,#edf0e5,#f7f5eb);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;line-height:1.5}.report{width:min(980px,100%);margin:0 auto}.toolbar{display:flex;justify-content:flex-end;margin:0 0 14px}.print-button{min-height:44px;padding:0 18px;border:0;border-radius:99px;background:var(--green);color:#fffdf5;font:inherit;font-weight:750;cursor:pointer;box-shadow:0 8px 18px rgba(40,74,52,.17)}
.report-header{position:relative;overflow:hidden;padding:clamp(26px,5vw,52px);border:1px solid rgba(87,112,73,.16);border-radius:26px;background:linear-gradient(120deg,#fffdf5 0%,#f8f8ef 60%,#e9efdf 100%);box-shadow:var(--shadow)}.report-header:after{position:absolute;right:-72px;top:-110px;width:270px;height:270px;border:1px solid rgba(92,122,73,.18);border-radius:50%;content:"";box-shadow:0 0 0 24px rgba(92,122,73,.04),0 0 0 48px rgba(92,122,73,.025)}.brand{position:relative;z-index:1;display:flex;align-items:center;gap:12px;color:var(--green);font-size:12px;font-weight:800;letter-spacing:.04em}.brand-icon{display:grid;width:46px;height:46px;place-items:center;border-radius:15px;background:var(--green);color:#fffdf5;font-size:22px;box-shadow:0 8px 18px rgba(40,74,52,.18)}.eyebrow{margin:26px 0 5px;color:#7d8b70;font-size:10px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}.report-header h1{position:relative;z-index:1;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,6vw,57px);font-weight:500;letter-spacing:-.055em;line-height:1.05}.generated{position:relative;z-index:1;margin:13px 0 0;color:var(--soft);font-size:12px}
.summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:18px 0}.summary-card{min-height:116px;padding:18px;border:1px solid var(--line);border-radius:17px;background:rgba(255,253,245,.9);box-shadow:0 9px 22px rgba(40,60,43,.06)}.summary-label{display:block;color:var(--soft);font-size:10px;font-weight:750;letter-spacing:.04em}.summary-value{display:block;margin-top:12px;color:var(--green);font-family:Georgia,"Times New Roman",serif;font-size:25px;font-weight:700;letter-spacing:-.04em}.summary-value.money{font-size:21px}.table-card{overflow:hidden;border:1px solid var(--line);border-radius:21px;background:var(--paper);box-shadow:var(--shadow)}.table-title{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;padding:23px 25px 17px}.table-title h2{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:25px;font-weight:500;letter-spacing:-.035em}.table-title span{color:var(--soft);font-size:11px}table{width:100%;border-collapse:collapse;text-align:left}thead{background:#e9efdf;color:#61705e;font-size:10px;letter-spacing:.09em;text-transform:uppercase}th,td{padding:13px 16px}th:first-child,td:first-child{padding-left:25px}th:last-child,td:last-child{padding-right:25px;text-align:right}tbody tr:nth-child(even){background:#f7f7ef}tbody tr:nth-child(odd){background:#fffdf5}tbody td{border-top:1px solid #edf0e7;font-variant-numeric:tabular-nums}tbody td small{display:block;margin-top:2px;color:#899386;font-size:10px}.empty-row{padding:30px!important;text-align:center!important;color:var(--soft)}tfoot td{padding:17px 25px;border-top:1px solid var(--line);background:#eff2e8;font-weight:800}tfoot td:last-child{color:var(--green);font-size:19px}.estimate-note{margin:13px 3px 0;color:var(--soft);font-size:10px}.estimate-note a{color:var(--green);text-decoration:underline;text-underline-offset:2px}.report-footer{display:flex;justify-content:space-between;gap:15px;margin-top:23px;padding-top:16px;border-top:1px solid rgba(77,99,67,.18);color:#778374;font-size:11px}.report-footer strong{color:var(--green)}
@media(max-width:700px){body{padding:18px 12px}.summary{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.summary-card{min-height:100px;padding:14px}.summary-value{font-size:21px}.table-title{align-items:flex-start;flex-direction:column;padding:18px 17px 12px}thead{display:none}table,tbody,tfoot,tr{display:block}tbody tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 10px;padding:10px 14px;border-top:1px solid #edf0e7}tbody td{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border:0;text-align:right!important}tbody td:before{content:attr(data-label);color:#778374;font-size:10px;font-weight:700}tbody td:first-child{grid-column:1/-1;display:block;padding:7px 0 10px;text-align:left!important}tbody td:first-child:before{display:none}tbody td:last-child{padding-right:0}tfoot tr{display:grid;grid-template-columns:1fr auto;align-items:center;padding:12px 16px}tfoot td{padding:8px 0!important;border:0}tfoot td:first-child{padding-left:0!important}tfoot td:last-child{padding-right:0!important}.report-footer{flex-direction:column;gap:4px}}@media print{body{padding:0;background:#fff}.toolbar{display:none}.report{width:100%}.report-header,.summary-card,.table-card{box-shadow:none;break-inside:avoid}.table-card{overflow:visible}.report-footer{margin-top:16px}a{color:inherit;text-decoration:none}}
</style></head><body><div class="report"><div class="toolbar"><button class="print-button" type="button" onclick="window.print()">Print / Save as PDF</button></div>
<header class="report-header"><div class="brand"><span class="brand-icon" aria-hidden="true">🍽</span><span>Jercyrendipity Meal Planner &amp; Weekly Scheduler</span></div><p class="eyebrow">Your kitchen report</p><h1>Shopping List Report</h1><p class="generated">Generated ${escapeHTML(generatedAt)}</p></header>
<section class="summary" aria-label="Shopping summary"><article class="summary-card"><span class="summary-label">Total meals planned</span><strong class="summary-value">${stats.totalMeals}</strong></article><article class="summary-card"><span class="summary-label">Total ingredients needed</span><strong class="summary-value">${stats.totalIngredients}</strong></article><article class="summary-card"><span class="summary-label">Distinct ingredients</span><strong class="summary-value">${stats.distinctIngredients}</strong></article><article class="summary-card"><span class="summary-label">Estimated grocery budget</span><strong class="summary-value money">${escapeHTML(formatMoney(stats.totalCost))}</strong></article><article class="summary-card"><span class="summary-label">Scheduled days</span><strong class="summary-value">${stats.scheduledDays}</strong></article></section>
<main class="table-card"><div class="table-title"><h2>Ingredients to buy</h2><span>${stats.totalIngredients} ingredient entries · ${stats.distinctIngredients} distinct items</span></div><table><thead><tr><th>Ingredient</th><th>Quantity to buy</th><th>Unit</th><th>Unit cost</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Grand Total Shopping Cost</td><td>${escapeHTML(formatMoney(stats.totalCost))}</td></tr></tfoot></table></main>
<p class="estimate-note">Prices are editable estimates.  <a href="${PRICE_SOURCE_URL}">Price reference</a>.</p><footer class="report-footer"><strong>Generated using Jercyrendipity Meal Planner &amp; Weekly Scheduler</strong><span>Jercyrendipity · ${escapeHTML(reportDate)}</span></footer></div></body></html>`;
        const blob = new Blob([report], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `jercyrendipity-shopping-list-${reportDate}.html`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("Your branded shopping report is ready.");
      }

      document.getElementById("printButton").addEventListener("click", () => window.print());
      document.getElementById("exportButton").addEventListener("click", downloadShoppingReport);
      document.getElementById("exportHistoryButton").addEventListener("click", downloadHistoryReport);

      try {
        if (localStorage.getItem(THEME_KEY) === "dark") {
          applyTheme(true);
        }
      } catch (error) { /* Theme preference is optional when storage is unavailable. */ }

      document.getElementById("databaseRetryButton").addEventListener("click", loadSharedState);
      window.addEventListener("online", () => { sharedSaveErrorShown = false; void saveSharedState(); });
      window.setInterval(refreshSharedState, 5000);
      window.setInterval(checkMealReminders, 15000);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) { void refreshSharedState(); checkMealReminders(); } });
      void loadSharedState();
    })();
