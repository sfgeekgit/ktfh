import projInfo from "data/projInfo.json";
import { achievements as achievementsLayer } from "../data/layers/achievements";

/** Key used to persist meta achievement state outside the main save. */
export const STORAGE_KEY = `achievements-${projInfo.id || "default"}`;

/** Shape of the sidecar data. */
export interface AchievementMetaState {
    earned: Record<string, boolean>;
}

export function readAchievementMeta(): AchievementMetaState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { earned: {} };
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed != null && "earned" in parsed) {
            return { earned: parsed.earned as Record<string, boolean> };
        }
    } catch (e) {
        console.warn("Failed to read achievement meta state", e);
    }
    return { earned: {} };
}

export function writeAchievementMeta(state: AchievementMetaState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn("Failed to write achievement meta state", e);
    }
}

/** Apply persisted meta state (earned flags) to the achievements layer. */
export function loadAchievementMeta() {
    const meta = readAchievementMeta();
    if (!achievementsLayer) return;
    Object.entries(meta.earned).forEach(([id, earned]) => {
        const ach = (achievementsLayer as any)[id];
        if (ach?.earned) {
            ach.earned.value = earned;
        }
    });
}

/** Write current achievement earned flags to meta storage. */
export function saveAchievementMeta() {
    if (!achievementsLayer || Object.keys(achievementsLayer).length === 0) return;
    const earned: Record<string, boolean> = {};
    Object.entries(achievementsLayer as any).forEach(([id, ach]: any) => {
        if (ach?.earned?.value === true) {
            earned[id] = true;
        }
    });
    writeAchievementMeta({ earned });
}

/** Clear meta storage and mark all achievements as not earned. */
export function resetAchievementMeta() {
    writeAchievementMeta({ earned: {} });
    if (!achievementsLayer || Object.keys(achievementsLayer).length === 0) return;
    Object.values(achievementsLayer as any).forEach((ach: any) => {
        if (ach?.earned) {
            ach.earned.value = false;
        }
    });
}
