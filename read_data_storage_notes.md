# Data Storage Notes

## 1. Persistence Mechanism: localStorage

**Location:** `/home/ktfh/src/util/save.ts`

- Uses localStorage with LZ-String compression
- Save data is JSON stringified, compressed, and stored with keys like `pizza-delivery-0`
- Settings stored separately under key `pizza-delivery`

## 2. When Saving Happens

### Automatic Saves

Two automatic triggers (`/home/ktfh/src/util/save.ts:175-184`):

1. **Every 1 second** - Autosave interval:
```typescript
setInterval(() => {
    if (player.autosave) {
        save();
    }
}, 1000);
```

2. **On page unload** - Before browser closes/refreshes:
```typescript
window.onbeforeunload = () => {
    if (player.autosave) {
        save();
    }
};
```

### Forced Saves at Critical Events

**Bug Fixed (2025-10-27):** The 1-second autosave interval created a window where refreshing immediately after critical events could cause data loss. Players would lose progress or get soft-locked if they refreshed within 1 second of:
- Advancing to a new chapter
- Unlocking a job
- Completing an onetime job

**Solution:** Added explicit `save()` calls immediately after critical state changes.

#### Locations of Forced Saves:

1. **`/home/ktfh/src/data/layers/main.tsx`**
   - Line 260: After chapter advancement (`player.tabs = [...]`)
   - Line 520: After job unlock (`unlockedJobTypes.value.push(jobType.id)`)
   - Line 572: After onetime job completion (`completedOnetimeJobs.value.push(...)`)

2. **Chapter files** (`chapter1.tsx`, `chapter2.tsx`, `chapter3.tsx`, `chapter4.tsx`, `chapter5.tsx`)
   - After story choice in `makeChoice()` function
   - After chapter completion in `completeChapter()` function

**Result:** Eliminates the 1-second window where progress could be lost, preventing both chapter reset bugs and onetime job soft-locks.

## 3. Load Process

**Location:** `/home/ktfh/src/util/save.ts:39-64` and `/home/ktfh/src/util/save.ts:111-146`

- On app startup, `load()` is called
- Retrieves compressed data from localStorage
- Decompresses and JSON parses the save data
- Calls `loadSave(player)` which merges saved data with defaults
- Watchers with `{ immediate: true }` may fire during this process

**Important:** Watchers that modify critical state (like chapter advancement) fire during load. The forced save calls prevent issues where watchers might incorrectly overwrite loaded state.
