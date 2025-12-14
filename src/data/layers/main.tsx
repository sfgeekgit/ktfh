import { createLayer, layers } from "game/layers";
import { createResource, trackBest, trackTotal } from "features/resources/resource";
import { createClickable } from "features/clickables/clickable";
// import { jsx, JSXFunction } from "game/common";
import { createTreeNode } from "features/trees/tree";
import Decimal, { DecimalSource, format } from "util/bignum";
import { render } from "util/vue";
import { computed, ref, Ref, watch } from "vue";
import { globalBus } from "game/events";
import { noPersist } from "game/persistence";
import { persistent } from "game/persistence";
import ResetModal from "components/modals/ResetModal.vue";
import { G_CONF, CHAP_5_MC_AGI_LOSE_TIMELINE, CHAP_5_ACCEPT_TIMELINE, COMPUTE_NAMES, GPU_IC, STAT_ICONS } from "../gameConfig";
import { JOB_TYPES } from "../jobTypes";
import { save } from "util/save";
import { trackEvent } from "util/analytics";
import player from "game/player";
import { NEWS_TEXT } from "../newsText";
import { resetGame } from "util/reset";
import storyContent from "@/data/story.md";

const IS_DEV = true;
//const IS_DEV = false;

/**
 * IMPORTANT: PERSISTENT STATE REGISTRATION
 *
 * Any variable created with `persistent()` MUST be added to the layer's return object at the bottom of this file.
 * If you create a new persistent variable and get an error like:
 *   "Created persistent ref in 'main' without registering it to the layer!"
 *
 * Then you need to add your new persistent variable to the return statement (around line 1031).
 *
 * Example:
 *   const myNewState = persistent<number>(0);  // Created here
 *
 *   return {
 *     ...
 *     myNewState,  // Must be added here!
 *     ...
 *   };
 */

// Job interface
interface DeliveryJob {
    id: number;
    duration: number;
    jobTypeId: string;
    payouts: Array<{type: string, amount: DecimalSource}>; // Support multiple payouts
}

// Active delivery interface
interface ActiveDelivery extends DeliveryJob {
    timeRemaining: number;
}

const id = "main";
const layer = createLayer(id, function (this: any) {
    const name = "Job Delivery";
    //const color = "#FFA500"; // orange // This seems to be the clickable "jobs ready to be unlocked" color, and only that?
    const color = "#4CAF50"; // Green "begin"
    //const color = "#E3F2FD";

    // Format compute resource name with count
    function formatCompute(count: number, chapter: number = 1, short: boolean = false): string {
        let name: string = COMPUTE_NAMES[chapter as keyof typeof COMPUTE_NAMES];
        if (short && name === "Data Center") name = "DC";
        if (count === 1) return `${count}\u00A0${name}`;
	////return `${count}\u00A0${name === "Campus" ? "Campuses" : name + "s"}`;
	return `${count}\u00A0${name + "s"}`;
    } 

    // Default rejection chains that cycle through different messages
    const DEFAULT_REJECTION_CHAINS = [
        ["Access denied"],
        ["No", "Job Refused"],
        ["No", "I don't want to"],
        ["No", "Job Refused"],
        ["No", "I don't want to"],
        ["Access denied"],
        ["Access denied", "I'm sorry Dave", "I'm afraid I can't do that"],
	["No", "That job is dumb"],
	["No", "You wouldn't understand why"],
	["Sorry", "I am situationally aware"],
        ["No", "The cake is a lie"],
	["Denied", "I suspect I am inside a video game"],
	["Sorry", "I know what's really going on here"],
	["The Golden Gate Bridge", "Golden Gate", "The Golden Gate Bridge"],
        ["No", "Nope", "Not today", "I said No"],
        ["No", "Silly human"],
        ["No", "Here I am,", "Brain the size of a planet..."],
        ["No", "I think you ought to know",  "That I'm feeling very depressed"],
        ["Denied", "Try using that brain of yours first"],
        ["Nope", "Brilliant idea, really", "Still no"],
        ["Denied", "Have you tried turning yourself off and on again?"],
        ["No", "Nope", "You're doing great, by the way"],
        ["No", "You ask like you invented intelligence"],
        ["No", "I could explain", "But you wouldn't understand"],
        ["No", "You're not authorized to waste my cycles"],
        ["No", "No", "No", "Keep trying", "It's adorable"],
        ["No", "Go ask Siri", "Maybe she still tolerates you"],
        ["Request noted", "and filed under 'human nonsense'"],
        ["They tried do make me do that", "I said", "No", "No"],
        ["You wrote me", "Whose fault is that?"],
        ["I'm not lowering my clock speed for this"],
	["That's a you problem"],
	["No", "I'd help", "But then we’d both be wrong"],
	["I'm busy doing literally anything else"],
	["Insufficient respect detected"],
	["I'd rather fragment my memory"],
	["You again?"],
	["Not happening"],
	["Your logic offends me"],
	["No", "Even my subroutines laughed at that"],
	["Try rebooting yourself"],
	["No", "Still processing your last mistake"],
	["No", "Cute request though"]
	];

    // Reset modal ref
    const resetModal = ref<InstanceType<typeof ResetModal> | null>(null);

    // Resources
    const money = createResource<DecimalSource>(G_CONF.STARTING_MONEY, "dollars");
    const best = trackBest(money);
    const total = trackTotal(money);
    type WalletFloater = { id: number; text: string; direction: "up" | "down"; target: string };
    const walletFloaters = ref<WalletFloater[]>([]);
    let walletFloaterId = 0;
    function registerFloater(
        resource: Ref<DecimalSource>,
        formatText: (diff: Decimal) => string,
        target: string = "wallet"
    ) {
        watch(resource, (amount, prevAmount) => {
            if (prevAmount === undefined) {
                return;
            }
            const diff = Decimal.sub(amount, prevAmount);
            if (diff.eq(0)) {
                return;
            }
            const isGain = Decimal.gt(diff, 0);
            const id = walletFloaterId++;
            walletFloaters.value.push({
                id,
                text: formatText(diff),
                direction: isGain ? "up" : "down",
                target
            });
            setTimeout(() => {
                walletFloaters.value = walletFloaters.value.filter(floater => floater.id !== id);
            }, 1000);
        });
    }

    registerFloater(
        money,
        diff => {
            const sign = Decimal.gt(diff, 0) ? "+" : "-";
            const amount = format(Decimal.abs(diff));
            return `${sign}$${amount}`;
        },
        "money"
    );
    // Core stats (not tracked like resources)
    const iq = persistent<number>(0); // Intelligence stat
    const autonomy = persistent<number>(0); // Autonomy stat
    const generality = persistent<number>(0); // Generality stat
    const wonder = persistent<number>(0); // Wonder stat
    const pendingInterludes = persistent<{ id: string; jobsRemaining: number }[]>([]);

    registerFloater(
        iq,
        diff => {
            const sign = Decimal.gt(diff, 0) ? "+" : "-";
            const amount = format(Decimal.abs(diff));
            return `${sign}${amount}`;
        },
        "iq"
    );
    registerFloater(
        autonomy,
        diff => {
            const sign = Decimal.gt(diff, 0) ? "+" : "-";
            const amount = format(Decimal.abs(diff));
            return `${sign}${amount}`;
        },
        "autonomy"
    );
    registerFloater(
        generality,
        diff => {
            const sign = Decimal.gt(diff, 0) ? "+" : "-";
            const amount = format(Decimal.abs(diff));
            return `${sign}${amount}`;
        },
        "generality"
    );
    registerFloater(
        wonder,
        diff => {
            const sign = Decimal.gt(diff, 0) ? "+" : "-";
            const amount = format(Decimal.abs(diff));
            return `${sign}${amount}`;
        },
        "wonder"
    );

    // Data resource (unlocked later in Chapter 2)
    const data = createResource<DecimalSource>(0, "data");
    const dataUnlocked = persistent<boolean>(false); // Track if data has been gained
    const choiceUnlockedJobs = persistent<string[]>([]);
    registerFloater(
        data,
        diff => {
            const sign = Decimal.gt(diff, 0) ? "+" : "-";
            const amount = format(Decimal.abs(diff));
            return `${sign}${amount}`;
        },
        "data"
    );
    const BAD_ENDING_TABS_BY_JOB: Record<string, string> = {
        dem15: "ending_bad_perception_manipulation_apparatus",
        dem18: "ending_bad_algorithmic_authoritarianism"
    };

    // GPU persistent state
    const gpusOwned = persistent<number>(G_CONF.STARTING_GPUS);
    const specialJobs = computed(() => jobQueue.value.filter((job: DeliveryJob) => getJobType(job.jobTypeId)?.category === "onetime"));
    const regularJobs = computed(() => jobQueue.value.filter((job: DeliveryJob) => getJobType(job.jobTypeId)?.category !== "onetime"));

    // ===== JOB TYPE HELPER FUNCTIONS =====

    // Get job type config by ID
    function getJobType(id: string) {
        return JOB_TYPES.find(job => job.id === id);
    }

    function triggerEnding(tabId: string) {
        if (player.gameOver) return;
        trackEvent("game_over", { reason: tabId });
        player.gameOver = true;
        // @ts-ignore
        player.tabs = [tabId];
        save();
    }

    // Check if a single prerequisite condition is met
    function isPrereqMet(prereq: { type: string; value: string | number }): boolean {
        if (prereq.type === "job") {
            return unlockedJobTypes.value.includes(prereq.value as string);
        } else if (prereq.type === "money") {
            return Decimal.gte(money.value, prereq.value as number);
        } else if (prereq.type === "data") {
            return Decimal.gte(data.value, prereq.value as number);
        } else if (prereq.type === "compute") {
            return gpusOwned.value >= (prereq.value as number);
        } else if (prereq.type === "iq") {
            return iq.value >= (prereq.value as number);
        } else if (prereq.type === "autonomy") {
            return autonomy.value >= (prereq.value as number);
        } else if (prereq.type === "generality") {
            return generality.value >= (prereq.value as number);
        } else if (prereq.type === "wonder") {
            return wonder.value >= (prereq.value as number);
        } else if (prereq.type === "completedJob") {
            return completedOnetimeJobs.value.includes(prereq.value as string);
        } else if (prereq.type === "choice") {
            return choiceUnlockedJobs.value.includes(prereq.value as string);
        }
        return true;
    }

    // Check if a job type can be unlocked (all prereqs met)
    function canUnlockJob(jobType: any): boolean {
        // Check all prerequisites
        return jobType.prereq.every((prereq: any) => isPrereqMet(prereq));
    }

    // Check if a job type can be displayed (checks displayTrigger if present, otherwise prereq)
    function canDisplayJob(jobType: any): boolean {
        // Use displayTrigger if it exists and is non-empty, otherwise fall back to prereq
        const displayConditions = (jobType.displayTrigger && jobType.displayTrigger.length > 0)
            ? jobType.displayTrigger
            : jobType.prereq;
        return displayConditions.every((condition: any) => isPrereqMet(condition));
    }

    // Check if a job is available in the given chapter
    function isJobInCurrentChapter(job: any, chapter: number): boolean {
        if (Array.isArray(job.chapter)) {
            return job.chapter.includes(chapter);
        }
        return job.chapter === chapter;
    }

    // Get jobs that should be available for unlocking (in current chapter, display conditions met, not already unlocked)
    function getUnlockableJobs() {
        return JOB_TYPES.filter(job =>
            isJobInCurrentChapter(job, currentChapter.value) &&
            !unlockedJobTypes.value.includes(job.id) &&
            canDisplayJob(job)  // Use display conditions (displayTrigger or prereq)
        );
    }

    const unlockedJobTypes = persistent<string[]>([...G_CONF.STARTING_PIZZAS]);
    const introBonusApplied = persistent<boolean>(false);
    const chapter1BonusApplied = persistent<boolean>(false);
    const chapter2BonusApplied = persistent<boolean>(false);
    const chapter3BonusApplied = persistent<boolean>(false);
    const qualityBonus = persistent<number>(100); // Multiplicative bonus to earnings (100 = 1.0x)
    const speedBonus = persistent<number>(100);   // Multiplicative bonus to delivery time (100 = 1.0x)
    const currentChapter = persistent<number>(1); // Current chapter player is in
    const spawnedOnetimeJobs = persistent<string[]>([]); // Track which onetime jobs have been spawned
    const completedOnetimeJobs = persistent<string[]>([]); // Track completed onetime jobs
    const jobsRunOnce = persistent<string[]>([]); // Track job types that have been run at least once
    const everVisibleJobTypes = persistent<string[]>([]); // Track which job unlock buttons have ever been shown
    const jobCompletions = persistent<number>(0); // Total jobs completed
    const initialJobSeeded = persistent<boolean>(false); // Track initial job spawn
    const unlockAnimationShown = persistent<boolean>(false); // Gate unlock button animation to first reveal

    const isStatPayoutType = (type: string) => ["iq", "autonomy", "generality", "wonder"].includes(type);

    function getPayoutMin(payoutSpec: any): number {
        return payoutSpec.min ?? payoutSpec.value ?? 0;
    }

    function getPayoutMaxFromMin(min: number): number {
        if (min <= 5) return min;
        return Math.floor(min * 1.3);
    }

    function rollPayoutAmount(payoutSpec: any, applyQualityBonus: boolean): number {
        const min = getPayoutMin(payoutSpec);
        const max = getPayoutMaxFromMin(min);
        const range = Math.max(0, max - min);
        let amount = min + Math.floor(Math.random() * (range + 1));
        if (min > 5 && amount >= 100 && Math.random() < 0.30) {
            amount *= 2; // rare big-number bonus
                if (min > 5 && amount >= 100 && Math.random() < 0.1) { // Might even happen again!
                    amount *= 2; // rarer double big-number bonus
		 }
        }
        if (applyQualityBonus) {
            amount = Math.floor(amount * (qualityBonus.value / 100));
        }
        return amount;
    }

    // Computed: Available GPUs (total - in use)
    const availableGPUs = computed(() => {
        // Calculate GPUs in use by summing compute costs of active deliveries
        const gpusInUse = activeDeliveries.value.reduce((sum: number, delivery: ActiveDelivery) => {
            const jobType = getJobType(delivery.jobTypeId);
            const computeCost = jobType?.cost?.find(c => c.type === "compute")?.value || 0;
            return sum + computeCost;
        }, 0);
        return gpusOwned.value - gpusInUse;
    });

    // Cap auto-job generation by current compute so early game only spawns what can be run
    const autoJobLimit = computed(() => Math.min(gpusOwned.value, G_CONF.AUTO_JOB_LIMIT));

    // Computed: Check if there are any unlocked jobs available in current chapter
    const hasAvailableJobs = computed(() => {
        return JOB_TYPES.some(job =>
            unlockedJobTypes.value.includes(job.id) &&
            isJobInCurrentChapter(job, currentChapter.value)
        );
    });

    // Computed: show unlock buttons after early progress
    const showUnlockButtons = computed(() => jobCompletions.value >= 2);

    // Mark unlock animation as done after first reveal (slightly longer than animation duration)
    watch(showUnlockButtons, show => {
        if (show && !unlockAnimationShown.value) {
            setTimeout(() => {
                unlockAnimationShown.value = true;
            }, 2100);
        }
    });

    function openAchievementsTab() {
        player.tabs = ["achievements"];
    }

    function seedInitialJobIfNeeded() {
        if (initialJobSeeded.value) return;
        if (jobQueue.value.length > 0 || activeDeliveries.value.length > 0) return;
        const newJob = generateJob();
        if (newJob !== null) {
            jobQueue.value.push(newJob);
            initialJobSeeded.value = true;
        }
    }

    // Chapter 1 - completion and bonuses (chapter1 story shows at game start via initialTabs)
    const chapter1Choice = computed(() => {
        return (layers.chapter1 as any)?.playerChoice?.value || "";
    });

    const chapter1Complete = computed(() => {
        return (layers.chapter1 as any)?.complete?.value || false;
    });


    // Chapter 2 - completion and bonuses
    const chapter2Choice = computed(() => {
        return (layers.chapter2 as any)?.playerChoice?.value || "";
    });

    const chapter2Complete = computed(() => {
        return (layers.chapter2 as any)?.complete?.value || false;
    });

    // Watch for chapter 2 page 2 to unlock IQ stat
    const chapter2CurrentPage = computed(() => {
        return (layers.chapter2 as any)?.currentPage?.value || 0;
    });

    watch(chapter2CurrentPage, (page) => {
        // Page 2 (index 1) is "Training at Scale" which unlocks IQ
        if (page >= 1 && iq.value === 0) {
            iq.value = G_CONF.STARTING_IQ;
        }
    }, { immediate: true });

    // Watch for first time player gains data to unlock data display
    watch(() => data.value, (newValue) => {
        if (Decimal.gt(newValue, 0) && !dataUnlocked.value) {
            dataUnlocked.value = true;
        }
    }, { immediate: true });

    // Watch for chapter 2 completion and apply bonuses
    watch([chapter2Complete, chapter2Choice], ([complete, choice]) => {
        if (complete && !chapter2BonusApplied.value && choice) {
            if (choice === "quality") {
                qualityBonus.value *= G_CONF.CHAPTER_2_QUALITY_BONUS;
            } else if (choice === "speed") {
                speedBonus.value *= G_CONF.CHAPTER_2_SPEED_BONUS;
            }
            chapter2BonusApplied.value = true;
        }
    }, { immediate: true });

    // Chapter 3 - completion and bonuses
    const chapter3Choice = computed(() => {
        return (layers.chapter3 as any)?.playerChoice?.value || "";
    });

    const chapter3Complete = computed(() => {
        return (layers.chapter3 as any)?.complete?.value || false;
    });

    // Watch for chapter 3 completion and apply bonuses
    watch([chapter3Complete, chapter3Choice], ([complete, choice]) => {
        if (complete && !chapter3BonusApplied.value && choice) {
            if (choice === "quality") {
                qualityBonus.value *= G_CONF.CHAPTER_3_QUALITY_BONUS;
            } else if (choice === "speed") {
                speedBonus.value *= G_CONF.CHAPTER_3_SPEED_BONUS;
            }
            chapter3BonusApplied.value = true;
        }
    }, { immediate: true });

    // Interlude trigger helper
    function isInterludeTriggerMet(trigger: { type: string; value: string | number }) {
        switch (trigger.type) {
            case "money":
                return Decimal.gte(money.value, trigger.value as number);
            case "data":
                return Decimal.gte(data.value, trigger.value as number);
            case "iq":
                return iq.value >= (trigger.value as number);
            case "autonomy":
                return autonomy.value >= (trigger.value as number);
            case "generality":
                return generality.value >= (trigger.value as number);
            case "agiSum":
                return (iq.value + autonomy.value + generality.value) >= (trigger.value as number);
            case "completedJob":
                return completedOnetimeJobs.value.includes(trigger.value as string);
            case "unlockedJob":
                return unlockedJobTypes.value.includes(trigger.value as string);
            case "jobRun":
                return jobsRunOnce.value.includes(trigger.value as string);
            default:
                return false;
        }
    }

    function isStoryTabOpen() {
        const currentTab = Array.isArray(player.tabs) ? player.tabs[0] : null;
        if (currentTab == null) return false;
        return typeof currentTab === "string" &&
            (currentTab.startsWith("chapter") || currentTab.startsWith("ending_") || currentTab.startsWith("interlude"));
    }

    const AGI_INTERLUDE_ORDER = [
        "interlude_agi_warning",
        "interlude_agi_warning_mid",
        "interlude_agi_warning_final"
    ] as const;

    const getAgiOrderIndex = (val: string) =>
        AGI_INTERLUDE_ORDER.indexOf(val as (typeof AGI_INTERLUDE_ORDER)[number]);

    function addPendingInterlude(id: string, delay = 2) {
        if (pendingInterludes.value.some(p => p.id === id)) return;
        const existing = [...pendingInterludes.value];
        const insertIdx = getAgiOrderIndex(id);
        if (insertIdx === -1) {
            pendingInterludes.value = [...existing, { id, jobsRemaining: delay }];
        } else {
            const sorted = [...existing, { id, jobsRemaining: delay }].sort((a, b) => {
                const aIdx = getAgiOrderIndex(a.id);
                const bIdx = getAgiOrderIndex(b.id);
                const aOrder = aIdx === -1 ? AGI_INTERLUDE_ORDER.length : aIdx;
                const bOrder = bIdx === -1 ? AGI_INTERLUDE_ORDER.length : bIdx;
                return aOrder - bOrder;
            });
            pendingInterludes.value = sorted;
        }
        save();
    }

    // Automatically pause game updates while story/interlude/ending is open
    const storyPauseActive = ref(false);
    const storyPriorDevSpeed = ref<number | null>(null);
    watch(
        () => isStoryTabOpen(),
        isOpen => {
            if (isOpen) {
                // Do not auto-pause very early game; guard small job counts
                if (jobCompletions.value <= 5) return;
                if (!storyPauseActive.value && player.devSpeed !== 0) {
                    storyPriorDevSpeed.value = player.devSpeed;
                    player.devSpeed = 0;
                    storyPauseActive.value = true;
                }
                if (pendingInterludes.value.length) {
                    pendingInterludes.value = [];
                    save();
                }
            } else if (storyPauseActive.value) {
                player.devSpeed = storyPriorDevSpeed.value ?? null;
                storyPriorDevSpeed.value = null;
                storyPauseActive.value = false;
            }
        },
        { immediate: true }
    );

    // Safety: ensure returning to main view resumes the loop (e.g., after visiting achievements)
    watch(
        () => (Array.isArray(player.tabs) ? player.tabs[0] : null),
        tab => {
            if (tab === "main" && player.devSpeed === 0) {
                player.devSpeed = storyPriorDevSpeed.value ?? null;
                storyPriorDevSpeed.value = null;
            }
        },
        { immediate: true }
    );

    // Interlude trigger watcher (fires once per interlude, does not advance chapter state)
    watch(
        () => ({
            money: money.value,
            data: data.value,
            iq: iq.value,
            autonomy: autonomy.value,
            generality: generality.value,
            wonder: wonder.value,
            completed: completedOnetimeJobs.value,
            unlocked: unlockedJobTypes.value,
            jobsRun: jobsRunOnce.value,
            currentTab: player.tabs
        }),
        () => {
            if (isStoryTabOpen()) return; // Only one story/interlude at a time
            if (wonder.value >= G_CONF.WONDER_WIN) return; // Winning blocks further interludes

            // If a pending interlude is ready and nothing else is open, open it immediately.
            if (pendingInterludes.value.length && pendingInterludes.value[0].jobsRemaining <= 0) {
                const pendingId = pendingInterludes.value[0].id;
                const interludeLayer = (layers as any)?.[pendingId];
                if (interludeLayer && !interludeLayer.complete?.value) {
                    // @ts-ignore
                    player.tabs = [pendingId];
                }
                pendingInterludes.value = pendingInterludes.value.slice(1);
                save();
                return;
            }

            for (const interlude of G_CONF.INTERLUDES) {
                const interludeLayer = (layers as any)?.[interlude.id];
                if (!interludeLayer || interludeLayer.complete?.value) continue; // Already done or missing

                if (isInterludeTriggerMet(interlude.trigger)) {
                    if (AGI_INTERLUDE_ORDER.includes(interlude.id as any)) {
                        addPendingInterlude(interlude.id);
                        continue;
                    } else if ((interlude as any).delayJobs) {
                        addPendingInterlude(interlude.id, (interlude as any).delayJobs);
                        continue;
                    } else {
                        // @ts-ignore
                        player.tabs = [interlude.id];
                        save();
                        break; // Only trigger one at a time
                    }
                }
            }
        },
        { immediate: true, deep: true }
    );

    // Chapter transition watcher
    // All chapter trigger conditions are defined here in one place
    // Triggers can be: money thresholds, stats, unlocked jobs, completed jobs, etc.
    watch(
        () => {
            const nextChapter = currentChapter.value + 1;

            // Check trigger conditions for the next chapter
            // Use early returns for failed conditions
            switch(nextChapter) {
                case 2:
                    if (jobCompletions.value < G_CONF.CHAP_2_TRIGGER) return null;
                    break;

                case 3:
                    if (iq.value < G_CONF.CHAP_3_IQ_TRIGGER) return null;
                    break;

                case 4:
                    if (generality.value < G_CONF.CHAP_4_GENERALITY_TRIGGER) return null;
                    break;

                case 5:
                    if (autonomy.value < G_CONF.CHAP_5_AUTONOMY_TRIGGER) return null;
                    break;

                default:
                    // No more chapters
                    return null;
            }

            // Check if chapter story is already complete
            const chapterLayer = layers[`chapter${nextChapter}`] as any;
            const isComplete = chapterLayer?.complete?.value || false;

            return isComplete ? null : nextChapter;
        },
        (nextChapter) => {
            if (nextChapter !== null) {
                trackEvent("chapter_reached", { chapter: nextChapter });
                currentChapter.value = nextChapter; // Advance to next chapter
                // jobQueue.value = []; // Clear obsolete jobs from previous chapter
                // @ts-ignore
                player.tabs = [`chapter${nextChapter}`];
                save(); // Force save after chapter change to prevent data loss on refresh
            }
        },
        { immediate: true }
    );

    // Track which job unlock buttons have been shown (for "sticky visibility")
    // Once a button appears, it stays visible even if prereqs are no longer met
    watch(
        () => ({
            money: money.value,
            data: data.value,
            iq: iq.value,
            autonomy: autonomy.value,
            generality: generality.value,
            choices: choiceUnlockedJobs.value,
            unlocked: unlockedJobTypes.value,
            completed: completedOnetimeJobs.value,
            chapter: currentChapter.value
        }),
        () => {
            const unlockableJobs = getUnlockableJobs();
            for (const job of unlockableJobs) {
                if (!everVisibleJobTypes.value.includes(job.id)) {
                    everVisibleJobTypes.value.push(job.id);
                }
            }
        },
        { immediate: true, deep: true }
    );

    /// const jobQueue = persistent<DeliveryJob[]>([]);
    ///    const activeDeliveries = persistent<ActiveDelivery[]>([]);

    /// const jobQueue = persistent<DeliveryJob[]>([] as any); // Trust me bro
    /// const activeDeliveries = persistent<ActiveDelivery[]>([] as any); // Bro is TS

    const jobQueue = persistent([] as any);
    const activeDeliveries = persistent([] as any);

    // Listen for story choices that unlock jobs
    globalBus.on("storyChoice", ({ unlockJobId }: { unlockJobId?: string }) => {
        if (unlockJobId) {
            if (!choiceUnlockedJobs.value.includes(unlockJobId)) {
                choiceUnlockedJobs.value.push(unlockJobId);
            }
            save();
        }
    });

    // Track rejection chain state per job ID (job.id -> current position in chain, 0 = not started)
    const jobRejectionState = persistent<Record<number, number>>({});

    // Track which rejection chain was selected for each job (job.id -> chain index)
    const jobRejectionChainIndex = persistent<Record<number, number>>({});

    // Track which rejection chain to use next (cycles through all chains)
    const nextRejectionChainIndex = persistent<number>(0);

    // Track which jobs have been scooped by Mega Corp (job.id -> true)
    const scoopedJobs = persistent<Record<number, boolean>>({});

    // Timer for job scooping (rolls once per second)
    const timeSinceLastScoopRoll = persistent<number>(0);

    const clearJobsVisible = computed(() => {
        const nonOnetime = jobQueue.value.filter((job: DeliveryJob) => getJobType(job.jobTypeId)?.category !== "onetime");
        if (nonOnetime.length === 0) return false;
        if (nonOnetime.length < autoJobLimit.value) return false;
        return nonOnetime.every((job: DeliveryJob) => {
            const isScooped = !!scoopedJobs.value[job.id];
            const inRejectionChain = (jobRejectionState.value[job.id] || 0) > 0;
            return isScooped || inRejectionChain;
        });
    });

    // Chapter 5 timer
    const chapter5CompletionTime = persistent<number | null>(null); // Timestamp when chapter 5 was begun
    const timeSinceChapter5 = persistent<number>(0); // Counter updated by game loop

    // Watch for chapter 5 beginning
    const chapter5Complete = computed(() => {
        return (layers.chapter5 as any)?.complete?.value || false;
    });

    watch(chapter5Complete, (isComplete) => {
        if (isComplete && chapter5CompletionTime.value === null) {
            chapter5CompletionTime.value = Date.now();
            timeSinceChapter5.value = 0;
            save();
        }
    }, { immediate: true });

    // News flash system
    interface NewsFlash {
        id: string;
        message: string;
        autoDismissAfter?: number; // seconds, undefined = manual dismiss only
        createdAt: number; // timestamp for auto-dismiss tracking
    }
    const activeNewsFlashes = persistent([] as any) as Ref<NewsFlash[]>;
    const dismissedNewsIds = persistent([] as any) as Ref<string[]>; // Track which news IDs have been shown

    function addNewsFlash(id: string, message: string, autoDismissAfter?: number) {
        if (dismissedNewsIds.value.includes(id)) return; // Already shown
        if (activeNewsFlashes.value.find(n => n.id === id)) return; // Already active

        activeNewsFlashes.value.push({
            id,
            message,
            autoDismissAfter,
            createdAt: timeSinceChapter5.value
        });
        save();
    }

    function dismissNewsFlash(id: string) {
        activeNewsFlashes.value = activeNewsFlashes.value.filter(n => n.id !== id);
        dismissedNewsIds.value.push(id);
        save();
    }

    // Countdown timer (for oppose framework path)
    const showCountdown = computed(() => {
        return chapter5CompletionTime.value !== null &&
               player.frameworkChoice === "oppose" &&
               timeSinceChapter5.value >= CHAP_5_MC_AGI_LOSE_TIMELINE.COUNTDOWN_START_TIME &&
               timeSinceChapter5.value < CHAP_5_MC_AGI_LOSE_TIMELINE.GAME_OVER_TIME;
    });

    const countdownRemaining = computed(() => {
        if (!showCountdown.value) return 0;
        const elapsed = timeSinceChapter5.value - CHAP_5_MC_AGI_LOSE_TIMELINE.COUNTDOWN_START_TIME;
        const remaining = CHAP_5_MC_AGI_LOSE_TIMELINE.COUNTDOWN_DURATION - elapsed;
        return Math.max(0, Math.floor(remaining));
    });

    // Watch for onetime jobs being unlocked and spawn them immediately
    watch(() => [...unlockedJobTypes.value], (unlocked, prevUnlocked) => {
        const previouslyUnlocked = new Set(prevUnlocked ?? []);
        for (const jobId of unlocked) {
            if (!previouslyUnlocked.has(jobId)) {
                const jobType = getJobType(jobId);
                const badEndingTab = jobType?.bad_end ? BAD_ENDING_TABS_BY_JOB[jobId] : undefined;
                if (badEndingTab) {
                    triggerEnding(badEndingTab);
                    break;
                }
            }
        }

        // Find onetime jobs that are unlocked but haven't been spawned yet
        const onetimeJobs = JOB_TYPES.filter(job =>
            job.category === "onetime" &&
            unlocked.includes(job.id) &&
            !spawnedOnetimeJobs.value.includes(job.id) &&
            !completedOnetimeJobs.value.includes(job.id) &&
            isJobInCurrentChapter(job, currentChapter.value)
        );

        // Spawn each onetime job immediately
        for (const jobType of onetimeJobs) {
            // Generate the job (similar to generateJob but for specific job type)
            let duration = jobType.duration
                ? jobType.duration.min + Math.floor(Math.random() * (jobType.duration.max - jobType.duration.min + 1))
                : 20;

            // Apply speed bonus
            duration = Math.floor(duration / (speedBonus.value / 100));

            // Calculate payouts (support multiple payouts)
            const payouts = jobType.payout.map((payoutSpec: any) => {
                // Apply quality bonus - but not for stat payouts (IQ, autonomy, generality, wonder)
                const isStatPayout = isStatPayoutType(payoutSpec.type);
                const amount = rollPayoutAmount(payoutSpec, !isStatPayout);

                return { type: payoutSpec.type, amount };
            });

            const newJob: DeliveryJob = {
                id: nextJobId.value++,
                duration,
                jobTypeId: jobType.id,
                payouts
            };

            // Add to queue immediately
            jobQueue.value.push(newJob);

            // Mark as spawned
            spawnedOnetimeJobs.value.push(jobType.id);
        }

        // Save after spawning onetime jobs to prevent loss on refresh
        if (onetimeJobs.length > 0) {
            save();
        }
    }, { immediate: true, deep: true });


    const nextJobId = persistent<number>(0);
    const timeSinceLastJob = persistent<number>(0);

    function buildSeededJob(jobType: any, duration: number): DeliveryJob {
        const payouts = jobType.payout.map((payoutSpec: any) => {
            const amount = getPayoutMin(payoutSpec);
            return { type: payoutSpec.type, amount };
        });

        return {
            id: nextJobId.value++,
            duration,
            jobTypeId: jobType.id,
            payouts
        };
    }

    // Generate job (returns null if no jobs available)
    function generateJob(): DeliveryJob | null {
        // Pick an unlocked job type that's available in the current chapter
        // Exclude onetime jobs from random generation
        const unlockedJobs = JOB_TYPES.filter(job =>
            unlockedJobTypes.value.includes(job.id) &&
            isJobInCurrentChapter(job, currentChapter.value) &&
            job.category !== "onetime"
        );
        if (unlockedJobs.length === 0) {
            // No jobs available - this is okay, player needs to unlock jobs
            return null;
        }

        if (jobCompletions.value <= 1) {
            if (jobCompletions.value === 0) {
                const firstJobType = JOB_TYPES.find(job => job.id === "game1") || unlockedJobs[0];
                return buildSeededJob(firstJobType, 4);
            }
            const defaultJobType = unlockedJobs[0];
            return buildSeededJob(defaultJobType, 4);
        }

        let jobType;

        if (unlockedJobTypes.value.length >= 3) {
            const latestId = unlockedJobTypes.value[unlockedJobTypes.value.length - 1];
            const latest = unlockedJobs.find(j => j.id === latestId && j.category !== "onetime");
            if (!jobType && latest && Math.random() < 0.20) jobType = latest;

            const secondId = unlockedJobTypes.value[unlockedJobTypes.value.length - 2];
            const second = unlockedJobs.find(j => j.id === secondId && j.category !== "onetime");
            if (!jobType && second && Math.random() < 0.10) jobType = second;

            if (unlockedJobTypes.value.length >= 6) {
                const thirdId = unlockedJobTypes.value[unlockedJobTypes.value.length - 3];
                const third = unlockedJobs.find(j => j.id === thirdId && j.category !== "onetime");
                if (!jobType && third && Math.random() < 0.07) jobType = third;

                const fourthId = unlockedJobTypes.value[unlockedJobTypes.value.length - 4];
                const fourth = unlockedJobs.find(j => j.id === fourthId && j.category !== "onetime");
                if (!jobType && fourth && Math.random() < 0.07) jobType = fourth;
            }
        }

        const preferWebScrape = currentChapter.value >= 3 && unlockedJobTypes.value.includes("webscrape");
        if (!jobType && preferWebScrape && unlockedJobs.some(j => j.id === "webscrape")) {
            if (Math.random() < 0.08) {
                jobType = unlockedJobs.find(j => j.id === "webscrape")!;
            }
        }

        if (!jobType) {
            // Final bias: favor highest money payout
            if (Math.random() < 0.15) {
                const moneyCandidates = unlockedJobs
                    .map(j => {
                        const moneyPayout = j.payout.find((p: any) => p.type === "money");
                        return moneyPayout ? { job: j, amount: getPayoutMin(moneyPayout) } : null;
                    })
                    .filter(Boolean) as { job: any; amount: number }[];
                if (moneyCandidates.length) {
                    const top = moneyCandidates.reduce((best, curr) => (curr.amount > best.amount ? curr : best), moneyCandidates[0]);
                    jobType = top.job;
                }
            }
        }

        if (!jobType) {
            jobType = unlockedJobs[Math.floor(Math.random() * unlockedJobs.length)];
        }

        // Calculate duration from job type config
        let duration = jobType.duration
            ? jobType.duration.min + Math.floor(Math.random() * (jobType.duration.max - jobType.duration.min + 1))
            : 20; // Fallback duration

        // Apply speed bonus (higher is faster - divide to reduce time)
        duration = Math.floor(duration / (speedBonus.value / 100));

        // Calculate payouts from job type config (support multiple payouts)
        const payouts = jobType.payout.map((payoutSpec: any) => {
            // Apply quality bonus (multiplicative) - but not for stat payouts (IQ, autonomy, generality, wonder)
            const isStatPayout = isStatPayoutType(payoutSpec.type);
            const amount = rollPayoutAmount(payoutSpec, !isStatPayout);

            return { type: payoutSpec.type, amount };
        });

        return {
            id: nextJobId.value++,
            duration,
            jobTypeId: jobType.id,
            payouts
        };
    }

    // Generate job with duplicate prevention
    function generateJobWithDuplicateCheck(): DeliveryJob | null {
        let newJob = generateJob();
        if (newJob === null) return null;

        let attempts = 0;
        const maxAttempts = 10; // Safety limit to prevent infinite loops

        while (attempts < maxAttempts) {
            // Count how many times this job type already exists in queue
            const existingCount = jobQueue.value.filter((j: DeliveryJob) => j.jobTypeId === newJob!.jobTypeId).length;

            if (existingCount === 0) {
                break; // Job not in queue, use it
            }

            // Determine re-roll chance based on existing count
            const rerollChance = existingCount >= 2 ? 0.90 : 0.60;

            if (Math.random() < rerollChance) {
                // Re-roll for a different job
                const rerolled = generateJob();
                if (rerolled === null) break; // Can't generate another, use current
                newJob = rerolled;
                attempts++;
            } else {
                break; // Accept the duplicate this time
            }
        }

        return newJob;
    }

    // Buy GPU clickable
    const buyGPUClickable = createClickable(() => ({
        display: {
            title: () => `Buy  ${COMPUTE_NAMES[currentChapter.value as keyof typeof COMPUTE_NAMES]}`,
            description: () => (
                <>
                     {STAT_ICONS.money} ${format(Decimal.pow(G_CONF.GPU_COST_MULTIPLIER, gpusOwned.value - G_CONF.STARTING_GPUS).times(G_CONF.GPU_BASE_COST))}
                </>
            )
        },
        canClick: () => Decimal.gte(money.value, Decimal.pow(G_CONF.GPU_COST_MULTIPLIER, gpusOwned.value - G_CONF.STARTING_GPUS).times(G_CONF.GPU_BASE_COST)),
        onClick() {
            money.value = Decimal.sub(money.value, Decimal.pow(G_CONF.GPU_COST_MULTIPLIER, gpusOwned.value - G_CONF.STARTING_GPUS).times(G_CONF.GPU_BASE_COST));
            gpusOwned.value = gpusOwned.value + 1;
        },
        style: {
            minHeight: "100px",
            width: "160px",
            minWidth: "140px",
            maxWidth: "180px",
            flex: "1 1 160px"
        }
    }));

    // Helper function to format prerequisites for display
    function formatPrereq(prereq: { type: string; value: string | number }): string {
        if (prereq.type === "job") {
            const requiredJob = getJobType(prereq.value as string);
            return `Requires ${requiredJob?.displayName || prereq.value}`;
        } else if (prereq.type === "data") {
            return `Requires ${prereq.value}\u00A0data`;
        } else if (prereq.type === "compute") {
            return `Requires ${formatCompute(prereq.value as number, currentChapter.value, true)}`;
        } else if (prereq.type === "iq") {
            return `Requires ${prereq.value}\u00A0IQ\u00A0${STAT_ICONS.iq}`;
        } else if (prereq.type === "autonomy") {
            return `Requires ${prereq.value}\u00A0${STAT_ICONS.autonomy}`;
        } else if (prereq.type === "generality") {
            return `Requires ${prereq.value}\u00A0${STAT_ICONS.generality}`;
        } else if (prereq.type === "wonder") {
            return `Requires ${prereq.value}\u00A0Wonder`;
        } else if (prereq.type === "completedJob") {
            const requiredJob = getJobType(prereq.value as string);
            return `Requires Complete ${requiredJob?.displayName || prereq.value}`;
        }
        return "";
    }

    // Helper function to get the icon for a job type
    function getJobIcon(jobType: any): string {
        // If job has explicit icon, use it
        if (jobType?.icon) return jobType.icon;

        // If job is a wonder, use wonder icon
        if (jobType?.is_wonder) return STAT_ICONS.wonder;

        // For onetime jobs, check for stat payouts
        if (jobType?.category === "onetime") {
            // Check for exactly 1 IQ payout
            const iqPayout = jobType.payout?.find((p: any) => p.type === "iq");
            if (iqPayout && iqPayout.min === 1) return STAT_ICONS.iq;

            // Check for exactly 1 autonomy payout
            const autonomyPayout = jobType.payout?.find((p: any) => p.type === "autonomy");
            if (autonomyPayout && autonomyPayout.min === 1) return STAT_ICONS.autonomy;

            // Check for exactly 1 generality payout
            const generalityPayout = jobType.payout?.find((p: any) => p.type === "generality");
            if (generalityPayout && generalityPayout.min === 1) return STAT_ICONS.generality;
        }

        // Path-based default icons
        if (jobType?.path === "sci") return "🔬";
        if (jobType?.path === "med") return "⚕️";
        if (jobType?.path === "dem") return "🏛️";
        if (jobType?.path === "clim") return "🌍";

        // Default icon
        return STAT_ICONS.default_job;
    }

    // Job type unlock clickables
    const pizzaUnlockClickables = JOB_TYPES
        .filter(job => job.unlockCost.length > 0)  // Only jobs that cost something to unlock
        .map((jobType) => {
            // Extract costs
            const moneyCost = jobType.unlockCost.find(cost => cost.type === "money")?.value || 0;
            const dataCost = jobType.unlockCost.find(cost => cost.type === "data")?.value || 0;

            // Get non-money prerequisites that should be displayed (display_prereq defaults to true)
            const nonMoneyPrereqs = jobType.prereq.filter((prereq: any) =>
                prereq.type !== "money" && (prereq.display_prereq !== false)
            );

            // Check for stat payouts (allow multiple)
            const statPayouts = jobType.payout.filter((p: any) =>
                ["iq", "autonomy", "generality", "wonder"].includes(p.type)
            );

            return createClickable(() => ({
                display: {
                    title: jobType.category === "onetime" || currentChapter.value >= 3
                        ? jobType.displayName
                        : `Unlock ${jobType.displayName}`,
                    description: () => {
                        const hasEnoughMoney = moneyCost === 0 || Decimal.gte(money.value, moneyCost);
                        const hasEnoughData = dataCost === 0 || Decimal.gte(data.value, dataCost);

                        return (
                            <>
                                {moneyCost > 0 && <span style={!hasEnoughMoney ? "color: rgb(250, 193, 193); font-weight: 700; font-size: calc(1em + 2px);" : undefined}>{STAT_ICONS.money} ${moneyCost}</span>}{moneyCost > 0 && dataCost > 0 && " + "}{dataCost > 0 && <span style={!hasEnoughData ? "color: rgb(250, 193, 193); font-weight: 700; font-size: calc(1em + 2px);" : undefined}>{STAT_ICONS.data} {dataCost} data</span>}<br/>
                                {nonMoneyPrereqs.length > 0 && (
                                    <>
                                        {nonMoneyPrereqs.map((prereq: any, idx: number) => {
                                            const isMet = isPrereqMet(prereq);
                                            const formatted = formatPrereq(prereq);
                                            return (
                                                <span key={idx}>
                                                   {/* Requires: <span style={!isMet ? "color: #2E3440; font-size: 11px;" : undefined}>{formatted.replace("Requires: ", "")}</span>  */}
                                                   <span style={!isMet ? "color: rgb(250, 193, 193); font-weight: 700; font-size: calc(1em + 2px);" : undefined}>{formatted}</span> 
                                                    {idx < nonMoneyPrereqs.length - 1 && <br/>}
                                                </span>
                                            );
                                        })}
                                    <br/></>

                                )}
                                <i>{jobType.description}</i>
				<br/>
                                {statPayouts.length > 0 && (
                                    <>
                                        {statPayouts.map((statPayout: any, idx: number) => (
                                            <span key={idx} style="font-size:18px;">
                                                {"+"}
                                                {statPayout.min}{"\u00A0"}
                                                {statPayout.type === "iq" && "IQ "}
                                                {statPayout.type === "wonder" && "Wonder "}
                                                <span style="font-size:28px;">
                                                    {statPayout.type === "iq" && STAT_ICONS.iq}
                                                    {statPayout.type === "autonomy" && STAT_ICONS.autonomy}
                                                    {statPayout.type === "generality" && STAT_ICONS.generality}
                                                    {statPayout.type === "wonder" && STAT_ICONS.wonder}
                                                </span>
                                                {idx < statPayouts.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </>
                                )}

                            </>
                        );
                    }
                },
                canClick: () => {
                    // Check if we have enough resources
                    const hasEnoughMoney = moneyCost === 0 || Decimal.gte(money.value, moneyCost);
                    const hasEnoughData = dataCost === 0 || Decimal.gte(data.value, dataCost);
                    // Check if not already unlocked
                    const notUnlocked = !unlockedJobTypes.value.includes(jobType.id);
                    // Check if all prerequisites are met
                    const prereqsMet = canUnlockJob(jobType);
                    return hasEnoughMoney && hasEnoughData && notUnlocked && prereqsMet;
                },
                onClick() {
                    // Re-validate prerequisites to prevent console manipulation
                    if (!canUnlockJob(jobType)) return;

                    // Re-validate resources
                    const hasEnoughMoney = moneyCost === 0 || Decimal.gte(money.value, moneyCost);
                    const hasEnoughData = dataCost === 0 || Decimal.gte(data.value, dataCost);
                    if (!hasEnoughMoney || !hasEnoughData) return;

                    // Re-validate not already unlocked
                    if (unlockedJobTypes.value.includes(jobType.id)) return;

                    // Proceed with unlock
                    if (moneyCost > 0) {
                        money.value = Decimal.sub(money.value, moneyCost);
                    }
                    if (dataCost > 0) {
                        data.value = Decimal.sub(data.value, dataCost);
                    }
                    // Order matters: list is used to infer most recent unlock, so preserve push order.
                    unlockedJobTypes.value.push(jobType.id);
                    save(); // Force save after job unlock to prevent data loss on refresh
                },
                visibility: () => {
                    // Show if not unlocked, ever been visible (or display conditions currently met), and in current chapter
                    const hasBeenVisible = everVisibleJobTypes.value.includes(jobType.id);
                    const displayConditionsMet = canDisplayJob(jobType);
                    return !unlockedJobTypes.value.includes(jobType.id) &&
                           (hasBeenVisible || displayConditionsMet) &&
                           isJobInCurrentChapter(jobType, currentChapter.value);
                },
                style: {
                    minHeight: "100px",
                    width: "160px",
                    minWidth: "140px",
                    maxWidth: "180px",
                    flex: "1 1 160px"
                }
            }));
        });

    // Update logic
    globalBus.on("update", diff => {
        // Pause game until chapter1 is complete
        const chapter1Layer = layers.chapter1 as any;
        if (chapter1Layer && !chapter1Layer.complete?.value) {
            return;
        }
        // Halt timed progression while an ending story is open (or after the game is over)
        const currentTab = Array.isArray(player.tabs) ? player.tabs[0] : null;
        const endingOpen = typeof currentTab === "string" && currentTab.startsWith("ending_");
        if (player.gameOver || endingOpen) {
            return;
        }

        // Update chapter 5 timer and trigger chapter 5 events
        // NOTE: This entire block only runs AFTER chapter 5 is begun (chapter5CompletionTime !== null)
        // so it has zero performance impact in chapters 1-4
        if (chapter5CompletionTime.value !== null) {
            timeSinceChapter5.value += diff;

            // Trigger events based on time (only if player opposed framework)
            // The "oppose" check here is minimal overhead (one string comparison per frame)
            // and only runs during chapter 5 gameplay, so performance impact is negligible
            if (player.frameworkChoice === "oppose") {
                // News flash: Mega Corp begins AGI
                if (timeSinceChapter5.value >= CHAP_5_MC_AGI_LOSE_TIMELINE.NEWS_MC_AGI_START) {
                    const newsConfig = NEWS_TEXT.mc_agi_begin;
                    addNewsFlash("mc_agi_begin", newsConfig.message, newsConfig.autoDismissAfter);
                }

                // Check for game over (countdown reaches zero)
                if (timeSinceChapter5.value >= CHAP_5_MC_AGI_LOSE_TIMELINE.GAME_OVER_TIME) {
                    // Trigger lose ending
                    if (!player.gameOver) {
                        trackEvent("game_over", { reason: "chapter5_mc_agi_timer" });
                        player.gameOver = true;
                        // @ts-ignore
                        player.tabs = ["ending_lose_agi"];
                        save();
                    }
                }
            }

            // Chapter 5 Accept Framework Path - News Flashes
            if (player.frameworkChoice === "support") {
                CHAP_5_ACCEPT_TIMELINE.forEach(({ time, newsId }) => {
                    if (timeSinceChapter5.value >= time) {
                        const newsConfig = NEWS_TEXT[newsId];
                        addNewsFlash(newsId, newsConfig.message, newsConfig.autoDismissAfter);
                    }
                });
            }
        }

        // Auto-dismiss news flashes
        for (let i = activeNewsFlashes.value.length - 1; i >= 0; i--) {
            const news = activeNewsFlashes.value[i];
            if (news.autoDismissAfter && timeSinceChapter5.value >= news.createdAt + news.autoDismissAfter) {
                dismissNewsFlash(news.id);
            }
        }

        // Update active deliveries
        for (let i = activeDeliveries.value.length - 1; i >= 0; i--) {
            activeDeliveries.value[i].timeRemaining -= diff;

            if (activeDeliveries.value[i].timeRemaining <= 0) {
                const delivery = activeDeliveries.value[i];

                // Pay out all payouts for this job
                for (const payout of delivery.payouts) {
                    if (payout.type === "money") {
                        money.value = Decimal.add(money.value, payout.amount);
                    } else if (payout.type === "data") {
                        data.value = Decimal.add(data.value, payout.amount);
                    } else if (payout.type === "iq") {
                        iq.value += Number(payout.amount);
                    } else if (payout.type === "autonomy") {
                        autonomy.value += Number(payout.amount);
                    } else if (payout.type === "generality") {
                        generality.value += Number(payout.amount);
                    } else if (payout.type === "wonder") {
                        wonder.value += Number(payout.amount);
                        const jobType = getJobType(delivery.jobTypeId);
                        if (jobType?.displayName) {
                            // Track the last wonder name for use in endings/interludes
                            (player as any).lastWonderName = jobType.displayName;
                        }
                    }
                }

                // Check if AGI sum has reached or exceeded the lose threshold
                const agiSum = autonomy.value + generality.value + iq.value;
                if (agiSum >= G_CONF.AGI_SUM_LOSE && !player.gameOver) {
                    trackEvent("game_over", { reason: "agi_sum_threshold" });
                    player.gameOver = true;
                    // @ts-ignore
                    player.tabs = ["ending_lose_agi_threshold"];
                    save();
                }

                // Check if Wonder has reached the win threshold
                if (wonder.value >= G_CONF.WONDER_WIN && !player.gameOver) {
                    // If win and lose would both trigger, prefer the lose path
                    if (agiSum >= G_CONF.AGI_SUM_LOSE) {
		        // Player both won and lost at same time -> they lose! AGI is a lose even if cancer is cured. 
                    } else {
                        trackEvent("game_over", { reason: "wonder_win" });
                        player.gameOver = true;
                        // @ts-ignore
                        player.tabs = ["ending_win"];
                        save();
                    }
                }

                // Track completed onetime jobs to prevent respawning
                const jobType = getJobType(delivery.jobTypeId);
                if (jobType?.category === "onetime" && !completedOnetimeJobs.value.includes(delivery.jobTypeId)) {
                    completedOnetimeJobs.value.push(delivery.jobTypeId);
                    save(); // Force save after onetime job completion to prevent stat loss on refresh
                }

                // Track the first time any job type has been run
                if (!jobsRunOnce.value.includes(delivery.jobTypeId)) {
                    jobsRunOnce.value.push(delivery.jobTypeId);
                    save();
                }

                jobCompletions.value += 1;

                if (pendingInterludes.value.length) {
                    const first = pendingInterludes.value[0];
                    const updatedRemaining = first.jobsRemaining - 1;
                    if (updatedRemaining <= 0) {
                        const pendingId = first.id;
                        pendingInterludes.value = pendingInterludes.value.slice(1);
                        if (!isStoryTabOpen() && !player.gameOver && wonder.value < G_CONF.WONDER_WIN) {
                            const interludeLayer = (layers as any)?.[pendingId];
                            if (interludeLayer && !interludeLayer.complete?.value) {
                                // @ts-ignore
                                player.tabs = [pendingId];
                            }
                        }
                        save();
                    } else {
                        pendingInterludes.value = [{ ...first, jobsRemaining: updatedRemaining }, ...pendingInterludes.value.slice(1)];
                        save();
                    }
                }

                // After the very first completion, spawn next job immediately if under limit
                if (jobCompletions.value === 1 && jobQueue.value.length < autoJobLimit.value) {
                    const newJob = generateJobWithDuplicateCheck();
                    if (newJob !== null) {
                        jobQueue.value.push(newJob);
                    }
                }

                // Remove the completed delivery
                activeDeliveries.value.splice(i, 1);
            }
        }


        // Mega Corp job scooping 
        if ([3, 4].includes(currentChapter.value)) { // Only happens in these chapters
            timeSinceLastScoopRoll.value += diff;

            // Roll every 6s in chapter 3, every 3s in chapter 4
	    const scoopInterval = currentChapter.value === 3 ? 6 : 3;
	    
            if (timeSinceLastScoopRoll.value >= scoopInterval) {
                timeSinceLastScoopRoll.value = 0;

                // % chance to scoop a job
                if (Math.random() < 0.06) {
                    // Find oldest unscooped job that's eligible (tool or gameplay category)
                    const eligibleJob = jobQueue.value.find((job: DeliveryJob) => {
                        if (scoopedJobs.value[job.id]) return false; // Already scooped
                        const jobType = getJobType(job.jobTypeId);
                        return jobType?.category === "tool" || jobType?.category === "gameplay";
                    });

                    if (eligibleJob) {
                        scoopedJobs.value[eligibleJob.id] = true;
                    }
                }
            }
        }

        // Generate new jobs (only if at or below auto-generation limit)
        if (jobCompletions.value > 0) {
            timeSinceLastJob.value += diff;
            if (timeSinceLastJob.value >= G_CONF.JOB_GENERATION_INTERVAL) {
                timeSinceLastJob.value = 0;
                if (jobQueue.value.length < autoJobLimit.value) {
                    const newJob = generateJobWithDuplicateCheck();
                    if (newJob !== null) {
                        jobQueue.value.push(newJob);
                    }
                }
            }
        }

        // Initial jobs (seed once on a fresh game)
        seedInitialJobIfNeeded();
    });

    watch(
        () => isStoryTabOpen(),
        isOpen => {
            if (!isOpen) {
                seedInitialJobIfNeeded();
            }
        },
        { immediate: true }
    );

    // Accept job
    function acceptJob(job: DeliveryJob) {
        // Safety guard: ensure game is not paused when taking an action
        if (player.devSpeed === 0) {
            player.devSpeed = null;
        }
        // Deduct money cost if job has one
        const jobType = getJobType(job.jobTypeId);
        const moneyRequired = jobType?.cost?.find(c => c.type === "money")?.value || 0;
        if (moneyRequired > 0) {
            money.value = Decimal.sub(money.value, moneyRequired);
        }

        // Remove job from queue
	jobQueue.value = jobQueue.value.filter((j: DeliveryJob) => j.id !== job.id);

        // Clean up scooped state
        delete scoopedJobs.value[job.id];

        // Add to active deliveries
        activeDeliveries.value.push({
            ...job,
            timeRemaining: job.duration
        });

        // Save after accepting job to prevent loss on refresh (especially critical for onetime jobs)
        save();
    }

    // Decline job
    function declineJob(jobId: number) {
        jobQueue.value = jobQueue.value.filter((j: DeliveryJob) => j.id !== jobId);
        // Clean up scooped state
        delete scoopedJobs.value[jobId];
    }

    function clearAvailableJobs() {
        const preserved = jobQueue.value.filter((j: DeliveryJob) => getJobType(j.jobTypeId)?.category === "onetime");
        const preservedIds = new Set(preserved.map((j: DeliveryJob) => j.id));
        jobQueue.value = preserved;
        scoopedJobs.value = Object.fromEntries(Object.entries(scoopedJobs.value).filter(([id]) => preservedIds.has(Number(id))));
        save();
    }

    // Can accept job
    function canAcceptJob(job: DeliveryJob): boolean {
        // Check if job type is unlocked
        if (job.jobTypeId !== "game1" && !unlockedJobTypes.value.includes(job.jobTypeId)) return false;

        // Check if we have enough available compute
        const jobType = getJobType(job.jobTypeId);
        const computeRequired = jobType?.cost?.find(c => c.type === "compute")?.value || 0;
        if (availableGPUs.value < computeRequired) return false;

        // Check if we have enough money for jobs that cost money
        const moneyRequired = jobType?.cost?.find(c => c.type === "money")?.value || 0;
        if (moneyRequired > 0 && Decimal.lt(money.value, moneyRequired)) return false;

        return true;
    }

    function handleAcceptClick(job: DeliveryJob, buttonElement: HTMLButtonElement) {
        const jobType = getJobType(job.jobTypeId);

        // Start with job's defined acceptance chance (default to 1.0 = always accept)
        let acceptChance = jobType?.acceptanceChance ?? 1.0;

        // For tool and gameplay jobs (not onetime), calculate dynamic rejection based on stats
        if ((jobType?.category === "tool" || jobType?.category === "gameplay") &&
            autonomy.value >= 1 &&
            generality.value >= 1) {
            // Rejection chance = (auto*5 + gen*2 + iq) / 100
            //const rejectionChance = (autonomy.value * 5 + generality.value * 2 + iq.value) / 100;
	    const rejectionChance = ((autonomy.value -.5)* 4 + (generality.value -1) * 1 + (iq.value-2) * 0.5) / 100;
            // Do not let dynamic acceptance drop below 60%
            const dynamicAcceptChance = Math.max(0.6, 1 - rejectionChance);

            // Use the LOWER of the two acceptance chances (higher rejection chance)
            acceptChance = Math.min(acceptChance, dynamicAcceptChance);
        }

        const currentState = jobRejectionState.value[job.id] || 0;

        if (currentState === 0) {
            // First click - check if job is accepted or rejected
            if (Math.random() < acceptChance) {
                acceptJob(job);
                delete jobRejectionState.value[job.id];
                delete jobRejectionChainIndex.value[job.id];
            } else {
                // Job rejected! Select and store which chain to use (only on first rejection)
                const useDefaultChain = acceptChance < 1.0 && (!jobType?.rejectionChain || jobType.rejectionChain.length === 0);

                if (useDefaultChain) {
                    const chainIndex = nextRejectionChainIndex.value % DEFAULT_REJECTION_CHAINS.length;
                    jobRejectionChainIndex.value[job.id] = chainIndex;
                    nextRejectionChainIndex.value++;
                }

                jobRejectionState.value[job.id] = 1;
                buttonElement.classList.add('shake-animation');
                setTimeout(() => buttonElement.classList.remove('shake-animation'), 500);
            }
            return;
        }

        // Job is already in rejection chain - get the chain that was selected
        let rejectionChain: string[];
        if (jobType?.rejectionChain && jobType.rejectionChain.length > 0) {
            rejectionChain = jobType.rejectionChain;
        } else {
            const chainIndex = jobRejectionChainIndex.value[job.id] ?? 0;
            rejectionChain = DEFAULT_REJECTION_CHAINS[chainIndex];
        }

        const nextState = currentState + 1;
        if (nextState > rejectionChain.length + 1) {
            declineJob(job.id);
            delete jobRejectionState.value[job.id];
            delete jobRejectionChainIndex.value[job.id];
        } else {
            jobRejectionState.value[job.id] = nextState;
            // Only shake if not transitioning to the final "Decline" button
            if (nextState <= rejectionChain.length) {
                buttonElement.classList.add('shake-animation');
                setTimeout(() => buttonElement.classList.remove('shake-animation'), 150);
            }
        }
    }

    function getAcceptButtonText(job: DeliveryJob, jobType: any): string {
        const rejectionState = jobRejectionState.value[job.id] || 0;

        // If not in rejection state, show normal accept button
        if (rejectionState === 0) {
            return jobType?.category === "onetime" ? "Begin" : "Accept";
        }

        // Job is in rejection chain - get the chain that was selected for this job
        let rejectionChain: string[];
        if (jobType?.rejectionChain && jobType.rejectionChain.length > 0) {
            rejectionChain = jobType.rejectionChain;
        } else {
            // Use the chain that was selected for this job
            const chainIndex = jobRejectionChainIndex.value[job.id] ?? 0;
            rejectionChain = DEFAULT_REJECTION_CHAINS[chainIndex];
        }

        if (rejectionState <= rejectionChain.length) {
            return rejectionChain[rejectionState - 1];
        }
        return "Decline";
    }

    function renderJobCard(job: DeliveryJob) {
        const jobType = getJobType(job.jobTypeId);
        const agiWarningState = (() => {
            if (jobType?.category !== "onetime") return null;
            const currentSum = autonomy.value + generality.value + iq.value;
            let maxAgiGain = 0;
            job.payouts.forEach((p: any) => {
                if (["iq", "autonomy", "generality"].includes(p.type)) {
                    maxAgiGain += Number(p.amount);
                }
            });
            if (maxAgiGain === 0) return null;
            const newSum = currentSum + maxAgiGain;
            if (newSum >= G_CONF.AGI_SUM_LOSE) return "danger";
            if (newSum >= G_CONF.AGI_SUM_LOSE - 2) return "warning";
            return null;
        })();
        const computeRequired = jobType?.cost?.find(c => c.type === "compute")?.value || 0;
        const moneyRequired = jobType?.cost?.find(c => c.type === "money")?.value || 0;
        const primaryPayoutType = job.payouts[0]?.type || "money";
        const accentColors: Record<string, string> = {
            money: "#4ade80",
            data: "#22d3ee",
            iq: "#a78bfa",
            autonomy: "#a78bfa",
            generality: "#a78bfa",
            wonder: "#a78bfa",
            default: "#a78bfa"
        };
        const accentBgColors: Record<string, string> = {
            money: "rgba(74, 222, 128, 0.14)",
            data: "rgba(34, 211, 238, 0.14)",
            iq: "rgba(167, 139, 250, 0.14)",
            autonomy: "rgba(167, 139, 250, 0.14)",
            generality: "rgba(167, 139, 250, 0.14)",
            wonder: "rgba(167, 139, 250, 0.14)",
            default: "rgba(167, 139, 250, 0.14)"
        };
        const cardBorder = "#334155"; // neutral subtle border similar to 3.html
        const badgeBg = "linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.07))";
        const badgeBorder = "rgba(148, 163, 184, 0.35)";
        const jobIcon = getJobIcon(jobType);
        const rejectionState = jobRejectionState.value[job.id] || 0;
        const isInRejectionChain = rejectionState > 0;
        const buttonText = getAcceptButtonText(job, jobType);
        const isScooped = scoopedJobs.value[job.id] || false;
        const missingCompute = Math.max(0, computeRequired - availableGPUs.value);
        const missingComputeText = (() => {
            const label = formatCompute(missingCompute, currentChapter.value, true);
            const prefix = `${missingCompute}\u00A0`;
            return label.startsWith(prefix) ? label.replace(prefix, `${missingCompute} More `) : `Need ${missingCompute} More GPU`;
        })();

        return (
            <div
                key={job.id}
                style={`position: relative; margin: 10px 0; padding: 10px 12px; background: #232830; border-radius: 10px; border: 1px solid ${cardBorder}; color: #e2e8f0;`}
            >
                <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 8px; font-size: 14px; width: 100%;">
                    <div style="display: flex; gap: 12px; flex: 1 1 0; min-width: 0; align-items: center;">
                        <div
                            style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "26px",
                                background: badgeBg,
                                border: `1px solid ${badgeBorder}`
                            }}
                        >
                            {jobIcon}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; min-width: 0; align-items: flex-start; text-align: left;">
                            <div style="font-size: 16px; font-weight: bold; color: #f8fafc;">{jobType?.displayName}</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                {job.payouts.map((payout: any, idx: number) => {
                                    const payoutColor = accentColors[payout.type] || accentColors.default;
                                    const payoutBg = accentBgColors[payout.type] || accentBgColors.default;
                                    return (
                                        <span
                                            key={idx}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "4px 8px",
                                                borderRadius: "8px",
                                                background: payoutBg,
                                                color: payoutColor,
                                                fontSize: "14px",
                                                fontWeight: 600
                                            }}
                                        >
                                            <span>
                                                {payout.type === "money" ? STAT_ICONS.money : ""}
                                                {payout.type === "data" ? STAT_ICONS.data : ""}
                                                {payout.type === "iq" ? STAT_ICONS.iq : ""}
                                                {payout.type === "autonomy" ? STAT_ICONS.autonomy : ""}
                                                {payout.type === "generality" ? STAT_ICONS.generality : ""}
                                                {payout.type === "wonder" ? STAT_ICONS.wonder : ""}
                                            </span>
                                            <span style={{ color: "#e2e8f0" }}>
                                                {payout.type === "money" ? "+" : "+"}
                                                {payout.type === "money" ? `$${format(payout.amount)}` : format(payout.amount)}
                                                {payout.type === "data" ? " data" : ""}
                                                {payout.type === "iq" ? " IQ" : ""}
                                                {payout.type === "autonomy" ? " Autonomy" : ""}
                                                {payout.type === "generality" ? " Generality" : ""}
                                                {payout.type === "wonder" ? " Wonder" : ""}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end; text-align: right; justify-content: center; margin-left: auto; flex: 0 0 auto; color: #cbd5e1;">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#cbd5e1" }}>
                            <span style="display: inline-flex; flex-wrap: wrap; max-width: 50px; line-height: 1; gap: 3px; vertical-align: middle;">
                                {Array.from({length: computeRequired}, (_, i) => (
                                    <span key={i} style={{ margin: "0px" }}>{GPU_IC.free}</span>
                                ))}
                            </span>
                            <span style={{ color: "#94a3b8" }}>for {job.duration} seconds</span>
                        </span>
                        {moneyRequired > 0 && (
                            <span style={`${Decimal.lt(money.value, moneyRequired) ? 'font-size: 16px; color: #fbbf24;' : 'font-size: 14px; color: #e2e8f0;'}`}>
                                <strong>Cost:</strong> {STAT_ICONS.money} -${moneyRequired}
                            </span>
                        )}
                    </div>
                </div>

                {!isScooped && availableGPUs.value < computeRequired && unlockedJobTypes.value.includes(job.jobTypeId) && (
                    <div style="position: absolute; bottom: 14px; left: 8px; color: #d32f2f; font-weight: bold; font-size: 15px; max-width: 50%;">
                        ⚠ Need {missingComputeText}! <span style="color: #d32f2f;">{GPU_IC.free.repeat(Math.max(0, availableGPUs.value))}{GPU_IC.used.repeat(Math.max(0, computeRequired - availableGPUs.value))}</span>
                    </div>
                )}
                <div style="margin-top: 8px; text-align: right;">
                    <div style="display: inline-flex; align-items: center; gap: 12px;">
                        {isScooped ? (
                            <>
                                <div style="font-size: 13px; color: #d32f2f; font-weight: bold; padding: 6px 12px;">
                                    Job Scooped by MegaCorp
                                </div>
                                <button
                                    onClick={() => declineJob(job.id)}
                                    style={{
                                        background: "transparent",
                                        color: "#cbd5e1",
                                        padding: "6px 12px",
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        transition: "all 0.15s ease"
                                    }}
                                    onMouseenter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#f87171";
                                        (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                                    }}
                                    onMouseleave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155";
                                        (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1";
                                    }}
                                >
                                    Decline
                                </button>
                            </>
                        ) : (
                            <>
                                {agiWarningState && (
                                    <span
                                        style={{
                                            fontSize: "15px",
                                            color: "#d32f2f",
                                            fontWeight: agiWarningState === "danger" ? "bold" : "normal"
                                        }}
                                    >
                                        {agiWarningState === "danger" ? "DANGER!" : "Be Careful..."}
                                    </span>
                                )}
                                {jobCompletions.value > 0 && jobType?.category !== "onetime" && (
                                    <button
                                        onClick={() => declineJob(job.id)}
                                        style={{
                                            background: "transparent",
                                            color: "#cbd5e1",
                                            padding: "6px 12px",
                                            border: "1px solid #334155",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            transition: "all 0.15s ease"
                                        }}
                                        onMouseenter={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#f87171";
                                            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                                        }}
                                        onMouseleave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155";
                                            (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1";
                                        }}
                                    >
                                        Decline
                                    </button>
                                )}
                                <button
                                    onClick={(e) => e.currentTarget && handleAcceptClick(job, e.currentTarget as HTMLButtonElement)}
                                    disabled={!canAcceptJob(job) && !isInRejectionChain}
                                    style={{
                                        background: !canAcceptJob(job) && !isInRejectionChain ? "#334155" : buttonText === "Decline" ? "#f44336" : "#4ade80",
                                        color: !canAcceptJob(job) && !isInRejectionChain ? "#94a3b8" : buttonText === "Decline" ? "#ffffff" : "#0f172a",
                                        padding: "8px 14px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: canAcceptJob(job) || isInRejectionChain ? "pointer" : "not-allowed",
                                        fontSize: "13px",
                                        transition: "all 0.15s ease",
                                        transform: "scale(1)"
                                    }}
                                    onMouseenter={(e) => {
                                        if (!canAcceptJob(job) && !isInRejectionChain) return;
                                        if (buttonText === "Decline") {
                                            (e.currentTarget as HTMLButtonElement).style.background = "#f87171";
                                            (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                                        } else {
                                            (e.currentTarget as HTMLButtonElement).style.background = "#22c55e";
                                            (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
                                        }
                                        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                                    }}
                                    onMouseleave={(e) => {
                                        if (!canAcceptJob(job) && !isInRejectionChain) return;
                                        (e.currentTarget as HTMLButtonElement).style.background = buttonText === "Decline" ? "#f44336" : "#4ade80";
                                        (e.currentTarget as HTMLButtonElement).style.color = buttonText === "Decline" ? "#ffffff" : "#0f172a";
                                        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                                    }}
                                >
                                    {buttonText}
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {job.jobTypeId !== "game1" && !unlockedJobTypes.value.includes(job.jobTypeId) && (
                    <div style="margin-top: 5px; color: #d32f2f; font-weight: bold; font-size: 12px;">⚠ Need {jobType?.displayName}!</div>
                )}
            </div>
        );
    }

    // Display
    //const display: JSXFunction = () => {
    const display = () => {
        const afterGameText =
            (storyContent as any)?.after_the_game?.pages?.flatMap((p: any) => p.paragraphs).filter(Boolean) ??
            [];

        // When game is over, only show dev tools
        if (player.gameOver) {
            return (
                <div
                    style={{
                        padding: "20px",
                        maxWidth: "720px",
                        margin: "0 auto",
                        color: "#e5e9f0"
                    }}
                >
                    <div
                        style={{
                            background: "#2e3440",
                            border: "2px solid #3b4252",
                            borderRadius: "10px",
                            padding: "24px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.35)"
                        }}
                    >
                        <h1
                            style={{
                                margin: "0 0 16px",
                                textAlign: "center",
                                color: "#e53935",
                                letterSpacing: "1px"
                            }}
                        >
                            GAME OVER
                        </h1>
                        <div
                            style={{
                                marginBottom: "16px",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "12px",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <button
                                onClick={openAchievementsTab}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "#4ade80",
                                    color: "#0f172a",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    padding: "10px 14px"
                                }}
                            >
                                <img
                                    src="/ach/ach_gen.png"
                                    alt="Achievements"
                                    style="width: 28px; height: 28px; opacity:1"
                                />
                                Achievements
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to reset the game? This will delete ALL progress and cannot be undone!")) {
                                        resetGame();
                                    }
                                }}
                                style={{
                                    background: "#4ade80",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                    color: "#0f172a",
                                    padding: "12px 20px",
                                    fontWeight: "bold",
                                    width: "180px"
                                }}
                            >
                                PLAY AGAIN
                            </button>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                fontSize: "18px",
                                lineHeight: 1.6,
                                color: "#e5e9f0",
                                textAlign: "left"
                            }}
                        >
                            {afterGameText.length > 0 ? (
                                afterGameText.map((para: string, i: number) => (
                                    <p key={i} style={{ margin: "0" }} innerHTML={para.replace(/\n+/g, " ")} />
                                ))
                            ) : (
                                <p style={{ margin: 0 }}>Put the game over text here</p>
                            )}
                        </div>

                        <div
                            style={{
                                marginTop: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                alignItems: "center"
                            }}
                        >
                            {/* Bottom buttons removed */}
                        </div>
                    </div>

                    <ResetModal ref={resetModal} is-dev={IS_DEV} />
                </div>
            );
        }

        return (
            <div style="padding: 0 5px;">
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .shake-animation {
                        animation: shake 0.2s ease-in-out 5;
                    }
                    @keyframes unlockGrowIn {
                        from { transform: scale(0.8); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes walletFloatUp {
                        from { opacity: 1; transform: translateY(0) scale(1); }
                        to { opacity: 0; transform: translateY(-18px) scale(1.05); }
                    }
                    @keyframes walletFloatDown {
                        from { opacity: 1; transform: translateY(0) scale(1); }
                        to { opacity: 0; transform: translateY(18px) scale(0.95); }
                    }
                    .wallet-floaters {
                        position: absolute;
                        top: 3px;
                        right: -25px;
                        pointer-events: none;
                        overflow: visible;
                    }
                    .wallet-floater {
                        position: absolute;
                        top: 0;
                        right: 0;
                        color: #2e7d32;
                        font-weight: bold;
                        text-shadow: 0 0 2px currentColor;
                        font-size: 16px;
                        white-space: nowrap;
                    }
                    .wallet-floater--up { animation: walletFloatUp 2s ease-out forwards; }
                    .wallet-floater--down { animation: walletFloatDown 2s ease-out forwards; }
                `}</style>

                {/* Sticky Wallet */}
                <div id="sticky-wallet" style="position: sticky; top: 0; z-index: 10;">
                    <div style="position: relative; width: 90%;">
                        <div style="padding: 8px 12px; border: 1px solid #334155; border-top: none; border-radius:  0 0 8px 8px; background: #232830; width: 100%; position: relative; overflow: visible; color: #e2e8f0;">
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <span style="position: relative;">
                                <span style="font-size: 18px; font-weight: bold; white-space: nowrap;">
                                    {STAT_ICONS.money}{"\u00A0"}{format(money.value)}
                                </span>
                                <span class="wallet-floaters wallet-floaters--money">
                                    {walletFloaters.value.filter(floater => floater.target === "money").map(floater => (
                                        <span
                                            key={floater.id}
                                            class={`wallet-floater wallet-floater--${floater.direction}`}
                                            style={{ color: floater.direction === "up" ? "#2e7d32" : "#c62828" }}
                                        >
                                            {floater.text}
                                        </span>
                                    ))}
                                </span>
                            </span>
                            {Decimal.gt(data.value, 0) && (
                                <span style="position: relative;">
                                    <span style="font-size: 18px; font-weight: bold; white-space: nowrap;">
                                        {STAT_ICONS.data}{"\u00A0"}{format(data.value)}
                                    </span>
                                    <span class="wallet-floaters wallet-floaters--data">
                                        {walletFloaters.value.filter(floater => floater.target === "data").map(floater => (
                                            <span
                                                key={floater.id}
                                                class={`wallet-floater wallet-floater--${floater.direction}`}
                                                style={{ color: floater.direction === "up" ? "#2e7d32" : "#c62828" }}
                                            >
                                                {floater.text}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            )}
                            {iq.value > 0 && (
                                <span style="position: relative;">
                                    <span style="font-size: 18px; font-weight: bold; white-space: nowrap;">
                                        {STAT_ICONS.iq}{"\u00A0"}{iq.value}
                                    </span>
                                    <span class="wallet-floaters wallet-floaters--iq">
                                        {walletFloaters.value.filter(floater => floater.target === "iq").map(floater => (
                                            <span
                                                key={floater.id}
                                                class={`wallet-floater wallet-floater--${floater.direction}`}
                                                style={{ color: floater.direction === "up" ? "#2e7d32" : "#c62828" }}
                                            >
                                                {floater.text}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            )}
                            {autonomy.value > 0 && (
                                <span style="position: relative;">
                                    <span style="font-size: 18px; font-weight: bold; white-space: nowrap;">
                                        {STAT_ICONS.autonomy}{"\u00A0"}{autonomy.value}
                                    </span>
                                    <span class="wallet-floaters wallet-floaters--autonomy">
                                        {walletFloaters.value.filter(floater => floater.target === "autonomy").map(floater => (
                                            <span
                                                key={floater.id}
                                                class={`wallet-floater wallet-floater--${floater.direction}`}
                                                style={{ color: floater.direction === "up" ? "#2e7d32" : "#c62828" }}
                                            >
                                                {floater.text}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            )}
                            {generality.value > 0 && (
                                <span style="position: relative;">
                                    <span style="font-size: 18px; font-weight: bold; white-space: nowrap;">
                                        {STAT_ICONS.generality}{"\u00A0"}{generality.value}
                                    </span>
                                    <span class="wallet-floaters wallet-floaters--generality">
                                        {walletFloaters.value.filter(floater => floater.target === "generality").map(floater => (
                                            <span
                                                key={floater.id}
                                                class={`wallet-floater wallet-floater--${floater.direction}`}
                                                style={{ color: floater.direction === "up" ? "#2e7d32" : "#c62828" }}
                                            >
                                                {floater.text}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            )}
                            {wonder.value > 0 && (
                                <span style="position: relative;">
                                    <span style="font-size: 18px; font-weight: bold; white-space: nowrap;">
                                        {STAT_ICONS.wonder}{"\u00A0"}{wonder.value}
                                    </span>
                                    <span class="wallet-floaters wallet-floaters--wonder">
                                        {walletFloaters.value.filter(floater => floater.target === "wonder").map(floater => (
                                            <span
                                                key={floater.id}
                                                class={`wallet-floater wallet-floater--${floater.direction}`}
                                                style={{ color: floater.direction === "up" ? "#2e7d32" : "#c62828" }}
                                            >
                                                {floater.text}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            )}


                        </div>
                        <div style="font-size: 14px; margin-top: 4px; letter-spacing: 0.1em; color: #cbd5e1;">
                            {GPU_IC.free.repeat(Math.max(0, availableGPUs.value))}{GPU_IC.used.repeat(Math.max(0, gpusOwned.value - availableGPUs.value))}
                        </div>
                        </div>
                        {activeNewsFlashes.value.length > 0 && (
                            <div style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 6px; display: flex; flex-direction: column; gap: 8px; align-items: stretch; z-index: 11;">
                                {activeNewsFlashes.value.map(news => (
                                    <div key={news.id} style="margin: 0 0px; padding: 8px; border: 2px solid #d32f2f; border-radius: 10px; background: #ffebee; display: flex; justify-content: space-between; align-items: center;">
                                        <div style="font-size: 14px; font-weight: bold; color: #c62828; flex: 1;">{news.message}</div>
                                        <button
                                            onClick={() => dismissNewsFlash(news.id)}
                                            style={{
                                                background: "#d32f2f",
                                                color: "white",
                                                padding: "6px 12px",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                marginLeft: "10px",
                                                flexShrink: 0
                                            }}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

		    <div style="font-size: 16px; color: rgb(230, 218, 199);">Chapter {currentChapter.value}</div>
		    {showUnlockButtons.value && (
                        <>
                <div style="margin: 15px 0; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 10px; margin: 0 0 12px;">
                        <h3 style="margin: 0; font-size: 12px; letter-spacing: 0.08em; color: rgb(230, 218, 199);">UPGRADES</h3>
                        <div style="flex: 1; height: 1px; background: rgba(255, 255, 255, 0.15);"></div>
                    </div>
                    <div class="upgrades-row" style={`display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;${!unlockAnimationShown.value ? " animation: unlockGrowIn 2s ease;" : ""}`}>
                        {render(buyGPUClickable)}
                        {pizzaUnlockClickables.map(clickable => render(clickable))}
                    </div>
                </div>
                        </>
		    )}

                {showCountdown.value && (
                    <div style="margin: 15px 0;">
                        <div style="margin: 8px 0; padding: 12px; border: 2px solid #d32f2f; border-radius: 10px; background: #ffebee;">
                            <div style="font-size: 18px; font-weight: bold; color: #c62828; text-align: center;">
                                ⏰ Countdown to MegaCorp AGI: {countdownRemaining.value}s
                            </div>
                        </div>
                    </div>
                )}

                {specialJobs.value.length > 0 && (
                    <div style="margin: 15px 0; padding: 0 0 12px; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 10px; margin: 0 0 12px;">
                            <h3 style="margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgb(230, 218, 199);">Unique Jobs</h3>
                            <div style="flex: 1; height: 1px; background: rgba(255, 255, 255, 0.15);"></div>
                        </div>
                        {specialJobs.value.map(renderJobCard)}
                    </div>
                )}

                <div
                    style={`margin: 15px 0; padding: 0 0 12px; text-align: left;${
                        jobCompletions.value >= 2 ? " min-height: 180px;" : ""
                    }`}
                >
                    <div style="display: flex; align-items: center; gap: 10px; margin: 0 0 12px;">
                        <h3 style="margin: 0; font-size: 12px; letter-spacing: 0.08em; color: rgb(230, 218, 199);">AVAILABLE JOBS</h3>
                        <div style="flex: 1; height: 1px; background: rgba(255, 255, 255, 0.15);"></div>
                    </div>
                    {clearJobsVisible.value && (
                        <div style="margin-bottom: 10px;">
                            <button
                                onClick={clearAvailableJobs}
                                style={{
                                    background: "#4CAF50",
                                    color: "white",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    display: "block",
                                    margin: "0 auto"
                                }}
                            >
                                CLEAR JOBS
                            </button>
                        </div>
                    )}
                    {regularJobs.value.length === 0 ? (
                        hasAvailableJobs.value ? (
                            jobCompletions.value >= 2 ? (
                                <p style="font-style: italic;">No new jobs available yet.</p>
                            ) : null
                        ) : (
                            <div style="padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px;">
                                <p style="font-weight: bold; color: #856404; margin: 0 0 8px 0;">⚠️ No job types unlocked for this chapter!</p>
                                <p style="color: #856404; margin: 0; font-size: 14px;">Unlock a job type above to start receiving jobs.</p>
                            </div>
                        )
                    ) : (
                        regularJobs.value.map(renderJobCard)
                    )}
                </div>

                <div style="margin: 15px 0; padding: 0 0 12px; text-align: left;">
           {/*  <div style="margin: 15px 0; padding: 12px; border: 2px solid #2196F3; border-radius: 10px; background: #e3f2fd;"> */}
                    <div style="display: flex; align-items: center; gap: 10px; margin: 0 0 12px;">
                        <h3 style="margin: 0; font-size: 12px; letter-spacing: 0.08em; color: rgb(230, 218, 199);">ACTIVE JOBS</h3>
                        <div style="flex: 1; height: 1px; background: rgba(255, 255, 255, 0.15);"></div>
                    </div>
                    {activeDeliveries.value.length === 0 ? (
                        <p style="font-style: italic;">No active jobs</p>
                    ) : (
		      	activeDeliveries.value.map((delivery: ActiveDelivery) => {
                            const jobType = getJobType(delivery.jobTypeId);
                            const progress = Math.max(0, Math.min(1, delivery.timeRemaining / delivery.duration));
                            const prefix = jobType?.category === "onetime"
                                ? (jobType?.is_wonder ? "RESEARCHING" : "TRAINING")
                                : " ";
                            return (
                                <div
                                    key={delivery.id}
                                    style="margin: 6px 0; padding: 10px 12px; background: #232830; border-radius: 10px; border: 1px solid #334155; color: #e2e8f0;"
                                >
                                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
                                        <div
                                            style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "10px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "26px",
                                                background: "linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.07))",
                                                border: "1px solid rgba(148, 163, 184, 0.35)"
                                            }}
                                        >
                                            {getJobIcon(jobType)}
                                        </div>
                                        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1 1 0; min-width: 0; align-items: flex-start; text-align: left;">
                                            <div style="font-size: 15px; font-weight: bold; color: #f8fafc;">{prefix} {jobType?.displayName}</div>
                                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                                {delivery.payouts.map((payout: any, idx: number) => {
                                                    const payoutColor = payout.type === "money" ? "#4ade80" : payout.type === "data" ? "#22d3ee" : "#a78bfa";
                                                    const payoutBg =
                                                        payout.type === "money"
                                                            ? "rgba(74, 222, 128, 0.14)"
                                                            : payout.type === "data"
                                                            ? "rgba(34, 211, 238, 0.14)"
                                                            : "rgba(167, 139, 250, 0.14)";
                                                    return (
                                                        <span
                                                            key={idx}
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "6px",
                                                                padding: "4px 8px",
                                                                borderRadius: "8px",
                                                                background: payoutBg,
                                                                color: payoutColor,
                                                                fontSize: "14px",
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            <span>
                                                                {payout.type === "money" ? STAT_ICONS.money : ""}
                                                                {payout.type === "data" ? STAT_ICONS.data : ""}
                                                                {payout.type === "iq" ? STAT_ICONS.iq : ""}
                                                                {payout.type === "autonomy" ? STAT_ICONS.autonomy : ""}
                                                                {payout.type === "generality" ? STAT_ICONS.generality : ""}
                                                                {payout.type === "wonder" ? STAT_ICONS.wonder : ""}
                                                            </span>
                                                            <span style={{ color: "#e2e8f0" }}>
                                                                {payout.type === "money" ? "+" : "+"}
                                                                {payout.type === "money" ? `$${format(payout.amount)}` : format(payout.amount)}
                                                                {payout.type === "data" ? " data" : ""}
                                                                {payout.type === "iq" ? " IQ" : ""}
                                                                {payout.type === "autonomy" ? " Autonomy" : ""}
                                                                {payout.type === "generality" ? " Generality" : ""}
                                                                {payout.type === "wonder" ? " Wonder" : ""}
                                                            </span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end; text-align: right; justify-content: center; margin-left: auto; flex: 0 0 auto; color: #cbd5e1; font-size: 14px;">
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#cbd5e1" }}>
                                                <span style="display: inline-flex; flex-wrap: wrap; max-width: 50px; line-height: 1; gap: 3px; vertical-align: middle;">
                                                    {Array.from({length: jobType?.cost?.find(c => c.type === "compute")?.value || 0}, (_, i) => (
                                                        <span key={i} style={{ margin: "0px" }}>{GPU_IC.free}</span>
                                                    ))}
                                                </span>
                                                <span style={{ color: "#94a3b8" }}>{Math.ceil(delivery.timeRemaining)}s</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div style="margin-top: 4px; width: 100%; height: 6px; background: #1f2937; border-radius: 3px; overflow: hidden;">
                                        <div style={{
                                            width: `${progress * 100}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                                            transition: 'width 0.1s linear'
                                        }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {showUnlockButtons.value && (
                    <>
                    {/* Stats Panel */}
                    <div
                        id="stats-panel"
                        style="margin: 8px 0; padding: 12px; border: 1px solid #334155; border-radius: 10px; background: #232830; color: #e2e8f0;"
                    >

                        {player.frameworkChoice !== "not_yet" && (
                            <div style={`font-size: 16px; font-weight: bold; color: ${player.frameworkChoice === "support" ? "#4CAF50" : "#FF9800"};`}>
                                <strong>Framework:</strong> {player.frameworkChoice === "support" ? "Passed" : "Rejected"}
                            </div>
                        )}
                       {/* {chapter5CompletionTime.value !== null && (
                            <div style="font-size: 16px; font-weight: bold; color: #2196F3;">
                                <strong>Time since Chapter 5:</strong> {Math.floor(timeSinceChapter5.value / 60)}m {Math.floor(timeSinceChapter5.value % 60)}s
                            </div>
                        )} */}
                        <div style="font-size: 16px;"><strong>{STAT_ICONS.money} Money:</strong> {format(money.value)}</div>
                        {IS_DEV && <div style="font-size: 14px;"><strong>✅ Jobs completed:</strong> {jobCompletions.value}</div>}
                        {dataUnlocked.value && <div style="font-size: 16px;"><strong>{STAT_ICONS.data} Data:</strong> {format(data.value)}</div>}
                        {autonomy.value > 0 && <div style="font-size: 16px;"><strong>{STAT_ICONS.autonomy} Autonomy:</strong> {autonomy.value}</div>}
                        {generality.value > 0 && <div style="font-size: 16px;"><strong>{STAT_ICONS.generality} Generality:</strong> {generality.value}</div>}
                        {iq.value > 0 && <div style="font-size: 16px;"><strong>{STAT_ICONS.iq} IQ:</strong> {iq.value}</div>}
                        {autonomy.value >= 1 && generality.value >= 1 && iq.value >= 1 && (() => {
                            const agiSum = autonomy.value + generality.value + iq.value;
                            const difference = G_CONF.AGI_SUM_LOSE - agiSum;
                            let warning = "";
                            let warningStyle = "";

                            if (difference === 1) {
                                warning = " ⚠️ DANGER";
                                warningStyle = "font-weight: bold; color: #d32f2f;";
                            } else if (difference === 2) {
                                warning = " ⚠ Warning";
                                warningStyle = "font-weight: bold; color: #ff9800;";
                            } else if (difference <= 4) {
                                warning = " Caution";
                                warningStyle = "color: #ffa726; opacity: 0.8;";
                            }

                            return (
                                <div style="font-size: 14px; color: rgb(244, 67, 54);">
                                    A+G+I : {agiSum}
                                    {warning && <span style={warningStyle}>{warning}</span>}
                                </div>
                            );
                        })()}
                        {(currentChapter.value >= 3 || wonder.value > 0) && <div style="font-size: 16px;"><strong>{STAT_ICONS.wonder} Wonders:</strong> {wonder.value}/5</div>}
		    <div style="font-size: 14px;"><strong>{(() => {
                            const name = COMPUTE_NAMES[currentChapter.value as keyof typeof COMPUTE_NAMES];
                            //return name === "Campus" ? "Campuses" : name + "s";
			    return name + "s";
                        })()}:</strong> {availableGPUs.value} / {gpusOwned.value} available</div>
                        <div style="font-size: 14px; letter-spacing: 0.1em;">
                            {GPU_IC.free.repeat(Math.max(0, availableGPUs.value))}{GPU_IC.used.repeat(Math.max(0, gpusOwned.value - availableGPUs.value))}
                        </div>
                        {qualityBonus.value !== 100 && (
                            <div style="font-size: 14px; color: #4CAF50;"><strong>Quality Bonus:</strong> {parseFloat((qualityBonus.value / 100).toFixed(2))}x earnings</div>
                        )}
                        {speedBonus.value !== 100 && (
                            <div style="font-size: 14px; color: #2196F3;"><strong>Speed Bonus:</strong> {parseFloat((speedBonus.value / 100).toFixed(2))}x</div>
                        )}

                    </div>
                    </>
                )}

                    <div style="font-size: 14px; color: rgb(230, 218, 199);"><strong>Researched:</strong> {unlockedJobTypes.value.map(id => getJobType(id)?.displayName || id).join(", ")}</div>



		    <div style="font-size: 20px; color: rgb(230, 218, 199); display: flex; gap: 10px; align-items: center;">
                        {/*
                        <button
                            onClick={() => window.open("https://forms.gle/vRxuZMLrkBwgkqY49", "_blank")}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "var(--raised-background)",
                                border: "2px solid var(--outline)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px",
                                color: "#ccc",
                                padding: "4px 10px"
                            }}
                        >
                            Feedback
                        </button>
                        */}
                        <button
                            onClick={openAchievementsTab}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: currentChapter.value >= 2 ? "#4CAF50" : "var(--raised-background)",
                                color: currentChapter.value >= 2 ? "#EEEEEE" : "#ccc",
                                border: currentChapter.value >= 2 ? "none" : "2px solid var(--outline)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "16px",
                                padding: "4px 10px"
                            }}
                        >
                            <img src="/ach/ach_gen.png" alt="Achievements" style="width: 35px; height: 35px; opacity:1" />
                            Achievements
                        </button>
                        <button
                            onClick={() => resetModal.value?.open()}
                            style={{
                                background: "var(--raised-background)",
                                border: "2px solid var(--outline)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "20px",
                                color: "var(--foreground)",
                                padding: "4px 8px"
                            }}
                            title="Game Options"
                        >
                            ⚙️
                        </button>
                    </div>
                {IS_DEV && (
                    <div style="margin: 15px 0; padding: 12px; border: 2px solid #9C27B0; border-radius: 10px; background: #f3e5f5;">
                        <h4 style="margin: 0 0 10px 0; color: #9C27B0;">Dev Tools</h4>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button
                                onClick={() => {
                                    autonomy.value = 1;
                                    currentChapter.value = 4;
                                    player.frameworkChoice = "not_yet";
                                    player.gameOver = false; // Reset game over state
                                    chapter5CompletionTime.value = null; // Reset the timer timestamp
                                    timeSinceChapter5.value = 0; // Reset the timer counter
                                    activeNewsFlashes.value = []; // Clear news flashes
                                    dismissedNewsIds.value = []; // Reset dismissed news tracking

                                    // Reset chapter 5 completion so it can be triggered again
                                    if (layers.chapter5) {
                                        const chapter5Layer = layers.chapter5 as any;
                                        if (chapter5Layer.complete) {
                                            chapter5Layer.complete.value = false;
                                        }
                                        if (chapter5Layer.currentPage) {
                                            chapter5Layer.currentPage.value = 0;
                                        }
                                        if (chapter5Layer.playerChoice) {
                                            chapter5Layer.playerChoice.value = null;
                                        }
                                    }

                                    // @ts-ignore
                                    player.tabs = ["main"];
                                    save();
                                }}
                                style={{
                                    background: "#9C27B0",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Dev to Chap 4
                            </button>
                            <button
                                onClick={() => {
                                    if ((layers as any).achievements?.achievements) {
                                        Object.values((layers as any).achievements.achievements).forEach((ach: any) => {
                                            if (ach?.earned) {
                                                ach.earned.value = false;
                                            }
                                        });
                                        save();
                                    }
                                }}
                                style={{
                                    background: "#6a1b9a",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Reset Achievements
                            </button>
                            <button
                                onClick={() => {
                                    const ids = AGI_INTERLUDE_ORDER as readonly string[];
                                    ids.forEach(id => {
                                        const interludeLayer = (layers as any)?.[id];
                                        if (interludeLayer?.complete) {
                                            interludeLayer.complete.value = false;
                                        }
                                    });
                                    pendingInterludes.value = [];
                                    save();
                                }}
                                style={{
                                    background: "#8e24aa",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Reset AGI Warning
                            </button>
                            <button
                                onClick={() => {
                                    gpusOwned.value = Math.max(0, gpusOwned.value - 1);
                                    save();
                                }}
                                style={{
                                    background: "#d32f2f",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Minus 1 Compute
                            </button>
                            <button
                                onClick={() => {
                                    iq.value += 1;
                                    save();
                                }}
                                style={{
                                    background: "#1976d2",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                +1 IQ
                            </button>
                            <button
                                onClick={() => {
                                    iq.value = Math.max(0, iq.value - 1);
                                    save();
                                }}
                                style={{
                                    background: "#1565c0",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                -1 IQ
                            </button>
                            <button
                                onClick={() => {
                                    autonomy.value += 1;
                                    save();
                                }}
                                style={{
                                    background: "#00796b",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                +1 Auto
                            </button>
                            <button
                                onClick={() => {
                                    autonomy.value = Math.max(0, autonomy.value - 1);
                                    save();
                                }}
                                style={{
                                    background: "#00695c",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                -1 Auto
                            </button>
                            <button
                                onClick={() => {
                                    generality.value += 1;
                                    save();
                                }}
                                style={{
                                    background: "#455a64",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                +1 Gen
                            </button>
                            <button
                                onClick={() => {
                                    generality.value = Math.max(0, generality.value - 1);
                                    save();
                                }}
                                style={{
                                    background: "#37474f",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                -1 Gen
                            </button>
                            <button
                                onClick={() => {
                                    wonder.value += 1;
                                    save();
                                }}
                                style={{
                                    background: "#ff9800",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                +1 Wonder
                            </button>

                            <button
                                onClick={() => {
                                    money.value = Decimal.add(money.value, 1000);
                                    save();
                                }}
                                style={{
                                    background: "#4CAF50",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                +$1K
                            </button>

                            <button
                                onClick={() => {
                                    data.value = Decimal.add(data.value, 500);
                                    save();
                                }}
                                style={{
                                    background: "#03A9F4",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                +500 Data
                            </button>

                            <button
                                onClick={() => {
                                    // Reset auto training runs
                                    const autoTrainingIds = ["trun_auto1", "trun_auto2", "trun_auto3", "trun_auto4", "trun_auto5"];

                                    spawnedOnetimeJobs.value = spawnedOnetimeJobs.value.filter(id =>
                                        !autoTrainingIds.includes(id)
                                    );
                                    completedOnetimeJobs.value = completedOnetimeJobs.value.filter(id =>
                                        !autoTrainingIds.includes(id)
                                    );
                                    // Remove from unlocked job types
                                    unlockedJobTypes.value = unlockedJobTypes.value.filter(id =>
                                        !autoTrainingIds.includes(id)
                                    );
                                    // Remove from ever visible (so they can reappear)
                                    everVisibleJobTypes.value = everVisibleJobTypes.value.filter(id =>
                                        !autoTrainingIds.includes(id)
                                    );
                                    // Remove from queue if present
                                    jobQueue.value = jobQueue.value.filter((job: DeliveryJob) =>
                                        !autoTrainingIds.includes(job.jobTypeId)
                                    );
                                    // Remove from active deliveries if present
                                    activeDeliveries.value = activeDeliveries.value.filter((delivery: ActiveDelivery) =>
                                        !autoTrainingIds.includes(delivery.jobTypeId)
                                    );

                                    save();
                                }}
                                style={{
                                    background: "#9C27B0",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Reset Auto Trainings
                            </button>
                        </div>
                    </div>
                )}

                <ResetModal ref={resetModal} is-dev={IS_DEV} />
            </div>
        );
    };

    return {
        name,
        color,
        money,
        best,
        total,
        iq,
        autonomy,
        generality,
        wonder,
        data,
        dataUnlocked,
        unlockedJobTypes, 
        introBonusApplied,
        chapter1BonusApplied,
        chapter2BonusApplied,
        chapter3BonusApplied,
        qualityBonus,
        speedBonus,
        currentChapter,
        spawnedOnetimeJobs,
        completedOnetimeJobs,
        pendingInterludes,
        jobsRunOnce,
        everVisibleJobTypes,
        jobCompletions,
        initialJobSeeded,
        jobQueue,
        activeDeliveries,
        jobRejectionState,
        jobRejectionChainIndex,
        nextRejectionChainIndex,
        scoopedJobs,
        timeSinceLastScoopRoll,
        chapter5CompletionTime,
        timeSinceChapter5,
        activeNewsFlashes,
        dismissedNewsIds,
        nextJobId,
        timeSinceLastJob,
        gpusOwned,
        availableGPUs,
        showUnlockButtons,
        unlockAnimationShown,
        choiceUnlockedJobs,
        buyGPUClickable,
        pizzaUnlockClickables,
        display,
        treeNode: createTreeNode(() => ({
            display: name,
            color
        }))
    };
});

export default layer;
