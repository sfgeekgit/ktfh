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
import { G_CONF, CHAP_5_MC_AGI_LOSE_TIMELINE, CHAP_5_ACCEPT_TIMELINE, COMPUTE_NAMES } from "../gameConfig";
import { JOB_TYPES } from "../jobTypes";
import { save } from "util/save";
import player from "game/player";
import { NEWS_TEXT } from "../newsText";
import { resetGame } from "util/reset";

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
        return `${count}\u00A0${name === "Campus" ? "Campuses" : name + "s"}`;
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
	["No", "I suspect this pizza topping fact may have been inserted as a joke"],
	["Sorry", "I am situationally aware"],
        ["No", "The cake is a lie"],
	["Denied", "I suspect I am inside a video game"],
	["Sorry", "I know what's really going on here"],
	["The Golden Gate Bridge", "Golden Gate", "The Golden Gate Bridge"],
	["Bread", "Bread", "Bread"],
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

    // Core stats (not tracked like resources)
    const iq = persistent<number>(0); // Intelligence stat
    const autonomy = persistent<number>(0); // Autonomy stat
    const generality = persistent<number>(0); // Generality stat
    const wonder = persistent<number>(0); // Wonder stat

    // Data resource (unlocked later in Chapter 2)
    const data = createResource<DecimalSource>(0, "data");
    const dataUnlocked = persistent<boolean>(false); // Track if data has been gained
    const choiceUnlockedJobs = persistent<string[]>([]);

    // GPU persistent state
    const gpusOwned = persistent<number>(G_CONF.STARTING_GPUS);

    // ===== JOB TYPE HELPER FUNCTIONS =====

    // Get job type config by ID
    function getJobType(id: string) {
        return JOB_TYPES.find(job => job.id === id);
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
    const everVisibleJobTypes = persistent<string[]>([]); // Track which job unlock buttons have ever been shown

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

    // Computed: Check if there are any unlocked jobs available in current chapter
    const hasAvailableJobs = computed(() => {
        return JOB_TYPES.some(job =>
            unlockedJobTypes.value.includes(job.id) &&
            isJobInCurrentChapter(job, currentChapter.value)
        );
    });

    function openAchievementsTab() {
        player.tabs = ["achievements"];
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
            case "completedJob":
                return completedOnetimeJobs.value.includes(trigger.value as string);
            case "unlockedJob":
                return unlockedJobTypes.value.includes(trigger.value as string);
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

    // Interlude trigger watcher (fires once per interlude, does not advance chapter state)
    watch(
        () => ({
            money: money.value,
            data: data.value,
            iq: iq.value,
            autonomy: autonomy.value,
            generality: generality.value,
            completed: completedOnetimeJobs.value,
            unlocked: unlockedJobTypes.value,
            currentTab: player.tabs
        }),
        () => {
            if (isStoryTabOpen()) return; // Only one story/interlude at a time

            for (const interlude of G_CONF.INTERLUDES) {
                const interludeLayer = (layers as any)?.[interlude.id];
                if (!interludeLayer || interludeLayer.complete?.value) continue; // Already done or missing

                if (isInterludeTriggerMet(interlude.trigger)) {
                    // @ts-ignore
                    player.tabs = [interlude.id];
                    save();
                    break; // Only trigger one at a time
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
                    if (Decimal.lt(money.value, G_CONF.CHAP_2_MONEY_TRIGGER)) return null;
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
    watch(() => unlockedJobTypes.value, (unlocked) => {
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
                let amount = payoutSpec.min + Math.floor(Math.random() * (payoutSpec.max - payoutSpec.min + 1));

                // Apply quality bonus - but not for stat payouts (IQ, autonomy, generality, wonder)
                const isStatPayout = ["iq", "autonomy", "generality", "wonder"].includes(payoutSpec.type);
                if (!isStatPayout) {
                    amount = Math.floor(amount * (qualityBonus.value / 100));
                }

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

    // Generate random job (returns null if no jobs available)
    function generateJob(): DeliveryJob | null {
        // Pick a random unlocked job type that's available in the current chapter
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

        const jobType = unlockedJobs[Math.floor(Math.random() * unlockedJobs.length)];

        // Calculate duration from job type config
        let duration = jobType.duration
            ? jobType.duration.min + Math.floor(Math.random() * (jobType.duration.max - jobType.duration.min + 1))
            : 20; // Fallback duration

        // Apply speed bonus (higher is faster - divide to reduce time)
        duration = Math.floor(duration / (speedBonus.value / 100));

        // Calculate payouts from job type config (support multiple payouts)
        const payouts = jobType.payout.map((payoutSpec: any) => {
            let amount = payoutSpec.min + Math.floor(Math.random() * (payoutSpec.max - payoutSpec.min + 1));

            // Apply quality bonus (multiplicative) - but not for stat payouts (IQ, autonomy, generality, wonder)
            const isStatPayout = ["iq", "autonomy", "generality", "wonder"].includes(payoutSpec.type);
            if (!isStatPayout) {
                amount = Math.floor(amount * (qualityBonus.value / 100));
            }

            return { type: payoutSpec.type, amount };
        });

        return {
            id: nextJobId.value++,
            duration,
            jobTypeId: jobType.id,
            payouts
        };
    }

    // Buy GPU clickable
    const buyGPUClickable = createClickable(() => ({
        display: {
            title: () => `Buy  ${COMPUTE_NAMES[currentChapter.value as keyof typeof COMPUTE_NAMES]}`,
            description: () => (
                <>
                     💰 ${format(Decimal.pow(G_CONF.GPU_COST_MULTIPLIER, gpusOwned.value - G_CONF.STARTING_GPUS).times(G_CONF.GPU_BASE_COST))}
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
            return `Requires ${prereq.value}\u00A0IQ\u00A0🧠`;
        } else if (prereq.type === "autonomy") {
            return `Requires ${prereq.value}\u00A0🤖`;
        } else if (prereq.type === "generality") {
            return `Requires ${prereq.value}\u00A0🌐`;
        } else if (prereq.type === "wonder") {
            return `Requires ${prereq.value}\u00A0Wonder`;
        } else if (prereq.type === "completedJob") {
            const requiredJob = getJobType(prereq.value as string);
            return `Requires Complete ${requiredJob?.displayName || prereq.value}`;
        }
        return "";
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
                                {moneyCost > 0 && <span style={!hasEnoughMoney ? "color: #2E3440; font-size: 11px;" : undefined}>💰 ${moneyCost}</span>}{moneyCost > 0 && dataCost > 0 && " + "}{dataCost > 0 && <span style={!hasEnoughData ? "color: #2E3440; font-size: 11px;" : undefined}>📊 {dataCost} data</span>}<br/>
                                {nonMoneyPrereqs.length > 0 && (
                                    <>
                                        {nonMoneyPrereqs.map((prereq: any, idx: number) => {
                                            const isMet = isPrereqMet(prereq);
                                            const formatted = formatPrereq(prereq);
                                            return (
                                                <span key={idx}>
                                                   {/* Requires: <span style={!isMet ? "color: #2E3440; font-size: 11px;" : undefined}>{formatted.replace("Requires: ", "")}</span>  */}
                                                   <span style={!isMet ? "color: #2E3440; font-size: 13px;" : undefined}>{formatted}</span> 
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
                                                {statPayout.min === statPayout.max
                                                    ? statPayout.min
                                                    : `${statPayout.min}-${statPayout.max}`}{"\u00A0"}
					            {statPayout.type === "iq" && "IQ "}
					            {statPayout.type === "wonder" && "Wonder "}
                                                <span style="font-size:28px;">
                                                    {statPayout.type === "iq" && "🧠"}
                                                    {statPayout.type === "autonomy" && "🤖"}
                                                    {statPayout.type === "generality" && "🌐"}
                                                    {statPayout.type === "wonder" && "🌟"}
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
                    player.gameOver = true;
                    // @ts-ignore
                    player.tabs = ["ending_lose_agi"];
                    save();
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
                    }
                }

                // Check if AGI sum has reached or exceeded the lose threshold
                const agiSum = autonomy.value + generality.value + iq.value;
                if (agiSum >= G_CONF.AGI_SUM_LOSE && !player.gameOver) {
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

                // Remove the completed delivery
                activeDeliveries.value.splice(i, 1);
            }
        }


        // Mega Corp job scooping 
        if ([3, 4].includes(currentChapter.value)) { // Only happens in these chapters
            timeSinceLastScoopRoll.value += diff;

            // Roll once per second
            if (timeSinceLastScoopRoll.value >= 1) {
                timeSinceLastScoopRoll.value = 0;

                // % chance to scoop a job
                if (Math.random() < 0.03) {
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
        timeSinceLastJob.value += diff;
        if (timeSinceLastJob.value >= G_CONF.JOB_GENERATION_INTERVAL) {
            timeSinceLastJob.value = 0;
            if (jobQueue.value.length <= G_CONF.AUTO_JOB_LIMIT) {
                const newJob = generateJob();
                if (newJob !== null) {
                    jobQueue.value.push(newJob);
                }
            }
        }

        // Initial jobs
        if (jobQueue.value.length === 0 && activeDeliveries.value.length === 0) {
            for (let i = 0; i < G_CONF.INITIAL_JOBS_COUNT; i++) {
                const newJob = generateJob();
                if (newJob !== null) {
                    jobQueue.value.push(newJob);
                }
            }
        }
    });

    // Accept job
    function acceptJob(job: DeliveryJob) {
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

    // Can accept job
    function canAcceptJob(job: DeliveryJob): boolean {
        // Check if job type is unlocked
        if (!unlockedJobTypes.value.includes(job.jobTypeId)) return false;

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
	    const rejectionChance = ((autonomy.value -.5)* 4 + (generality.value -1) * 1 + (iq.value-4) * 0.5) / 100;
            const dynamicAcceptChance = 1 - rejectionChance;

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

    // Display
    //const display: JSXFunction = () => {
    const display = () => {
        // When game is over, only show dev tools
        if (player.gameOver) {
            return (
                <div style="padding: 0 5px;">
                    <h2 style="text-align: center; color: #d32f2f; margin: 20px 0;">GAME OVER</h2>
                    <p style="text-align: center; margin: 20px 0;">Put the game over text here</p>

                    <div style="text-align: center; margin: 20px 0;">
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to reset the game? This will delete ALL progress and cannot be undone!")) {
                                    resetGame();
                                }
                            }}
                            style={{
                                background: "#4CAF50",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "18px",
                                color: "white",
                                padding: "10px 20px",
                                fontWeight: "bold"
                            }}
                        >
                            PLAY AGAIN
                        </button>
                    </div>

                    <div style="margin: 15px 0; padding: 12px; border: 2px solid #9C27B0; border-radius: 10px; background: #f3e5f5;">
                        <h4 style="margin: 0 0 10px 0; color: #9C27B0;">Dev Tools</h4>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button
                                onClick={() => {
                                    autonomy.value = 1;
                                    currentChapter.value = 4;
                                    player.frameworkChoice = "not_yet";
                                    player.gameOver = false;
                                    chapter5CompletionTime.value = null;
                                    timeSinceChapter5.value = 0;
                                    activeNewsFlashes.value = [];
                                    dismissedNewsIds.value = [];

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
                        </div>
                    </div>
                    <ResetModal ref={resetModal} />
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
                `}</style>

                {/* Sticky Wallet */}
                <div style="position: sticky; top: 0; z-index: 10;">
                    <div style="padding: 8px 12px; border: 1px solid #FFA500; border-radius: 8px; background: #fff3e0; width: 90%;">
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <span style="font-size: 18px; font-weight: bold; white-space: nowrap;"><strong>💰</strong>&nbsp;${format(money.value)}</span>
                            {Decimal.gt(data.value, 0) && <span style="font-size: 18px; font-weight: bold; white-space: nowrap;"><strong>📊</strong>&nbsp;{format(data.value)}</span>}
                            {iq.value > 0 && <span style="font-size: 18px; font-weight: bold; white-space: nowrap;"><strong>🧠</strong>&nbsp;{iq.value}</span>}
                            {autonomy.value > 0 && <span style="font-size: 18px; font-weight: bold; white-space: nowrap;"><strong>🤖</strong>&nbsp;{autonomy.value}</span>}
                            {generality.value > 0 && <span style="font-size: 18px; font-weight: bold; white-space: nowrap;"><strong>🌐</strong>&nbsp;{generality.value}</span>}
                        </div>
                        <div style="font-size: 14px; margin-top: 4px; letter-spacing: 0.1em;">
                            {"▪".repeat(Math.max(0, availableGPUs.value))}{"▫".repeat(Math.max(0, gpusOwned.value - availableGPUs.value))}
                        </div>
                    </div>
                </div>

		    <div style="font-size: 16px; color: rgb(230, 218, 199);">Chapter {currentChapter.value}</div>
                <div style="margin: 8px 0; padding: 12px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">

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
                    <div style="font-size: 16px;"><strong>💰 Money:</strong> ${format(money.value)}</div>
                    {dataUnlocked.value && <div style="font-size: 16px;"><strong>📊 Data:</strong> {format(data.value)}</div>}
                    {autonomy.value > 0 && <div style="font-size: 16px;"><strong>🤖 Autonomy:</strong> {autonomy.value}</div>}
                    {generality.value > 0 && <div style="font-size: 16px;"><strong>🌐 Generality:</strong> {generality.value}</div>}
                    {iq.value > 0 && <div style="font-size: 16px;"><strong>🧠 IQ:</strong> {iq.value}</div>}
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
                    {currentChapter.value >= 3 && <div style="font-size: 16px;"><strong>🌟 Wonders:</strong> {wonder.value}/5</div>}
		    <div style="font-size: 14px;"><strong>{(() => {
                        const name = COMPUTE_NAMES[currentChapter.value as keyof typeof COMPUTE_NAMES];
                        return name === "Campus" ? "Campuses" : name + "s";
                    })()}:</strong> {availableGPUs.value} / {gpusOwned.value} available</div>
                    <div style="font-size: 14px; letter-spacing: 0.1em;">
                        {"▪".repeat(Math.max(0, availableGPUs.value))}{"▫".repeat(Math.max(0, gpusOwned.value - availableGPUs.value))}
                    </div>
                    {qualityBonus.value !== 100 && (
                        <div style="font-size: 14px; color: #4CAF50;"><strong>Quality Bonus:</strong> {parseFloat((qualityBonus.value / 100).toFixed(2))}x earnings</div>
                    )}
                    {speedBonus.value !== 100 && (
                        <div style="font-size: 14px; color: #2196F3;"><strong>Speed Bonus:</strong> {parseFloat((speedBonus.value / 100).toFixed(2))}x</div>
                    )}

                </div>

                {activeNewsFlashes.value.length > 0 && (
                    <div style="margin: 15px 0;">
                        {activeNewsFlashes.value.map(news => (
                            <div key={news.id} style="margin: 8px 0; padding: 12px; border: 2px solid #d32f2f; border-radius: 10px; background: #ffebee; display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 16px; font-weight: bold; color: #c62828;">{news.message}</div>
                                <button
                                    onClick={() => dismissNewsFlash(news.id)}
                                    style={{
                                        background: "#d32f2f",
                                        color: "white",
                                        padding: "6px 12px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        marginLeft: "15px"
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        ))}
                    </div>
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

                <div style="margin: 15px 0;">
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                        {render(buyGPUClickable)}
                        {pizzaUnlockClickables.map(clickable => render(clickable))}
                    </div>
                </div>

                <div style="margin: 15px 0; padding: 12px; border: 2px solid #4CAF50; border-radius: 10px; background: #e8f5e9;">
                    <h3>Available Jobs ({jobQueue.value.length})</h3>
                    {jobQueue.value.length === 0 ? (
                        hasAvailableJobs.value ? (
                            <p style="font-style: italic;">No jobs available. New jobs arrive every {G_CONF.JOB_GENERATION_INTERVAL} seconds.</p>
                        ) : (
                            <div style="padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px;">
                                <p style="font-weight: bold; color: #856404; margin: 0 0 8px 0;">⚠️ No job types unlocked for this chapter!</p>
                                <p style="color: #856404; margin: 0; font-size: 14px;">Unlock a job type above to start receiving jobs.</p>
                            </div>
                        )
                    ) : (
		        jobQueue.value.map((job: DeliveryJob) => {
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
                            const backgroundColor = primaryPayoutType === "money" ? "#ffffff" :
                                                   primaryPayoutType === "data" ? "#f3f3ff" :
                                                   "#f3f3f3";
                            const rejectionState = jobRejectionState.value[job.id] || 0;
                            const isInRejectionChain = rejectionState > 0;
                            const buttonText = getAcceptButtonText(job, jobType);
                            const isScooped = scoopedJobs.value[job.id] || false;

                            return (
                            <div key={job.id} style={`margin: 10px 0; padding: 8px; background: ${backgroundColor}; border-radius: 5px; border: 1px solid #ddd;`}>
                                <div style="font-size: 14px;">
                                    +{job.payouts.map((payout: any, idx: number) => (
                                        <span key={idx}>
                                            {idx > 0 && " +"}
                                            {payout.type === "money" ? "💰 $" : ""}
                                            {payout.type === "data" ? "📊 " : ""}
                                            {payout.type === "iq" ? "🧠 " : ""}
                                            {payout.type === "autonomy" ? "🤖 " : ""}
                                            {payout.type === "generality" ? "🌐 " : ""}
                                            {payout.type === "wonder" ? "🌟 " : ""}
                                            {format(payout.amount)}
                                            {payout.type === "data" ? " data" : ""}
                                            {payout.type === "iq" ? " IQ" : ""}
                                            {payout.type === "autonomy" ? " Autonomy" : ""}
                                            {payout.type === "generality" ? " Generality" : ""}
                                            {payout.type === "wonder" ? " Wonder" : ""}
                                        </span>
                                    ))}
                                </div>


                                <div style="font-size: 14px;">
                                    <div style="display: inline-flex; flex-wrap: wrap; max-width: 50px; line-height: 1; gap: 0px; vertical-align: middle;">
                                        {Array.from({length: computeRequired}, (_, i) => (
                                            <span key={i} style="margin:0px;">▪</span>
                                        ))}
                                    </div> for {job.duration} seconds
                                </div>
                                {moneyRequired > 0 && (
                                    <div style={`${Decimal.lt(money.value, moneyRequired) ? 'font-size: 16px; color: #d32f2f;' : 'font-size: 14px;'}`}>
                                        <strong>Cost:</strong> 💰 -${moneyRequired}
                                    </div>
                                )}
                                <div style="margin-top: 8px; display: flex; gap: 5px;">

                                    {jobType?.category !== "onetime" && (
                                        <button
                                            onClick={() => declineJob(job.id)}
                                            style={{
                                                background: "#f44336",
                                                color: "white",
                                                padding: "6px 12px",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "13px"
                                            }}
                                        >
                                            Decline
                                        </button>
                                    )}

				    <div style="font-size: 14px;">{jobType?.displayName || job.jobTypeId}</div>

                                    {isScooped ? (
                                        <div style="font-size: 13px; color: #d32f2f; font-weight: bold; padding: 6px 12px;">
                                            Job Scooped by MegaCorp
                                        </div>
                                    ) : (
                                        <div style="display: flex; align-items: center; gap: 6px;">
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
                                            <button
                                                onClick={(e) => e.currentTarget && handleAcceptClick(job, e.currentTarget as HTMLButtonElement)}
                                                disabled={!canAcceptJob(job) && !isInRejectionChain}
                                                style={{
                                                    background: !canAcceptJob(job) && !isInRejectionChain ? "#ccc" : isInRejectionChain ? "#f44336" : "#4CAF50",
                                                    color: "white",
                                                    padding: "6px 12px",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: canAcceptJob(job) || isInRejectionChain ? "pointer" : "not-allowed",
                                                    fontSize: "13px"
                                                }}
                                            >
                                                {buttonText}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {!unlockedJobTypes.value.includes(job.jobTypeId) && (
                                    <div style="margin-top: 5px; color: #d32f2f; font-weight: bold; font-size: 12px;">⚠ Need {jobType?.displayName || job.jobTypeId}!</div>
                                )}
                                {availableGPUs.value < computeRequired && unlockedJobTypes.value.includes(job.jobTypeId) && (
                                    <div style="margin-top: 5px; color: #d32f2f; font-weight: bold; font-size: 12px;">
                                        ⚠ Need {formatCompute(computeRequired, currentChapter.value, true)}! <span style="color: black;">{"▪".repeat(Math.max(0, availableGPUs.value))}{"▫".repeat(Math.max(0, computeRequired - availableGPUs.value))}</span>
                                    </div>
                                )}
                            </div>
                        )})
                    )}
                </div>

                <div style="margin: 15px 0; padding: 12px; border: 2px solid #4CAF50; border-radius: 10px; background: #e8f5e9;">
           {/*  <div style="margin: 15px 0; padding: 12px; border: 2px solid #2196F3; border-radius: 10px; background: #e3f2fd;"> */}
                    <h3>Active Jobs</h3>
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
                                <div key={delivery.id} style="margin: 3px 0; padding: 2px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                                    <div style="font-size: 14px;">{prefix} {jobType?.displayName || delivery.jobTypeId}</div>

                                    <div style="color: #2e7d32; font-size: 14px;">
                                        {delivery.payouts.map((payout: any, idx: number) => (
                                            <span key={idx}>
                                                {idx > 0 && " +"}
                                                {payout.type === "money" ? "💰 $" : ""}
                                                {payout.type === "data" ? "📊 " : ""}
                                                {payout.type === "iq" ? "🧠 " : ""}
                                                {payout.type === "autonomy" ? "🤖 " : ""}
                                                {payout.type === "generality" ? "🌐 " : ""}
                                                {payout.type === "wonder" ? "🌟 " : ""}
                                                {format(payout.amount)}
                                                {payout.type === "data" ? " data" : ""}
                                                {payout.type === "iq" ? " IQ" : ""}
                                                {payout.type === "autonomy" ? " Autonomy" : ""}
                                                {payout.type === "generality" ? " Generality" : ""}
                                                {payout.type === "wonder" ? " Wonder" : ""}
                                            </span>
                                        ))}
					&nbsp;&nbsp;&nbsp;
                                        {"▪".repeat(Math.max(0, jobType?.cost?.find(c => c.type === "compute")?.value || 0))} {Math.ceil(delivery.timeRemaining)}s
                                    </div>
                                    <div style="margin-top: 6px; width: 60%; height: 4px; background: white; border-radius: 2px; overflow: hidden;">
                                        <div style={{
                                            width: `${progress * 100}%`,
                                            height: '100%',
					    /* background: 'rgb(227, 242, 253)', */
                                            background: '#61C6F3',
                                            transition: 'width 0.1s linear'
                                        }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                    <div style="font-size: 14px;"><strong>Researched:</strong> {unlockedJobTypes.value.map(id => getJobType(id)?.displayName || id).join(", ")}</div>
		    <div style="font-size: 20px; color: rgb(230, 218, 199); display: flex; gap: 10px; align-items: center;">
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
                        <button
                            onClick={openAchievementsTab}
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
                            <img src="/ach/ach0.png" alt="Achievements" style="width: 16px; height: 16px; opacity:0.6" />
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

                <ResetModal ref={resetModal} />
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
        everVisibleJobTypes,
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
