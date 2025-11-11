/**
 * Game Balance Configuration
 *
 * All game balance settings, progression values, and tuning parameters
 * are centralized here for easy adjustment.
 */

/// Level triggers are defined in data/layers/main.tsx     // Chapter transition watcher

export const G_CONF = {
    // ===== STARTING RESOURCES =====
    STARTING_MONEY: 20,
    STARTING_PIZZAS: ["imgclassifier"], // Lol pizza
    STARTING_GPUS: 1,
    STARTING_IQ: 1, // Intelligence stat, unlocked in Chapter 2
    STARTING_DATA: 0, // Data resource, unlocked in Chapter 2

    // ===== JOB GENERATION =====
    JOB_GENERATION_INTERVAL: 3, // Seconds between new job checks (currently fast for dev)
    AUTO_JOB_LIMIT: 4, // Only auto-generate new jobs if <= this many in queue
    INITIAL_JOBS_COUNT: 3, // Number of jobs to spawn on game start

    // ===== JOB PARAMETERS =====
    JOB_DURATION_MIN: 10, // Minimum job duration in seconds
    JOB_DURATION_MAX: 30, // Maximum job duration in seconds (will add to min)
    JOB_PAYOUT_MIN: 10, // Minimum base payout
    JOB_PAYOUT_MAX: 40, // Maximum additional payout (will add to min)

    // ===== GPU COSTS =====
    GPU_BASE_COST: 50, // Cost of first GPU purchase
    GPU_COST_MULTIPLIER: 1.5, // Each GPU costs 1.5x the previous

    // ===== CHAPTER 2 BONUSES =====
    CHAPTER_2_QUALITY_BONUS: 1.10, // 10% multiplicative earnings increase
    CHAPTER_2_SPEED_BONUS: 1.10, // 10% multiplicative speed increase (jobs complete faster)

    // ===== CHAPTER 3 BONUSES =====
    CHAPTER_3_QUALITY_BONUS: 1.15, // 15% multiplicative earnings increase
    CHAPTER_3_SPEED_BONUS: 1.15 // 15% multiplicative speed increase (jobs complete faster)
} as const;

// Type export for TypeScript autocomplete
export type GameConfig = typeof G_CONF;
