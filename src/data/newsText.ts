import { TIMELINE } from "./timelineConfig";

/**
 * News Flash Text Content
 *
 * Defines all news flash messages and their auto-dismiss behavior.
 * Writers can edit the message text here without touching game logic.
 */

interface NewsFlashConfig {
    message: string;
    autoDismissAfter?: number; // seconds, undefined = manual dismiss only
}

export const NEWS_TEXT: Record<string, NewsFlashConfig> = {
    mc_agi_begin: {
        message: "🚨 Breaking: Mega Corp begins work on AGI",
        autoDismissAfter: TIMELINE.NEWS_MC_AGI_AUTO_DISMISS
    }
};
