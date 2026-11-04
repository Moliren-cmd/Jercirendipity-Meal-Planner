<?php
declare(strict_types=1);

require __DIR__ . '/api/config.php';
require __DIR__ . '/api/session.php';
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

if (!empty($_SESSION['meal_planner_member_id'])) {
    $_SESSION = [];
    session_regenerate_id(true);
}

if (empty($_SESSION['meal_planner_authenticated'])) {
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#edf0e4">
  <title>Unlock · Jercyrendipity Meal Planner</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="pin-page">
  <main class="pin-card">
    <a class="pin-brand" href="./" aria-label="Jercyrendipity Meal Planner">
      <span class="brand-mark" aria-hidden="true">🍽</span>
      <span>Jercyrendipity Meal Planner</span>
    </a>
    <div class="pin-icon" aria-hidden="true">⌑</div>
    <h1>Welcome back</h1>
    <p>Enter your PIN to open the meal planner.</p>
    <form id="pinForm" class="pin-form">
      <label for="websitePin">PIN</label>
      <input id="websitePin" name="pin" type="password" inputmode="text" autocomplete="current-password" required autofocus>
      <p id="pinError" class="pin-error" role="alert" aria-live="polite"></p>
      <button class="btn btn-primary" type="submit">Unlock planner</button>
    </form>
  </main>
  <script src="auth.js" defer></script>
</body>
</html>
<?php
    exit;
}

$csrfToken = (string)($_SESSION['meal_planner_csrf'] ?? '');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#edf0e4">
  <meta name="csrf-token" content="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">

  <meta name="description" content="Plan affordable Filipino student meals, save recipes, and build a weekly shopping list.">
  <title>Jercyrendipity Meal Planner &amp; Weekly Scheduler</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <div class="nav-shell">
      <a class="brand" href="#top" aria-label="Jercyrendipity Meal Planner home">
        <span class="brand-mark" aria-hidden="true">🍽</span>
        <span class="brand-name">Jercyrendipity Meal Planner</span>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        <a href="#scheduler">Week</a>
        <button class="nav-link-button" type="button" data-masterlist-toggle aria-expanded="false">View masterlist</button>
        <button class="nav-link-button" type="button" data-history-toggle aria-expanded="false">View history</button>
        <a href="#shopping-list">Shopping list</a>
      </nav>
      <div class="nav-actions">

        <button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false" aria-label="Switch to dark mode">◐ <span>Dark mode</span></button>
        <button class="logout-button" id="logoutButton" type="button">Lock</button>
        <button class="menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="mobileDrawer" aria-label="Open navigation menu"><span aria-hidden="true">☰</span></button>
      </div>
    </div>
  </header>
  <div class="drawer-backdrop" id="drawerBackdrop" hidden></div>
  <aside class="mobile-drawer" id="mobileDrawer" aria-label="Mobile navigation" aria-hidden="true">
    <div class="drawer-head"><span>Navigate</span><button class="mini-icon-btn" id="closeMenu" type="button" aria-label="Close navigation menu">✕</button></div>
    <nav class="drawer-links">
      <a href="#scheduler">Weekly meal plan <span aria-hidden="true">↗</span></a>
      <button class="drawer-masterlist-toggle" type="button" data-masterlist-toggle aria-expanded="false">View masterlist <span aria-hidden="true">↗</span></button>
      <button class="drawer-masterlist-toggle" type="button" data-history-toggle aria-expanded="false">View history <span aria-hidden="true">↗</span></button>
      <a href="#shopping-list">Shopping list <span aria-hidden="true">↗</span></a>
    </nav>
    <button class="theme-toggle drawer-theme" id="mobileThemeToggle" type="button" aria-pressed="false" aria-label="Switch to dark mode">◐ <span>Dark mode</span></button>
    <button class="logout-button drawer-logout" id="mobileLogoutButton" type="button">Lock website</button>
  </aside>

  <div class="database-gate" id="databaseGate" role="status" aria-live="polite">
    <section class="database-gate-card">
      <span class="database-spinner" aria-hidden="true"></span>
      <h2 id="databaseGateTitle">Connecting to shared meal plan</h2>
      <p id="databaseGateMessage">Loading recipes and your weekly plan from MySQL…</p>
      <button class="btn btn-primary" id="databaseRetryButton" type="button" hidden>Try again</button>
    </section>
  </div>

  <main id="top">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <h1 id="page-title">Jercyrendipity<br><em>Meal Planner</em></h1>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#scheduler">Plan this week <span aria-hidden="true">→</span></a>
          <button class="btn btn-secondary" type="button" data-masterlist-toggle aria-expanded="false">View masterlist</button>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="food-orbit"><div class="food-bowl">🍲</div></div>
      </div>
    </section>

    <section class="section" id="dashboard" aria-labelledby="dashboard-title">
      <div class="section-heading">
        <div>
          <div class="section-kicker">Weekly summary</div>
          <h2 id="dashboard-title">Weekly overview</h2>
        </div>
      </div>
      <div class="dashboard-grid" id="dashboardGrid" aria-live="polite"></div>
    </section>

    <section class="section" id="scheduler" aria-labelledby="scheduler-title">
      <div class="section-heading">
        <div>
        <div class="section-kicker">Weekly plan</div>
          <h2 id="scheduler-title">Weekly Meal Plan Scheduler</h2>
        </div>
        <div class="heading-action scheduler-heading-actions">
          <div class="week-switcher" aria-label="Choose planning week">
            <button class="mini-icon-btn" id="previousWeekButton" type="button" data-week-step="-1" aria-label="Previous week">‹</button>
            <span id="activeWeekLabel" class="active-week-label" aria-live="polite"></span>
            <button class="mini-icon-btn" id="nextWeekButton" type="button" data-week-step="1" aria-label="Next week">›</button>
          </div>
          <button class="btn btn-secondary" id="printButton" type="button">⌑ <span>Print meal plan</span></button>
        </div>
      </div>
      <details class="prep-panel" id="prepChecklistPanel">
        <summary><span><strong>Weekly prep checklist</strong><small></small></span><span class="prep-count" id="prepCount">0 tasks</span></summary>
        <div class="prep-content" id="prepChecklist"></div>
      </details>
      <details class="planning-tools-panel">
        <summary><span><strong>Planning tools</strong><small></small></span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
        <div class="planning-tools-content">
          <section class="planning-tool-block"><div class="tool-block-heading"><h3>Busy days</h3><p></p></div><div class="busy-day-grid" id="busyDayControls"></div><div class="quick-meal-suggestions" id="quickMealSuggestions"></div></section>
          <section class="planning-tool-block"><div class="tool-block-heading"><h3>Saved plan templates</h3><p>Save a week as a reusable starting point.</p></div><form id="templateForm" class="inline-tool-form"><input class="control" name="name" type="text" maxlength="50" placeholder="e.g. Exam week" required><button class="btn btn-secondary" type="submit">Save this week</button></form><div class="saved-templates" id="savedTemplates"></div></section>
          <section class="planning-tool-block backup-tools"><div class="tool-block-heading"><h3>Plan backup</h3><p></p></div><div class="inline-tool-actions"><button class="btn btn-secondary" id="exportBackupButton" type="button">↓ Download backup</button><button class="btn btn-secondary" id="importBackupButton" type="button">↑ Restore backup</button><input id="backupFileInput" type="file" accept="application/json,.json" hidden></div></section>
        </div>
      </details>
      <div class="scheduler-panel"><div class="week-grid" id="weekGrid"></div></div>
    </section>

    <section class="section" id="meal-history" aria-labelledby="history-title" hidden>
      <div class="section-heading">
        <div>
          <div class="section-kicker">Milestones</div>
          <h2 id="history-title">Meal Plan History</h2>
          <p>Saved weeks are grouped by month.</p>
        </div>
        <div class="heading-action history-actions"><button class="btn btn-secondary" type="button" data-history-toggle aria-expanded="false">Hide history</button><button class="btn btn-secondary" id="exportHistoryButton" type="button">↓ Export history</button></div>
      </div>
      <div class="history-list" id="historyList" aria-live="polite"></div>
    </section>

    <section class="section" id="meal-library" aria-labelledby="library-title" hidden>
      <div class="section-heading">
        <div>
          <div class="section-kicker">Recipe library</div>
          <h2 id="library-title">Master Meal Library</h2>
        </div>
        <div class="heading-action"><button class="btn btn-secondary" id="hideMasterlistButton" type="button">Hide masterlist</button><button class="btn btn-primary" id="openAddDialog" type="button"><span aria-hidden="true">＋</span> Add a dish</button></div>
      </div>
      <div class="library-tools">
        <label class="search-wrap">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Search dishes</span>
          <input class="control" type="search" id="searchDish" placeholder="Search dishes…" autocomplete="off">
        </label>
        <div class="filter-row" id="categoryFilters" role="group" aria-label="Filter meals by category"></div>
        <label class="filter-select-label">Diet fit
          <select class="control" id="dietFilter" aria-label="Filter by diet">
            <option value="">Any diet</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="pescatarian">Pescatarian</option><option value="gluten-free">Gluten-free</option><option value="dairy-free">Dairy-free</option><option value="halal">Halal</option>
          </select>
        </label>
        <label class="filter-select-label">Avoid allergen
          <select class="control" id="allergenFilter" aria-label="Hide meals containing an allergen">
            <option value="">No allergy filter</option><option value="egg">Egg</option><option value="fish">Fish</option><option value="shellfish">Shellfish</option><option value="soy">Soy</option><option value="wheat">Wheat / gluten</option><option value="dairy">Dairy</option><option value="peanut">Peanut</option>
          </select>
        </label>
        <label class="favorite-filter"><input type="checkbox" id="favoritesOnly"> Favorites only</label>
      </div>
      <p class="allergen-note">Diet and allergen labels are editable recipe notes. Check packaged ingredient labels when cooking for allergies.</p>
      <div class="meal-grid" id="mealGrid" aria-live="polite"></div>
    </section>

    <section class="section" id="shopping-list" aria-labelledby="shopping-title">
      <div class="section-heading">
        <div>
          <div class="section-kicker">Shopping</div>
          <h2 id="shopping-title">Shopping List</h2>
        </div>
      </div>
      <div class="shopping-summary" id="shoppingSummary" aria-live="polite"></div>
      <div class="shopping-insights" id="shoppingInsights"></div>
      <div class="shopping-panel budget-panel">
        <div><div class="section-kicker">Spend with a plan</div><h3>Weekly budget</h3><p>Set a spending limit and see lower-cost meal swaps here.</p></div>
        <label class="budget-input-label">Budget limit<input class="control" type="number" min="0" step="50" id="budgetLimitInput" placeholder="No limit set" aria-label="Weekly grocery budget limit in pesos"></label>
        <div class="budget-status" id="budgetStatus" aria-live="polite"></div>
      </div>
      <div class="shopping-panel">
        <div class="shopping-list-wrap">
          <div class="shopping-list-head">
            <h3>Your ingredients</h3>
            <span class="shopping-count" id="shoppingCount">0 items</span>
          </div>
          <div class="shopping-table-head" aria-hidden="true"><span>Ingredient</span><span>To buy</span><span>Unit</span><span>Unit cost</span><span>Subtotal</span></div>
          <div class="shopping-items" id="shoppingItems" aria-live="polite"></div>
          <div class="shopping-grand-total"><span>Grand Total Shopping Cost</span><strong id="shoppingGrandTotal">₱0.00</strong></div>
        </div>
        <aside class="shopping-aside">
          <div class="aside-icon" aria-hidden="true">🧺</div>
          <h3>Shopping report</h3>
          <p></p>
          <button class="btn btn-primary" id="exportButton" type="button">↓ Download report</button>
          <p class="price-source">Pantry estimates are editable. <a href="https://www.da.gov.ph/price-monitoring/" target="_blank" rel="noreferrer">View DA price monitoring</a>.</p>
        </aside>
      </div>
      <details class="pantry-panel">
        <summary><span><strong>Pantry inventory</strong><small></small></span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
        <div class="pantry-content">
          <form id="pantryForm" class="pantry-form">
            <label>Ingredient<input class="control" type="text" name="name" maxlength="80" placeholder="e.g. Garlic" required></label>
            <label>Amount<input class="control" type="number" name="quantity" min="0.01" step="0.01" placeholder="1" required></label>
            <label>Unit<select class="control" name="unit"><option>pcs</option><option>kg</option><option>g</option><option>L</option><option>ml</option><option>pack</option><option>can</option><option>bunch</option><option>cloves</option><option>tbsp</option><option>cup</option><option>item</option></select></label>
            <label>Best before<input class="control" type="date" name="expiresOn"></label>
            <label>Restock below<input class="control" type="number" min="0" step="0.01" name="minQuantity" placeholder="Optional"></label>
            <button class="btn btn-primary" type="submit">＋ Add to pantry</button>
          </form>
          <div class="pantry-items" id="pantryItems"></div>
          <p class="pantry-note"></p>
        </div>
      </details>
      <section class="use-soon-panel" aria-labelledby="useSoonTitle"><div class="tool-block-heading"><div><div class="section-kicker">Waste less</div><h3 id="useSoonTitle">Use what’s on hand</h3></div><span class="smart-icon" aria-hidden="true">✦</span></div><div id="useSoonSuggestions"></div></section>
      <details class="leftovers-panel">
        <summary><span><strong>Leftover tracker</strong><small>Plan portions you have already cooked.</small></span><span class="leftover-count" id="leftoverCount">0 saved</span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
        <div class="leftovers-content"><form id="leftoverForm" class="leftover-form"><label>Leftover<input class="control" name="name" maxlength="70" placeholder="e.g. Monggo from lunch" required></label><label>Amount<input class="control" name="quantity" type="number" min="0.01" step="0.01" value="1" required></label><label>Unit<select class="control" name="unit"><option>serving</option><option>pcs</option><option>cup</option><option>pack</option><option>portion</option></select></label><label>Use by<input class="control" name="expiresOn" type="date"></label><button class="btn btn-primary" type="submit">＋ Save leftover</button></form><div class="leftover-items" id="leftoverItems"></div></div>
      </details>
      <details class="aisle-settings-panel"><summary><span><strong>Customize grocery aisles</strong><small>Supermarket aisle name</small></span><span class="accordion-chevron" aria-hidden="true">⌄</span></summary><div class="aisle-settings-content"><form id="aisleForm" class="inline-tool-form"><input class="control" type="text" name="name" maxlength="32" placeholder="Add an aisle name" required><button class="btn btn-secondary" type="submit">Add aisle</button></form><div class="custom-aisle-tags" id="customAisleTags"></div></div></details>
    </section>

    <footer>
      <span class="footer-brand">Jercyrendipity</span>
      <span>Jercyrendipity Meal Planner</span>
      <span>Recipes can be edited.</span>
    </footer>
  </main>

  <dialog id="addDishDialog" aria-labelledby="dialogTitle">
    <div class="dialog-content">
      <div class="dialog-head">
        <div><h2 id="dialogTitle">Add a dish</h2><p>Enter the ingredients and procedure.</p></div>
        <button class="mini-icon-btn" type="button" id="closeDialog" aria-label="Close dialog">✕</button>
      </div>
      <form class="dialog-form" id="addDishForm">
        <details class="recipe-import-panel"><summary><strong>Paste a recipe to fill these fields</strong><span class="accordion-chevron" aria-hidden="true">⌄</span></summary><div><textarea class="recipe-textarea recipe-import-text" id="recipeImportText" placeholder="Adobong Sitaw&#10;&#10;Ingredients&#10;1 bunch sitaw&#10;2 cloves garlic&#10;&#10;Procedure&#10;Saute garlic…"></textarea><button class="btn btn-secondary" id="parseRecipeButton" type="button">✦ Fill recipe fields</button></div></details>
        <label class="plain-label">Dish name
          <input class="control" name="name" type="text" maxlength="70" placeholder="e.g. Ginisang Togue" required>
        </label>
        <label class="plain-label">Category
          <select class="control" name="category" required>
            <option value="vegetable">Vegetable</option><option value="chicken">Chicken</option><option value="pork">Pork</option><option value="fish">Fish</option><option value="egg">Egg</option><option value="mixed">Mixed</option>
          </select>
        </label>
        <label class="plain-label">Base servings
          <input class="control" name="servings" type="number" min="1" max="24" value="2" required>
        </label>
        <label class="plain-label">Prep time (minutes)
          <input class="control" name="prepMinutes" type="number" min="0" max="1440" value="15">
        </label>
        <label class="plain-label">Cooking time (minutes)
          <input class="control" name="cookMinutes" type="number" min="0" max="1440" value="25">
        </label>
        <label class="plain-label">Diet tags <span style="font-weight:450;color:var(--muted)">Comma separated; only choose tags you have checked</span>
          <input class="control" name="dietTags" type="text" placeholder="vegetarian, gluten-free">
        </label>
        <label class="plain-label">Allergens <span style="font-weight:450;color:var(--muted)">Comma separated; check sauces and packaged ingredients</span>
          <input class="control" name="allergens" type="text" placeholder="egg, soy, fish">
        </label>
        <label class="plain-label">Ingredients <span style="font-weight:450;color:var(--muted)">One ingredient per line</span>
          <textarea class="recipe-textarea" name="ingredients" placeholder="Togue / mung bean sprouts&#10;Garlic&#10;Onion&#10;Soy sauce" required></textarea>
        </label>
        <label class="plain-label">Procedure <span style="font-weight:450;color:var(--muted)">One step per line</span>
          <textarea class="recipe-textarea" name="procedure" placeholder="Saute garlic and onion.&#10;Add the main ingredients and season.&#10;Cook until tender and serve with rice." required></textarea>
        </label>
        <label class="plain-label">Substitution ideas <span style="font-weight:450;color:var(--muted)">One ingredient swap per line</span>
          <textarea class="recipe-textarea recipe-textarea-short" name="substitutions" placeholder="Pork → tofu&#10;Sitaw → green beans"></textarea>
        </label>
        <div class="dialog-actions"><button class="btn btn-secondary" type="button" id="cancelDialog">Cancel</button><button class="btn btn-primary" type="submit">Save dish</button></div>
      </form>
    </div>
  </dialog>
  <dialog id="cookModeDialog" class="cook-mode-dialog" aria-labelledby="cookModeTitle"><div class="cook-mode-shell"><div class="cook-mode-top"><button class="mini-icon-btn" id="cookModeClose" type="button" aria-label="Close cooking mode">×</button><span class="section-kicker">Cooking mode</span><button class="cook-mode-screen-button" id="keepScreenButton" type="button">Keep screen on</button></div><div class="cook-progress"><span id="cookProgressText">Step 1 of 1</span><div><span id="cookProgressBar"></span></div></div><h2 id="cookModeTitle"></h2><p class="cook-step-copy" id="cookStepCopy"></p><div class="cook-mode-timer" id="cookModeTimer"></div><div class="cook-mode-actions"><button class="btn btn-secondary" id="cookModePreviousButton" type="button">← Previous</button><button class="btn btn-primary" id="cookModeNextButton" type="button">Next step →</button></div></div></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"><span class="toast-symbol" aria-hidden="true">✿</span><span id="toastMessage"></span></div>

  <script src="script.js" defer></script>
</body>
</html>

