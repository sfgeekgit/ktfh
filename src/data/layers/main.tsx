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

// Job interface
interface DeliveryJob {
    id: number;
    duration: number;
    jobTypeId: string;  // Changed from pizzaType - now uses job ID from jobTypes.ts
    payout: DecimalSource;
}

// Active delivery interface
interface ActiveDelivery extends DeliveryJob {
    timeRemaining: number;
}

const id = "main";
const layer = createLayer(id, function (this: any) {
    const name = "Pizza Delivery";
    const color = "#FFA500";

    // Settings modal ref
    const optionsModal = ref<InstanceType<typeof Options> | null>(null);

    // Resources
    const money = createResource<DecimalSource>(G_CONF.STARTING_MONEY, "dollars");
    const best = trackBest(money);
    const total = trackTotal(money);

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
        }
        // Add other prereq types here as needed (iq, autonomy, generality, etc.)
        return true;
    }

    // Check if a job type can be unlocked (all prereqs met)
    function canUnlockJob(jobType: any): boolean {
        // Check all prerequisites
        return jobType.prereq.every((prereq: any) => isPrereqMet(prereq));
    }

    // Get jobs that should be available for unlocking (in current chapter, prereqs met, not already unlocked)
    function getUnlockableJobs() {
        // For now, just return jobs from chapter 1 that aren't unlocked
        // TODO: Filter by current chapter when chapter system is implemented
        return JOB_TYPES.filter(job =>
            job.chapter === 1 &&
            !unlockedJobTypes.value.includes(job.id) &&
            canUnlockJob(job)
        );
    }

    const unlockedJobTypes = persistent<string[]>([...G_CONF.STARTING_PIZZAS]);  // Changed from unlockedPizzas - stores job IDs
    const introBonusApplied = persistent<boolean>(false);
    const chapter1BonusApplied = persistent<boolean>(false);
    const qualityBonus = persistent<number>(0); // Percentage bonus to earnings
    const speedBonus = persistent<number>(0);   // Percentage reduction to delivery time

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

    // Read intro choices
    const introChoice = computed(() => {
        return (layers.intro as any)?.playerChoice?.value || "";
    });

    // Apply intro bonuses once when intro completes
    const introComplete = computed(() => {
        return (layers.intro as any)?.introComplete?.value || false;
    });

    // Intro completion (no gameplay effects, just narrative)
    // Removed auto-unlock of pepperoni

    // Chapter 1 - trigger and bonuses
    const chapter1Choice = computed(() => {
        return (layers.chapter1 as any)?.playerChoice?.value || "";
    });

    const chapter1Complete = computed(() => {
        return (layers.chapter1 as any)?.complete?.value || false;
    });

    const shouldShowChapter1 = computed(() => {
        return Decimal.gte(money.value, G_CONF.CHAPTER_1_TRIGGER) && !chapter1Complete.value;
    });

    // Watch for chapter 1 trigger
    watch(shouldShowChapter1, (should) => {
        if (should) {
	    // @ts-ignore
            player.tabs = ["chapter1"];
        }
    }, { immediate: true });

    // Watch for chapter 1 completion and apply bonuses
    watch([chapter1Complete, chapter1Choice], ([complete, choice]) => {
        if (complete && !chapter1BonusApplied.value && choice) {
            if (choice === "quality") {
                qualityBonus.value = G_CONF.CHAPTER_1_QUALITY_BONUS;
            } else if (choice === "speed") {
                speedBonus.value = G_CONF.CHAPTER_1_SPEED_BONUS;
            }
            chapter1BonusApplied.value = true;
        }
    }, { immediate: true });

    // Chapter 2 - trigger
    const chapter2Complete = computed(() => {
        return (layers.chapter2 as any)?.complete?.value || false;
    });

    const shouldShowChapter2 = computed(() => {
        return Decimal.gte(money.value, G_CONF.CHAPTER_2_TRIGGER) && !chapter2Complete.value;
    });

    watch(shouldShowChapter2, (should) => {
        if (should) {
	    // @ts-ignore	
            player.tabs = ["chapter2"];
        }
    }, { immediate: true });

    // Chapter 3 - trigger
    const chapter3Complete = computed(() => {
        return (layers.chapter3 as any)?.complete?.value || false;
    });

    const shouldShowChapter3 = computed(() => {
        return Decimal.gte(money.value, G_CONF.CHAPTER_3_TRIGGER) && !chapter3Complete.value;
    });

    watch(shouldShowChapter3, (should) => {
        if (should) {
	    // @ts-ignore	
            player.tabs = ["chapter3"];
        }
    }, { immediate: true });

    // Chapter 4 - trigger
    const chapter4Complete = computed(() => {
        return (layers.chapter4 as any)?.complete?.value || false;
    });

    const shouldShowChapter4 = computed(() => {
        return Decimal.gte(money.value, G_CONF.CHAPTER_4_TRIGGER) && !chapter4Complete.value;
    });

    watch(shouldShowChapter4, (should) => {
        if (should) {
	    // @ts-ignore	
            player.tabs = ["chapter4"];
        }
    }, { immediate: true });

    /// const jobQueue = persistent<DeliveryJob[]>([]);
    ///    const activeDeliveries = persistent<ActiveDelivery[]>([]);

    /// const jobQueue = persistent<DeliveryJob[]>([] as any); // Trust me bro
    /// const activeDeliveries = persistent<ActiveDelivery[]>([] as any); // Bro is TS

    const jobQueue = persistent([] as any);
    const activeDeliveries = persistent([] as any);


    const nextJobId = persistent<number>(0);
    const timeSinceLastJob = persistent<number>(0);

    // Generate random job
    function generateJob(): DeliveryJob {
        // Pick a random unlocked job type
        const unlockedJobs = JOB_TYPES.filter(job => unlockedJobTypes.value.includes(job.id));
        if (unlockedJobs.length === 0) {
            // Fallback - shouldn't happen but just in case
            throw new Error("No unlocked job types available!");
        }

        const jobType = unlockedJobs[Math.floor(Math.random() * unlockedJobs.length)];

        // Calculate duration from job type config
        let duration = jobType.duration
            ? jobType.duration.min + Math.floor(Math.random() * (jobType.duration.max - jobType.duration.min + 1))
            : 20; // Fallback duration

        // Apply speed bonus (reduce duration)
        if (speedBonus.value > 0) {
            duration = Math.floor(duration * (1 - speedBonus.value / 100));
        }

        // Calculate payout from job type config (assume first payout is money)
        const payoutSpec = jobType.payout[0];
        let payout = payoutSpec.min + Math.floor(Math.random() * (payoutSpec.max - payoutSpec.min + 1));

        // Apply quality bonus (increase payout)
        if (qualityBonus.value > 0) {
            payout = Math.floor(payout * (1 + qualityBonus.value / 100));
        }

        return {
            id: nextJobId.value++,
            duration,
            jobTypeId: jobType.id,
            payout
        };
    }

    // Buy GPU clickable
    const buyGPUClickable = createClickable(() => ({
        display: {
            title: "Buy GPU",
            description: () => (
                <>
                    Cost: ${format(Decimal.pow(G_CONF.GPU_COST_MULTIPLIER, gpusOwned.value - G_CONF.STARTING_GPUS).times(G_CONF.GPU_BASE_COST))}<br/>
                    GPUs: {gpusOwned.value}
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

    // Job type unlock clickables
    const pizzaUnlockClickables = JOB_TYPES
        .filter(job => job.unlockCost.length > 0)  // Only jobs that cost something to unlock
        .map((jobType) => {
            // Assume first unlock cost is money for now
            const moneyCost = jobType.unlockCost.find(cost => cost.type === "money")?.value || 0;

            return createClickable(() => ({
                display: {
                    title: `Unlock ${jobType.displayName}`,
                    description: (
                        <>
                            Cost: ${moneyCost}<br/>
                            Unlock {jobType.displayName} {jobType.category} jobs
                        </>
                    )
                },
                canClick: () => {
                    // Check if we have enough money
                    const hasEnoughMoney = Decimal.gte(money.value, moneyCost);
                    // Check if not already unlocked
                    const notUnlocked = !unlockedJobTypes.value.includes(jobType.id);
                    // Check if all prerequisites are met
                    const prereqsMet = canUnlockJob(jobType);
                    return hasEnoughMoney && notUnlocked && prereqsMet;
                },
                onClick() {
                    money.value = Decimal.sub(money.value, moneyCost);
                    unlockedJobTypes.value.push(jobType.id);
                },
                visibility: () => {
                    // Show if not unlocked and prereqs are met
                    return !unlockedJobTypes.value.includes(jobType.id) && canUnlockJob(jobType);
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
        // Pause game until intro is complete
        const introLayer = layers.intro as any;
        if (introLayer && !introLayer.introComplete?.value) {
            return;
        }

        // Update active deliveries
        for (let i = activeDeliveries.value.length - 1; i >= 0; i--) {
            activeDeliveries.value[i].timeRemaining -= diff;

            if (activeDeliveries.value[i].timeRemaining <= 0) {
                const delivery = activeDeliveries.value[i];

                // Pay out the money
                money.value = Decimal.add(money.value, delivery.payout);

                // Remove the completed delivery
                activeDeliveries.value.splice(i, 1);
            }
        }

        // Generate new jobs (only if at or below auto-generation limit)
        timeSinceLastJob.value += diff;
        if (timeSinceLastJob.value >= G_CONF.JOB_GENERATION_INTERVAL) {
            timeSinceLastJob.value = 0;
            if (jobQueue.value.length <= G_CONF.AUTO_JOB_LIMIT) {
                jobQueue.value.push(generateJob());
            }
        }

        // Initial jobs
        if (jobQueue.value.length === 0 && activeDeliveries.value.length === 0) {
            for (let i = 0; i < G_CONF.INITIAL_JOBS_COUNT; i++) {
                jobQueue.value.push(generateJob());
            }
        }
    });

    // Accept job
    function acceptJob(job: DeliveryJob) {
        // Remove job from queue
	jobQueue.value = jobQueue.value.filter((j: DeliveryJob) => j.id !== job.id);

        // Add to active deliveries
        activeDeliveries.value.push({
            ...job,
            timeRemaining: job.duration
        });
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

        return true;
    }

    // Display
    //const display: JSXFunction = () => {
    const display = () => {
        return (
            <div style="padding: 0 5px;">

                <div style="margin: 15px 0; padding: 12px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                    <div style="font-size: 16px;"><strong>Money:</strong> ${format(money.value)}</div>
                    <div style="font-size: 14px;"><strong>GPUs:</strong> {availableGPUs.value} / {gpusOwned.value} available</div>
                    <div style="font-size: 14px;"><strong>Unlocked Pizzas:</strong> {unlockedJobTypes.value.map(id => getJobType(id)?.displayName || id).join(", ")}</div>
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
                                    <div style="font-size: 14px;"><strong>Processing:</strong> {jobType?.displayName || delivery.jobTypeId} pizza</div>
                                    <div style="font-size: 14px;"><strong>⏱️ Time:</strong> {Math.ceil(delivery.timeRemaining)}s</div>
                                    <div style="color: #2e7d32; font-size: 14px;"><strong>💰 Earn:</strong> ${format(delivery.payout)}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style="margin: 15px 0; padding: 12px; border: 2px solid #4CAF50; border-radius: 10px; background: #e8f5e9;">
                    <h3>Available Jobs ({jobQueue.value.length})</h3>
                    {jobQueue.value.length === 0 ? (
                        <p style="font-style: italic;">No jobs available. New jobs arrive every 60 seconds.</p>
                    ) : (
		        jobQueue.value.map((job: DeliveryJob) => {
                            const jobType = getJobType(job.jobTypeId);
                            const computeRequired = jobType?.cost?.find(c => c.type === "compute")?.value || 0;
                            return (
                            <div key={job.id} style="margin: 10px 0; padding: 8px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                                <div style="font-size: 14px;"><strong>Pizza:</strong> {jobType?.displayName || job.jobTypeId}</div>
                                <div style="font-size: 14px;"><strong>Duration:</strong> {job.duration}s</div>
                                <div style="font-size: 14px;"><strong>Payout:</strong> ${format(job.payout)}</div>
                                <div style="font-size: 14px;"><strong>Compute:</strong> {computeRequired} GPU{computeRequired !== 1 ? 's' : ''}</div>
                                <div style="margin-top: 8px; display: flex; gap: 5px;">
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
                                        Accept
                                    </button>
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

                {Decimal.gte(money.value, G_CONF.WIN_AMOUNT) && (
                    <div style="margin: 15px 0; padding: 20px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 10px; text-align: center; border: 3px solid #ff6f00; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                        <h1 style="font-size: 32px; margin: 0;">🎉 YOU WIN! 🎉</h1>
                        <p style="font-size: 18px; margin: 10px 0;">You've earned ${format(G_CONF.WIN_AMOUNT)}!</p>
                        <p style="font-size: 14px;">You've built a successful pizza delivery empire!</p>
                    </div>
                )}

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
        unlockedJobTypes,  // Changed from unlockedPizzas
        introBonusApplied,
        chapter1BonusApplied,
        qualityBonus,
        speedBonus,
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