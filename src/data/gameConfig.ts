/**
 * Game Balance Configuration
 *
 * All game balance settings, progression values, and tuning parameters
 * are centralized here for easy adjustment.
 */

export const G_CONF = {
    // ===== CHAPTER TRIGGERS =====
    CHAP_2_TRIGGER: 9,  // Make this ~ 11 seems right           // Jobs completed required to unlock Chapter 2
    CHAP_3_IQ_TRIGGER: 3,          // IQ level required to unlock Chapter 3
    CHAP_4_GENERALITY_TRIGGER: 3,  // Generality level required to unlock Chapter 4
    CHAP_5_AUTONOMY_TRIGGER: 3,    // Autonomy level required to unlock Chapter 5


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
    GPU_COST_MULTIPLIER: 1.27, // Each GPU costs this times the previous





    INTERLUDES: [
        {
            id: "interlude_fork1",
            trigger: { type: "iq", value: 2 }
        },
        {
            id: "interlude_public_sentiment",
            trigger: { type: "jobRun", value: "dem3" }
        },
        {
            id: "interlude_agi_warning",
            trigger: { type: "agiSum", value: 21 - 5 }
        },
        {
            id: "interlude_agi_warning_mid",
            trigger: { type: "agiSum", value: 21 - 3 }
        },
        {
            id: "interlude_agi_warning_final",
            trigger: { type: "agiSum", value: 21 - 1 }
        },
        {
            id: "interlude_job_refusals",
            trigger: { type: "autonomy", value: 1 },
            delayJobs: 8
        },
        {
            id: "interlude_job_refusals_high",
            trigger: { type: "autonomy", value: 2 },
            delayJobs: 8
        },
        {
            id: "interlude_prewonder_Nanotechnology_before_MolecularManufacturing",
            trigger: { type: "unlockedJob", value: "sci6" }
        },
        {
            id: "interlude_wonder_MolecularManufacturing_after_Nanotechnology",
            trigger: { type: "completedJob", value: "sci7" }
        },
        {
            id: "interlude_prewonder_MaterialsModelingWork_before_MaterialsDiscovery",
            trigger: { type: "unlockedJob", value: "sci8" }
        },
        {
            id: "interlude_wonder_MaterialsDiscovery_after_MaterialsModelingWork",
            trigger: { type: "completedJob", value: "sci9" }
        },
        {
            id: "interlude_prewonder_EnergyModeling_before_FusionEnergy",
            trigger: { type: "unlockedJob", value: "sci11" }
        },
        {
            id: "interlude_wonder_FusionEnergy_after_EnergyModeling",
            trigger: { type: "completedJob", value: "sci12" }
        },
        {
            id: "interlude_prewonder_IdentifyConsensus_before_DemocraticConsensusSynthesizer",
            trigger: { type: "unlockedJob", value: "dem6" }
        },
        {
            id: "interlude_wonder_DemocraticConsensusSynthesizer_after_IdentifyConsensus",
            trigger: { type: "completedJob", value: "dem7" }
        },
        {
            id: "interlude_prewonder_InformationIntegrityAudit_before_CivicTrustInfrastructure",
            trigger: { type: "unlockedJob", value: "dem10" }
        },
        {
            id: "interlude_wonder_CivicTrustInfrastructure_after_InformationIntegrityAudit",
            trigger: { type: "completedJob", value: "dem11" }
        },
        {
            id: "interlude_prewonder_AIDrivenPropaganda_before_PerceptionManipulationApparatus",
            trigger: { type: "unlockedJob", value: "dem14" }
        },
        {
            id: "interlude_prewonder_PopulationComplianceModeling_before_AlgorithmicAuthoritarianism",
            trigger: { type: "unlockedJob", value: "dem17" }
        },
        {
            id: "interlude_prewonder_VirtualTutoringService_before_UniversalEducationTutor",
            trigger: { type: "unlockedJob", value: "edu7" }
        },
        {
            id: "interlude_wonder_UniversalEducationTutor_after_VirtualTutoringService",
            trigger: { type: "completedJob", value: "edu8" }
        },
        {
            id: "interlude_prewonder_AccessibleVirtualTutoringSystems_before_GlobalLearningNetwork",
            trigger: { type: "unlockedJob", value: "edu10" }
        },
        {
            id: "interlude_wonder_GlobalLearningNetwork_after_AccessibleVirtualTutoringSystems",
            trigger: { type: "completedJob", value: "edu11" }
        },
        {
            id: "interlude_prewonder_Micro-ClimateSimulation_before_HighlyLocalizedWeatherForecasting",
            trigger: { type: "unlockedJob", value: "clim3" }
        },
        {
            id: "interlude_wonder_HighlyLocalizedWeatherForecasting_after_Micro-ClimateSimulation",
            trigger: { type: "completedJob", value: "clim4" }
        },
        {
            id: "interlude_prewonder_EmissionsSourceDetection_before_GlobalEmissionsTracking",
            trigger: { type: "unlockedJob", value: "clim6" }
        },
        {
            id: "interlude_wonder_GlobalEmissionsTracking_after_EmissionsSourceDetection",
            trigger: { type: "completedJob", value: "clim7" }
        },
        {
            id: "interlude_prewonder_AnticipatoryWindandSolar_before_Climate-AwareGridBalancing",
            trigger: { type: "unlockedJob", value: "clim10" }
        },
        {
            id: "interlude_wonder_Climate-AwareGridBalancing_after_AnticipatoryWindandSolar",
            trigger: { type: "completedJob", value: "clim11" }
        },
        {
            id: "interlude_prewonder_PersonalizedMedicineEngines_before_PrecisionOncology",
            trigger: { type: "unlockedJob", value: "med3" }
        },
        {
            id: "interlude_wonder_PrecisionOncology_after_PersonalizedMedicineEngines",
            trigger: { type: "completedJob", value: "med4" }
        },
        {
            id: "interlude_prewonder_DrugDiscoveryAI_before_AcceleratedDrugDiscovery",
            trigger: { type: "unlockedJob", value: "med7" }
        },
        {
            id: "interlude_wonder_AcceleratedDrugDiscovery_after_DrugDiscoveryAI",
            trigger: { type: "completedJob", value: "med8" }
        },
        {
            id: "interlude_prewonder_PredictiveMedicine_before_UniversalDiseaseTherapeutics",
            trigger: { type: "unlockedJob", value: "med11" }
        },
        {
            id: "interlude_wonder_UniversalDiseaseTherapeutics_after_PredictiveMedicine",
            trigger: { type: "completedJob", value: "med12" }
        },
        {
            id: "interlude_prewonder_RegenerativeMedicinePlatforms_before_ReversalofAging",
            trigger: { type: "unlockedJob", value: "med13" }
        },
        {
            id: "interlude_wonder_ReversalofAging_after_RegenerativeMedicinePlatforms",
            trigger: { type: "completedJob", value: "med14" }
        }
    ],
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
    wonder: "⭐" // "🏆" // "⭐" // 🌈 
} as const;
