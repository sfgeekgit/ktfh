import { CHAP_5_MC_AGI_LOSE_TIMELINE } from "./gameConfig";

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
        message: "🚨 Breaking: MegaCorp begins work on AGI",
        autoDismissAfter: CHAP_5_MC_AGI_LOSE_TIMELINE.NEWS_MC_AGI_AUTO_DISMISS
    }
    ,
    n5a1: {
        message: "🚨 Breaking: MegaCorp sued for framework violations",
	autoDismissAfter: 90
    }
    , n5a2: {
        message: "🚨 Breaking: MegaCorp caught violating international AI agreement. Again!",
	autoDismissAfter: 90
    }
    , n5a3: {
        message: "🎉 Breaking: MegaCorp SHUT DOWN by regulators",
	autoDismissAfter: 2000
    }


};
