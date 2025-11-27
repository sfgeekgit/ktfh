import { STORAGE_KEY } from "util/achievementStorage";
import player from "game/player";
import { resettingSave } from "util/save";

/**
 * Fully reset the game: delete all localStorage EXCEPT the achievement sidecar.
 *
 * FUTURE-PROOFING:
 * - Any data added to the sidecar (totalPlaythroughs, wins, losses, etc.) is automatically preserved.
 * - However, you must ensure that data gets LOADED after reset. See achievements.tsx line ~205
 *   for the pattern: use setTimeout to load sidecar data after main save loads.
 * - To add new sidecar data: (1) add to sidecar storage, (2) create/extend a load function,
 *   (3) call it with setTimeout in the appropriate layer constructor.
 *
 * Always invoke this after user confirmation.
 */
export async function resetGame() {
    resettingSave.value = true;
    player.autosave = false;

    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);

    // Delete everything EXCEPT the achievement sidecar (STORAGE_KEY from achievementStorage.ts)
    allKeys.forEach(key => {
        if (key !== STORAGE_KEY) {
            localStorage.removeItem(key);
        }
    });

    // Reload - game creates fresh save, achievement layer loads sidecar after 100ms delay
    window.location.reload();
}
