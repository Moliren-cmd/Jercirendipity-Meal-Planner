(() => {
      "use strict";

      const STORAGE_KEY = "kainMunaMealPlanner.v1";
      const THEME_KEY = "kainMunaTheme.v1";
      const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const CATEGORIES = ["all", "vegetable", "chicken", "pork", "fish", "egg", "mixed"];
      const CATEGORY_LABELS = { all: "All", vegetable: "Vegetable", chicken: "Chicken", pork: "Pork", fish: "Fish", egg: "Egg", mixed: "Mixed" };
      const CATEGORY_EMOJI = { vegetable: "🥬", chicken: "🍗", pork: "🥘", fish: "🐟", egg: "🍳", mixed: "🍲" };
      const MEAT_CATEGORIES = new Set(["chicken", "pork", "fish", "mixed"]);

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
      const freshState = () => ({ meals: starterMeals.map(meal => ({ ...meal })), schedule: blankSchedule(), shoppingChecked: {} });

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
          return { meals, schedule, shoppingChecked: parsed.shoppingChecked && typeof parsed.shoppingChecked === "object" ? parsed.shoppingChecked : {} };
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
        shoppingCount: document.getElementById("shoppingCount"), dialog: document.getElementById("addDishDialog"),
        addForm: document.getElementById("addDishForm"), toast: document.getElementById("toast"), toastMessage: document.getElementById("toastMessage")
      };

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
          return `<article class="day-card" data-day-card="${escapeHTML(day)}"><div class="day-head"><h3>${escapeHTML(day)}</h3><span class="day-count" aria-label="${entries.length} meals">${entries.length}</span></div>
            <div class="day-add-row"><select class="control" data-day-select="${escapeHTML(day)}" aria-label="Select a dish for ${escapeHTML(day)}">${dishOptions()}</select><button class="btn btn-primary btn-small" type="button" data-action="add-scheduled" data-day="${escapeHTML(day)}" ${state.meals.length ? "" : "disabled"}>＋ Add</button></div>
            <div class="day-meals">${meals || `<div class="day-empty">Meal Here</div>`}</div></article>`;
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
          const ingredientPreview = ingredients.length
            ? `<div class="ingredient-chips">${ingredients.map(ingredient => `<span class="ingredient-chip">${escapeHTML(ingredient)}</span>`).join("")}</div>`
            : `<span class="empty-recipe">No ingredients saved yet.</span>`;
          const procedurePreview = steps.length
            ? `<ol class="preview-steps">${steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>`
            : `<span class="empty-recipe">No procedure saved yet.</span>`;
          return `<article class="meal-card" data-meal-card="${escapeHTML(meal.id)}" data-category="${escapeHTML(meal.category)}">
            <div class="meal-card-head"><div style="display:flex;align-items:center;gap:11px;min-width:0"><span class="meal-emoji" aria-hidden="true">${CATEGORY_EMOJI[meal.category] || "🍲"}</span><div><h3>${escapeHTML(meal.name)}</h3><span class="category-tag">${escapeHTML(CATEGORY_LABELS[meal.category] || "Mixed")}</span></div></div><span class="recipe-meta">${ingredients.length} ${ingredients.length === 1 ? "ingredient" : "ingredients"}<br>${steps.length} ${steps.length === 1 ? "step" : "steps"}</span></div>
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
          </article>`;
        }).join("");
      }

      function collectShoppingItems() {
        const items = new Map();
        for (const day of DAYS) {
          for (const entry of state.schedule[day]) {
            const dish = getDish(entry.dishId);
            if (!dish) continue;
            for (const ingredient of ingredientLines(dish.ingredients)) {
              const key = ingredientKey(ingredient);
              const existing = items.get(key);
              items.set(key, { key, name: existing ? existing.name : ingredient, meals: (existing ? existing.meals : 0) + 1 });
            }
          }
        }
        return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
      }

      function renderShopping() {
        const items = collectShoppingItems();
        els.shoppingCount.textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;
        if (!items.length) {
          els.shopping.innerHTML = `<div class="empty-state" style="min-height:145px;padding:18px"><div><div class="empty-illustration" aria-hidden="true">🧺</div><h3>Your list will appear here.</h3></div></div>`;
          return;
        }
        els.shopping.innerHTML = items.map(item => `<label class="shopping-item"><input type="checkbox" data-action="check-shopping-item" data-ingredient="${escapeHTML(item.key)}" ${state.shoppingChecked[item.key] ? "checked" : ""}><span>${escapeHTML(item.name)}${item.meals > 1 ? ` <small style="color:var(--muted)">· ${item.meals} meals</small>` : ""}</span></label>`).join("");
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
        persist();
        renderAll();
        showToast(`Added to ${day}. Looking good!`);
      }

      function openAddDialog() {
        els.dialog.showModal();
        els.addForm.elements.name.focus();
      }

      function closeDialog() { els.dialog.close(); }

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
          persist();
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
        persist();
        els.addForm.reset();
        activeCategory = "all";
        els.search.value = "";
        renderAll();
        closeDialog();
        showToast(`${meal.name} added to your library.`);
      });

      document.getElementById("themeToggle").addEventListener("click", event => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
        event.currentTarget.setAttribute("aria-pressed", String(isDark));
        event.currentTarget.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        event.currentTarget.querySelector("span").textContent = isDark ? "Light mode" : "Dark mode";
        event.currentTarget.firstChild.textContent = isDark ? "☼ " : "◐ ";
      });

      document.getElementById("printButton").addEventListener("click", () => window.print());
      document.getElementById("exportButton").addEventListener("click", () => {
        const items = collectShoppingItems();
        const lines = ["Kain muna. — Weekly Shopping List", "", ...DAYS.flatMap(day => state.schedule[day].map(entry => getDish(entry.dishId)?.name).filter(Boolean).map(name => `${day}: ${name}`)), "", "Ingredients:", ...(items.length ? items.map(item => `${state.shoppingChecked[item.key] ? "[x]" : "[ ]"} ${item.name}`) : ["No ingredients yet — add meals to your weekly plan."]), ""];
        const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "kain-muna-shopping-list.txt";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        showToast("Your shopping list is ready to save.");
      });

      try {
        if (localStorage.getItem(THEME_KEY) === "dark") {
          document.body.classList.add("dark");
          const button = document.getElementById("themeToggle");
          button.setAttribute("aria-pressed", "true");
          button.setAttribute("aria-label", "Switch to light mode");
          button.querySelector("span").textContent = "Light mode";
          button.firstChild.textContent = "☼ ";
        }
      } catch (error) { /* Theme preference is optional when storage is unavailable. */ }

      renderAll();
    })();
