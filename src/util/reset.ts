import projInfo from "data/projInfo.json";
import player from "game/player";
import { save, loadSave, newSave, getUniqueID } from "util/save";
import { saveAchievementMeta, loadAchievementMeta } from "util/achievementStorage";

/**
 * Fully reset the game: clear all localStorage and reload the page.
 * Always invoke this after user confirmation.
 */
export async function resetGame() {
    // Persist current achievement sidecar first
    saveAchievementMeta();
    // Soft reset the run by loading a fresh save; achievements sidecar remains untouched
    // Create a new save slot but preserve the achievements sidecar
    const fresh = newSave();
    // Ensure active save points to the new ID
    save(fresh);
    // Reload layers with the fresh save (no reload needed)
    await loadSave(fresh);
    // Reapply achievements from sidecar
    loadAchievementMeta();
    // Make sure UI starts on the initial tabs
    player.tabs = [...projInfo.initialTabs];
    // Force a full reload so all reactive state is reinitialized
    window.location.reload();
}
