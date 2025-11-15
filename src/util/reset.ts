import { save, loadSave, newSave, getUniqueID } from "util/save";
import { saveAchievementMeta, loadAchievementMeta } from "util/achievementStorage";

/**
 * Fully reset the game: clear all localStorage and reload the page.
 * Always invoke this after user confirmation.
 */
export function resetGame() {
    // Persist current achievement sidecar first
    saveAchievementMeta();
    // Soft reset the run by loading a fresh save; achievements sidecar remains untouched
    // Create a new save slot but preserve the achievements sidecar
    const fresh = newSave();
    // Ensure active save points to the new ID
    save(fresh);
    // Reload layers with the fresh save (no reload needed)
    loadSave(fresh);
    // Reapply achievements from sidecar
    loadAchievementMeta();
}
