/**
 * Timeline Configuration for Chapter 5 Events
 *
 * All times are in seconds since the completion of Chapter 5.
 * Adjust these values to change the pacing of the game.
 */

export const TIMELINE = {
    // News flash timing (oppose framework path only)
    NEWS_MC_AGI_START: 3,           // When "Mega Corp begins AGI" news appears
    NEWS_MC_AGI_AUTO_DISMISS: 20,   // How long until it auto-dismisses (After first being shown, not absolute timeline)

    // Countdown timer (oppose framework path only)
    COUNTDOWN_START_TIME: 10,       // When countdown timer appears
    COUNTDOWN_DURATION: 10,         // How long the countdown lasts

    // Calculated: when game ends (lose condition)
    get GAME_OVER_TIME() {
        return this.COUNTDOWN_START_TIME + this.COUNTDOWN_DURATION;
    }
} as const;
