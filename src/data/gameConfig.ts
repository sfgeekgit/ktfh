/**
 * Game Balance Configuration
 *
 * All game balance settings, progression values, and tuning parameters
 * are centralized here for easy adjustment.
 */

export const G_CONF = {
    // ===== CHAPTER TRIGGERS =====
    CHAP_2_TRIGGER: 15,  // Make this 15 seems right           // Jobs completed required to unlock Chapter 2
    CHAP_3_IQ_TRIGGER: 3,          // IQ level required to unlock Chapter 3
    CHAP_4_GENERALITY_TRIGGER: 3,  // Generality level required to unlock Chapter 4
    CHAP_5_AUTONOMY_TRIGGER: 3,    // Autonomy level required to unlock Chapter 5
    INTERLUDES: [
        {
            id: "interlude_fork1",
            trigger: { type: "iq", value: 2 }
        },
        {
            id: "interlude_public_sentiment",
            trigger: { type: "jobRun", value: "dem3" }
        }
    ],

    // ===== STARTING RESOURCES =====
    STARTING_MONEY: 48,
    STARTING_PIZZAS: ["imgclassifier"], // Lol pizza
    STARTING_GPUS: 1,
    STARTING_IQ: 1, // Intelligence stat, unlocked in Chapter 2
    STARTING_DATA: 0, // Data resource, unlocked in Chapter 2

    AGI_SUM_LOSE: 21, // Player looses the game if AGI reaches this.
    WONDER_WIN: 5, // Player wins the game if Wonder reaches this.



    // ===== JOB GENERATION =====
    JOB_GENERATION_INTERVAL: 2.5, // Seconds between new job checks (currently fast for dev)
    AUTO_JOB_LIMIT: 4, // Only auto-generate new jobs if <= this many in queue
    INITIAL_JOBS_COUNT: 1, // Number of jobs to spawn on game start

    // ===== GPU COSTS =====
    GPU_BASE_COST: 40, // Cost of first GPU purchase
    GPU_COST_MULTIPLIER: 1.3, // Each GPU costs this times the previous

    // ===== CHAPTER 2 BONUSES =====
    CHAPTER_2_QUALITY_BONUS: 1.10, // 10% multiplicative earnings increase
    CHAPTER_2_SPEED_BONUS: 1.10, // 10% multiplicative speed increase (jobs complete faster)

    // ===== CHAPTER 3 BONUSES =====
    CHAPTER_3_QUALITY_BONUS: 1.15, // 15% multiplicative earnings increase
    CHAPTER_3_SPEED_BONUS: 1.15 // 15% multiplicative speed increase (jobs complete faster)
} as const;

// Type export for TypeScript autocomplete
export type GameConfig = typeof G_CONF;

/**
 * Timeline Configuration for Chapter 5 Events
 *
 * All times are in seconds since the completion of Chapter 5.
 * Adjust these values to change the pacing of the game.
 */

export const CHAP_5_MC_AGI_LOSE_TIMELINE = {
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


export const CHAP_5_ACCEPT_TIMELINE = [
    { time: 10, newsId: "n5a1" },
    { time: 60, newsId: "n5a2" },
    { time: 130, newsId: "n5a3" }
] as const;

export const COMPUTE_NAMES = {
    1: "GPU",
    2: "GPU",
    3: "GPU Cluster",
    4: "Data Center",
    5: "Data Center"
} as const;

// Centralized stat icons
export const STAT_ICONS = {
    money: "💰",
    data: "📊",
    iq: "🧠",
    autonomy: "🤖",
    generality: "💠",
    wonder: "🌈"
} as const;
