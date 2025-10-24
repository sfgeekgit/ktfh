# Game - Developer Notes

## Overview

This is an incremental/idle game built with the Profectus framework.
The purpose of this document is to :
-- Record changes from the default Profectus framework
-- A quickstart of the most important, highest level arch of the code.
-- Maybe things that are NOT obvious, but touch a lot of parts of the code and future developers might not notice otherwise.


Most of the code is self documenting.
Well written, easily understandable code changes should NOT be added to this document.
This document is NOT about gameplay, see the game design doc and other docs for that.


## Project Structure

### Key Files Created/Modified

```
/home/pizza/game/
├── src/
│   ├── data/
│   │   ├── layers/
│   │   │   ├── main.tsx          # Main game layer (all game logic)
│   │   │   ├── chapter1.tsx      # Chapter 1 story (game starts here)
│   │   │   ├── chapter2.tsx+     # Additional chapter stories
│   │   ├── jobTypes.ts           # Job definitions with chapter availability
│   │   ├── gameConfig.ts         # Game balance configuration
│   │   ├── projInfo.json         # Game metadata (MODIFIED)
│   │   ├── layers.tsx            # Layer registry (MODIFIED)
│   │   └── projEntry.tsx         # Entry point (HEAVILY MODIFIED)
│   ├── components/
│   │   ├── Nav.vue               # Sidebar navigation (DISABLED)
│   │   ├── Game.vue              # Main game component (MODIFIED)
│   │   └── Options.vue           # Settings modal (INTEGRATED)
│   └── App.vue                   # Root app component (MODIFIED)
├── GAMEPLAY.md                   # User-facing gameplay description
└── DEVELOPER_NOTES.md            # This file
```

---

## Framework Modifications

### 1. Mobile Responsive Layout
**Files Modified:** `src/game/layers.tsx`, `Game.vue`, `Layer.vue`, `main.css`

**Key Change:**
- Modified framework default `minWidth` from **600px to 100px** in `layers.tsx` (line 294)
- This allows layers to shrink properly on mobile devices (360-414px screens)
- Added responsive CSS with `max-width: 800px` container centered on desktop
- Added `box-sizing: border-box` globally to prevent overflow
- Reduced padding/margins with mobile breakpoints at 768px

**Why:** Default 600px minimum forced horizontal scrolling on phones. 100px allows proper mobile rendering while maintaining desktop layout.

---

### 2. Removed Sidebar Navigation
**Files Modified:** `App.vue`, `Game.vue`

**Changes:**
- Commented out/removed `import Nav from "./components/Nav.vue"`
- Removed `<Nav />` component usage in both files


---

### 2. projEntry.tsx - Simplified Entry Point
**File:** `src/data/projEntry.tsx`

**Changes Made:**
1. Removed the entire demo `main` layer definition
2. Removed all references to `prestige` layer
3. Changed `createLayerTreeNode` to `createTreeNode` (API change)
4. Removed tree reset logic
5. Game starts with chapter1 (story intro), then main (gameplay)

```typescript
import main from "./layers/main";
import chapter1 from "./layers/chapter1";

export const getInitialLayers = (player: Partial<Player>): Array<Layer> =>
    [chapter1, main, chapter2, chapter3, chapter4];
```

---

### 3. Profectus Version Compatibility Notes

**Version:** Latest from GitHub (commit `d69197d`)

**API Differences from Documentation:**
- No `buyables` or `upgrades` as separate feature folders
- Buyables are now called **Repeatables** (`features/clickables/repeatable.tsx`)
- Upgrades exist in `features/clickables/upgrade.tsx`
- Tree nodes use `createTreeNode` not `createLayerTreeNode`

**Why We Used Clickables Instead:**
- Repeatables have complex currency/requirement API that was causing errors
- Clickables are simpler, more flexible, and work reliably
- Gives us full control over cost calculations and purchase logic

---

## Game Configuration (gameConfig.ts)

All game balance settings are centralized in `src/data/gameConfig.ts` for easy tuning:

```typescript
export const G_CONF = {
       // set game vars here...
} as const;
```

Import with: `import { G_CONF } from "./gameConfig";`

---

## Chapter System

### Progression
- **currentChapter** persistent state tracks progress (starts at 1)
- Game starts with chapter1 story, then switches to main gameplay
- Single watcher monitors trigger conditions and auto-advances chapters
- All chapter triggers in one switch statement inside the watcher
- Chapter transitions clear job queue and increment currentChapter

### Job Chapter Filtering
- Jobs support `chapter: number` or `chapter: number[]` (e.g., `chapter: [1, 2]`)
- `generateJob()` filters by current chapter
- Unlock buttons check `isJobInCurrentChapter()`
- Returns null if no jobs available (graceful, not error)

---

## Game Implementation (main.tsx)

### Architecture Overview

The main layer implements:
- **Resources:** Money (tracked with Decimal for big numbers), GPUs (compute resources)
- **Clickables:** Shop items (buy GPUs, unlock job types)
- **Refs:** Game state (jobs, GPUs owned, unlocked job types)
- **Update Loop:** GlobalBus event for timers, job completion, and job generation
- **Job System:** 

### Key Components




#### Persistent State (Must be in return statement!)
```typescript
const unlockedJobTypes = persistent<string[]>(G_CONF.STARTING_PIZZAS);
const gpusOwned = persistent<number>(G_CONF.STARTING_GPUS);
const currentChapter = persistent<number>(1);
const jobQueue = persistent([]);
const activeDeliveries = persistent([]);
const nextJobId = persistent<number>(0);
const timeSinceLastJob = persistent<number>(0);
const chapter1BonusApplied = persistent<boolean>(false);
const qualityBonus = persistent<number>(0);
const speedBonus = persistent<number>(0);
```

**CRITICAL:** All persistent refs must be included in the layer's return statement or you'll get persistence errors!

**Note on GPU System:** GPUs are a fungible resource (just a count). Jobs require a specified amount of compute to run. Available GPUs = total GPUs - GPUs currently in use by active jobs.

#### 3. Game Loop
```typescript
globalBus.on("update", diff => {
    // Update active jobs (countdown timers)
    // Complete jobs and pay out money
    // Free up GPUs when jobs complete
    // Generate new jobs every X seconds if <= AUTO_JOB_LIMIT
    // Spawn initial jobs on first load
});
```

The `diff` parameter is time in seconds since last update. Job generation uses `timeSinceLastJob` to track intervals.

#### 4. Shop System (Clickables)

All shop items use the clickable API:
```typescript
const itemClickable = createClickable(() => ({
    display: {
        title: "Item Name",
        description: () => `Dynamic text here`  // Use function for reactive values
    },
    canClick: () => Decimal.gte(money.value, cost),  // Enable/disable logic
    onClick() {
        money.value = Decimal.sub(money.value, cost);
        // Apply purchase effect
    },
    visibility: () => someCondition,  // Optional: hide when not relevant
    style: { /* CSS */ }
}));
```



#### 6. Job System

**Job Generation:**
- Filters by unlocked job types in current chapter
- Returns null if no jobs available (graceful, shows warning to player)
- Random duration and payout from jobTypes.ts definition
- Modified by chapter bonuses (quality/speed choices)

**Job Acceptance:**
- Requires: enough available GPUs + unlocked job type
- Moves job from queue to active jobs
- Reserves compute (GPUs) for the duration of the job

**Job Completion:**
- Timer counts down in update loop
- Money added when timer reaches 0
- GPUs automatically freed (no manual tracking needed)

---

## Game Balance


Values are configured in `gameConfig.ts` (G_CONF object)

### Job Generation

- Only generates if ≤ 4 jobs in queue (AUTO_JOB_LIMIT)


---

## Critical Bugs Solved (Historical - from driver-based system)

**Note:** The game previously used a driver-based system with unique driver objects. This was replaced with a simpler GPU-based system. The bugs below are kept for historical reference.

### 1. Array Mutation Not Triggering Reactivity

**Symptom:** When hiring a driver with `drivers.value.push(newDriver)`, the UI wouldn't update properly.

**Root Cause:** Vue 3 reactivity on arrays works better with reassignment than mutation for persistent refs in Profectus.

**Solution:** Use array spreading to create new array:
```typescript
// BAD - direct mutation
drivers.value.push(newDriver);

// GOOD - array reassignment
drivers.value = [...drivers.value, newDriver];
```

---

## Common Issues & Solutions

### 1. "Persistent ref not registered" Error
**Solution:** Add the ref to the layer's return statement.

### 2. Import Errors (module not found)
**Check:** This Profectus version's API. Use `ls -la src/features/` to see what exists.
- Use `createTreeNode` not `createLayerTreeNode`
- Import from `features/clickables/repeatable` not `features/buyables/buyable`

### 3. Currency Duplication Warning
**Solution:** Wrap shared resources with `noPersist()`:
```typescript
currency: noPersist(money)
```

### 4. Blank Page / No Game Visible
**Causes:**
- `projEntry.tsx` creating its own main layer (remove it!)
- Other layers (like prestige) in layers folder (delete them)
- `layers.tsx` not importing your main layer correctly


---

## Vue Reactivity Patterns in Profectus

### General Guidelines

1. **Array Updates:** Use reassignment, not mutation
   ```typescript
   // BAD
   myArray.value.push(item);
   myArray.value[0].field = newValue;

   // GOOD
   myArray.value = [...myArray.value, item];
   myArray.value = myArray.value.map((item, i) =>
       i === 0 ? { ...item, field: newValue } : item
   );
   ```

2. **Persistent Ref Increments:** Use explicit assignment
   ```typescript
   // BAD - doesn't always trigger persistence
   counter.value++;

   // GOOD - always persists
   counter.value = counter.value + 1;
   ```

3. **Initialization Timing:** Use watch() with immediate: true for refs that depend on persistence
   ```typescript
   // BAD - runs before persistence loads
   if (someState.value === defaultValue) {
       someState.value = initializeValue();
   }

   // GOOD - runs after persistence loads
   watch(someRef, () => {
       if (!initialized.value) {
           someState.value = initializeValue();
           initialized.value = true;
       }
   }, { immediate: true });
   ```

4. **Computed Properties:** Use computed for derived values
   ```typescript
   // Calculate available GPUs from active jobs
   const availableGPUs = computed(() => {
       const gpusInUse = activeDeliveries.value.reduce((sum, delivery) => {
           const jobType = getJobType(delivery.jobTypeId);
           const computeCost = jobType?.cost?.find(c => c.type === "compute")?.value || 0;
           return sum + computeCost;
       }, 0);
       return gpusOwned.value - gpusInUse;
   });
   ```

---

## Extending the Game


### Adding New Features

**Example: Automation**
```typescript
const autoAcceptClickable = createClickable(() => ({
    display: {
        title: "Auto-Accept Cheese Jobs",
        description: "Cost: $5000"
    },
    canClick: () => Decimal.gte(money.value, 5000),
    onClick() {
        money.value = Decimal.sub(money.value, 5000);
        autoAcceptCheese.value = true;
    }
}));

// In update loop:
if (autoAcceptCheese.value) {
    const cheeseJobs = jobQueue.value.filter(j => j.jobTypeId === "cheese");
    if (cheeseJobs.length > 0 && canAcceptJob(cheeseJobs[0])) {
        acceptJob(cheeseJobs[0]);
    }
}
```

**Remember:** Add new refs to the return statement!


---

## Development Tips

### Hot Reload
The dev server (`npm run dev -- --host`) supports hot reload. Changes to `.tsx` files update instantly in browser.

### Console Debugging
All game state is reactive. In browser console:
```javascript
// Access layer state
player.layers.main.money
player.layers.main.totalDrivers

// Modify for testing
player.layers.main.money.value = 999999
```

### Save System
Profectus auto-saves to localStorage every few seconds. Saves persist across refreshes.

To reset: Settings gear icon (bottom-left) → Hard Reset

### Claude Code (.claudeignore)
Minimal ignore list to reduce AI assistant costs. Only ignores `node_modules/`, `dist/`, `.vite/`, and `CHANGELOG.md`. Keeps all framework features (bars, particles, achievements, etc.) accessible so Claude Code can discover and use them.

### TypeScript Errors
If you see TS errors but game works, it's usually safe to ignore during prototyping. Run `npm run build` before production to catch real issues.


---

## Questions or Issues?

### Check These First
1. Browser console for errors
2. `projEntry.tsx` - is only our main layer loaded?
3. Return statement in `main.tsx` - are all refs included?
4. Profectus version - check `git log` and API docs

### Useful Commands
```bash
# Check what's in features folder
ls -la src/features/


# Clean rebuild
rm -rf node_modules dist .vite
npm install
npm run dev
```

---

## Credits
- Framework: Profectus (https://github.com/profectus-engine/Profectus)
- Game Design: sfgeekgit
- Built: October 2025

---

## Quick Reference

### Key Files
- `gameConfig.ts` - Game balance values (G_CONF object)
- `jobTypes.ts` - Job definitions with chapter availability
- `main.tsx` - Core game logic, chapter system, GPU system, job system
- `chapter1.tsx` through `chapter4.tsx` - Story layers
- `Options.vue` - Settings modal (gear icon bottom-left)

### Important Patterns
- Array updates: Use `array.value = [...array.value, newItem]`
- Counter increments: Use `counter.value = counter.value + 1`
- GPU availability: Computed from gpusOwned - sum of compute costs of active jobs
- Initialization: Use `watch()` with `{ immediate: true }` after persistence loads

### Common Gotchas
- Array mutation not updating → Use reassignment instead
- Refs not persisting → Must be in layer return statement
- GPU tracking → Use computed property that sums active job compute costs
