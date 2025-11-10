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
import Options from "components/modals/Options.vue";
import { G_CONF } from "../gameConfig";
import { JOB_TYPES } from "../jobTypes";
import { save } from "util/save";

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
    const color = "#FFA500";

    // Settings modal ref
    const optionsModal = ref<InstanceType<typeof Options> | null>(null);

    // Resources
    const money = createResource<DecimalSource>(G_CONF.STARTING_MONEY, "dollars");
    const best = trackBest(money);
    const total = trackTotal(money);

    // Core stats (not tracked like resources)
    const iq = persistent<number>(0); // Intelligence stat, unlocked in Chapter 2
    const autonomy = persistent<number>(0); // Autonomy stat
    const generality = persistent<number>(0); // Generality stat

    // Data resource (unlocked later in Chapter 2)
    const data = createResource<DecimalSource>(0, "data");
    const dataUnlocked = persistent<boolean>(false); // Track if data has been gained

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
        } else if (prereq.type === "completedJob") {
            return completedOnetimeJobs.value.includes(prereq.value as string);
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
                    if (Decimal.lt(money.value, 60)) return null;
                    break;

                case 3:
                    if (iq.value < 3) return null;
                    break;

                case 4:
                    if (generality.value < 3) return null;
                    break;

                case 5:
                    if (autonomy.value < 3) return null;
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

                // Apply quality bonus - but not for stat payouts (IQ, autonomy, generality)
                const isStatPayout = ["iq", "autonomy", "generality"].includes(payoutSpec.type);
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

            // Apply quality bonus (multiplicative) - but not for stat payouts (IQ, autonomy, generality)
            const isStatPayout = ["iq", "autonomy", "generality"].includes(payoutSpec.type);
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
            title: "Buy GPU",
            description: () => (
                <>
                    Cost: ${format(Decimal.pow(G_CONF.GPU_COST_MULTIPLIER, gpusOwned.value - G_CONF.STARTING_GPUS).times(G_CONF.GPU_BASE_COST))}<br/>
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
            return `Requires: ${requiredJob?.displayName || prereq.value}`;
        } else if (prereq.type === "data") {
            return `Requires: ${prereq.value} data`;
        } else if (prereq.type === "compute") {
            return `Requires: ${prereq.value} GPU${prereq.value !== 1 ? 's' : ''}`;
        } else if (prereq.type === "iq") {
            return `Requires: ${prereq.value} IQ`;
        } else if (prereq.type === "autonomy") {
            return `Requires: ${prereq.value} Autonomy`;
        } else if (prereq.type === "generality") {
            return `Requires: ${prereq.value} Generality`;
        } else if (prereq.type === "completedJob") {
            const requiredJob = getJobType(prereq.value as string);
            return `Requires: Complete ${requiredJob?.displayName || prereq.value}`;
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

            // Check for stat payouts
            const statPayout = jobType.payout.find((p: any) => ["iq", "autonomy", "generality"].includes(p.type));

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
                                Cost: {moneyCost > 0 && <span style={!hasEnoughMoney ? "color: rgb(131, 131, 131); font-size: 11px;" : undefined}>${moneyCost}</span>}{moneyCost > 0 && dataCost > 0 && " + "}{dataCost > 0 && <span style={!hasEnoughData ? "color: rgb(131, 131, 131); font-size: 11px;" : undefined}>{dataCost} data</span>}<br/>
                                {nonMoneyPrereqs.length > 0 && (
                                    <>
                                        {nonMoneyPrereqs.map((prereq: any, idx: number) => {
                                            const isMet = isPrereqMet(prereq);
                                            const formatted = formatPrereq(prereq);
                                            return (
                                                <span key={idx}>
                                                    Requires: <span style={!isMet ? "color: rgb(131, 131, 131); font-size: 11px;" : undefined}>{formatted.replace("Requires: ", "")}</span>
                                                    {idx < nonMoneyPrereqs.length - 1 && <br/>}
                                                </span>
                                            );
                                        })}
                                    <br/></>

                                )}
                                <br/><i>{jobType.description}</i>
                                {statPayout && (
                                    <>
                                        <br/>
                                        <strong>
                                            {statPayout.type === "iq" && "IQ"}
                                            {statPayout.type === "autonomy" && "Autonomy"}
                                            {statPayout.type === "generality" && "Generality"}
                                            {" +"}
                                            {statPayout.min === statPayout.max ? statPayout.min : `${statPayout.min}-${statPayout.max}`}
                                        </strong>
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
        ///jobQueue.value = jobQueue.value.filter(j => j.id !== jobId);
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

    // Display
    //const display: JSXFunction = () => {
    const display = () => {
        return (
            <div style="padding: 0 5px;">
		    <div style="font-size: 16px; color: rgb(230, 218, 199);">Chapter {currentChapter.value}</div>
                <div style="margin: 8px 0; padding: 12px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">


                    <div style="font-size: 16px;"><strong>Money:</strong> ${format(money.value)}</div>
                    {autonomy.value > 0 && <div style="font-size: 16px;"><strong>Autonomy:</strong> {autonomy.value}</div>}
                    {generality.value > 0 && <div style="font-size: 16px;"><strong>Generality:</strong> {generality.value}</div>}
                    {iq.value > 0 && <div style="font-size: 16px;"><strong>IQ:</strong> {iq.value}</div>}		    
                    {dataUnlocked.value && <div style="font-size: 16px;"><strong>Data:</strong> {format(data.value)}</div>}
                    <div style="font-size: 14px;"><strong>GPUs:</strong> {availableGPUs.value} / {gpusOwned.value} available</div>
                    {qualityBonus.value !== 100 && (
                        <div style="font-size: 14px; color: #4CAF50;"><strong>Quality Bonus:</strong> {parseFloat((qualityBonus.value / 100).toFixed(2))}x earnings</div>
                    )}
                    {speedBonus.value !== 100 && (
                        <div style="font-size: 14px; color: #2196F3;"><strong>Speed Bonus:</strong> {parseFloat((speedBonus.value / 100).toFixed(2))}x</div>
                    )}
                    {/* <div style="font-size: 14px;"><strong>Unlocked Pizzas:</strong> {unlockedJobTypes.value.map(id => getJobType(id)?.displayName || id).join(", ")}</div>  */}   
                </div>

                <div style="margin: 15px 0;">
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                        {render(buyGPUClickable)}
                        {pizzaUnlockClickables.map(clickable => render(clickable))}
                    </div>
                </div>

                <div style="margin: 15px 0; padding: 12px; border: 2px solid #2196F3; border-radius: 10px; background: #e3f2fd;">
                    <h3>Active Jobs ({activeDeliveries.value.length})</h3>
                    {activeDeliveries.value.length === 0 ? (
                        <p style="font-style: italic;">No active jobs</p>
                    ) : (
		      	activeDeliveries.value.map((delivery: ActiveDelivery) => {
                            const jobType = getJobType(delivery.jobTypeId);
                            return (
                                <div key={delivery.id} style="margin: 10px 0; padding: 8px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                                    <div style="font-size: 14px;">{jobType?.category === "onetime" ? "TRAINING" : "Job: "} {jobType?.displayName || delivery.jobTypeId}</div>
                                    <div style="font-size: 14px;"><strong>⏱️ Time:</strong> {Math.ceil(delivery.timeRemaining)}s</div>
                                    <div style="color: #2e7d32; font-size: 14px;">
                                        <strong>💰 Earn:</strong> {delivery.payouts.map((payout: any, idx: number) => (
                                            <span key={idx}>
                                                {idx > 0 && " + "}
                                                {payout.type === "money" ? "$" : ""}
                                                {["iq", "autonomy", "generality"].includes(payout.type) ? "+" : ""}
                                                {format(payout.amount)}
                                                {payout.type === "data" ? " data" : ""}
                                                {payout.type === "iq" ? " IQ" : ""}
                                                {payout.type === "autonomy" ? " Autonomy" : ""}
                                                {payout.type === "generality" ? " Generality" : ""}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                            const computeRequired = jobType?.cost?.find(c => c.type === "compute")?.value || 0;
                            const moneyRequired = jobType?.cost?.find(c => c.type === "money")?.value || 0;
                            const primaryPayoutType = job.payouts[0]?.type || "money";
                            const backgroundColor = primaryPayoutType === "money" ? "#ffffff" :
                                                   primaryPayoutType === "data" ? "#f3f3ff" :
                                                   "#f3f3f3";
                            return (
                            <div key={job.id} style={`margin: 10px 0; padding: 8px; background: ${backgroundColor}; border-radius: 5px; border: 1px solid #ddd;`}>
                                <div style="font-size: 14px;">
                                    <strong>Pay:</strong> {job.payouts.map((payout: any, idx: number) => (
                                        <span key={idx}>
                                            {idx > 0 && " + "}
                                            {payout.type === "money" ? "$" : ""}
                                            {["iq", "autonomy", "generality"].includes(payout.type) ? "+" : ""}
                                            {format(payout.amount)}
                                            {payout.type === "data" ? " data" : ""}
                                            {payout.type === "iq" ? " IQ" : ""}
                                            {payout.type === "autonomy" ? " Autonomy" : ""}
                                            {payout.type === "generality" ? " Generality" : ""}
                                        </span>
                                    ))}
                                </div>


                                <div style="font-size: 14px;"><strong>Use:</strong> {computeRequired} GPU for {job.duration} seconds</div>
                                {moneyRequired > 0 && <div style="font-size: 14px;"><strong>Cost:</strong> ${moneyRequired}</div>}
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

				                                        <button
                                        onClick={() => acceptJob(job)}
                                        disabled={!canAcceptJob(job)}
                                        style={{
                                            background: canAcceptJob(job) ? "#4CAF50" : "#ccc",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: canAcceptJob(job) ? "pointer" : "not-allowed",
                                            fontSize: "13px"
                                        }}
                                    >
                                        {jobType?.category === "onetime" ? "Begin" : "Accept"}
                                    </button>
                                </div>
                                {!unlockedJobTypes.value.includes(job.jobTypeId) && (
                                    <div style="margin-top: 5px; color: #d32f2f; font-weight: bold; font-size: 12px;">⚠ Need {jobType?.displayName || job.jobTypeId}!</div>
                                )}
                                {availableGPUs.value < computeRequired && unlockedJobTypes.value.includes(job.jobTypeId) && (
                                    <div style="margin-top: 5px; color: #d32f2f; font-weight: bold; font-size: 12px;">⚠ Need {computeRequired} GPU{computeRequired !== 1 ? 's' : ''}!</div>
                                )}
                            </div>
                        )})
                    )}
                </div>

                    <div style="font-size: 14px;"><strong>Researched:</strong> {unlockedJobTypes.value.map(id => getJobType(id)?.displayName || id).join(", ")}</div>

                <button
                    onClick={() => optionsModal.value?.open()}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        left: "20px",
                        background: "var(--raised-background)",
                        border: "2px solid var(--outline)",
                        borderRadius: "50%",
                        cursor: "pointer",
                        fontSize: "32px",
                        color: "var(--foreground)",
                        padding: "10px",
                        width: "60px",
                        height: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        zIndex: 1000
                    }}
                    title="Settings"
                >
                    ⚙️
                </button>

                <Options ref={optionsModal} />
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
        data,
        dataUnlocked,
        unlockedJobTypes,  // Changed from unlockedPizzas
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
        nextJobId,
        timeSinceLastJob,
        gpusOwned,
        availableGPUs,
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