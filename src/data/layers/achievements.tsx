import { createAchievement } from "features/achievements/achievement";
import { createLayer, layers } from "game/layers";
import { createBooleanRequirement } from "game/requirements";
import { createTreeNode } from "features/trees/tree";
import { computed } from "vue";
import Decimal from "util/bignum";
import player from "game/player";
import { loadAchievementMeta, saveAchievementMeta } from "util/achievementStorage";
import { achievementImages } from "../generated/achievementImages";

const id = "achievements";

export let achievements: Record<string, ReturnType<typeof createAchievement>> = {};

const layer = createLayer(id, function () {
    const name = "Achievements";
    const color = "#9C27B0";

    const mainLayer = computed(() => layers.main as any);
    const totalCompute = computed(() => mainLayer.value?.gpusOwned?.value ?? 0);
    const money = computed(() => mainLayer.value?.money?.value ?? 0);
    const jobCompletions = computed(() => mainLayer.value?.jobCompletions?.value ?? 0);
    const completedOnetimeJobs = computed(() => mainLayer.value?.completedOnetimeJobs?.value ?? []);


    
    // requirementText is not used, I think
    // Reward is not used
    // Title is used for both the toast and the card
    const defaultImage = "/ach/ach_gen.png";

    const baseAchievementDefs = [

        {
            id: "computeCluster2",
            title: "Dev Test Compute",
            description: "Own 2 GPUs",
            requirement: () => totalCompute.value >= 2,
            requirementText: "Own at least requirementText"
        },
        {
            id: "computeCluster4",
            title: "Quad Compute",
            description: "Own 4 GPUs",
            requirement: () => totalCompute.value >= 4,
            requirementText: "Own at least requirementText"
        },


	{
            id: "computeCluster",
            title: "Compute Cluster",
            description: "Reach 8 total compute units.",
            reward: "Permanent badge for future runs.",
            image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 8,
            //requirementText: "Own at least 8 compute units"
        },
        {
            id: "computeElder",
            title: "Compute Elder",
            description: "Reach 18 total compute units.",
            reward: "Elder compute status.",
            image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 18,
            requirementText: "Own at least 18 compute units"
        },
        {
            id: "computeCosmic",
            title: "Compute Cosmic",
            description: "Reach 19 total compute units.",
            reward: "Cosmic compute power.",
            image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 19,
            requirementText: "Own at least 19 compute units"
        },
        {
            id: "wonderMolecularManufacturing",
            title: "Molecular Manufacturing",
	    image: "/ach/ach_molen2.png",
            requirement: () => completedOnetimeJobs.value.includes("sci7"),
            requirementText: "Complete Molecular Manufacturing"
        },
        {
            id: "wonderMaterialsDiscovery",
            title: "Materials Discovery",
	    image: "/ach/ach_fiss.png",
            requirement: () => completedOnetimeJobs.value.includes("sci9"),
            requirementText: "Complete Materials Discovery"
        },
        {
            id: "wonderFusionEnergy",
            title: "Fusion Energy",
	    image: "/ach/ach_suneng.png",
            requirement: () => completedOnetimeJobs.value.includes("sci12"),
            requirementText: "Complete Fusion Energy"
        },
        {
            id: "wonderDemocraticConsensusSynthesizer",
            title: "Democratic Consensus Synthesizer",
	    image: "/ach/ach_fiss.png",
            requirement: () => completedOnetimeJobs.value.includes("dem7"),
            requirementText: "Complete Democratic Consensus Synthesizer"
        },
        {
            id: "wonderCivicTrustInfrastructure",
            title: "Civic Trust Infrastructure",
            requirement: () => completedOnetimeJobs.value.includes("dem11"),
            requirementText: "Complete Civic Trust Infrastructure"
        },
        {
            id: "wonderPerceptionManipulationApparatus",
            title: "Perception Manipulation Apparatus",
            requirement: () => completedOnetimeJobs.value.includes("dem15"),
            requirementText: "Complete Perception Manipulation Apparatus"
        },
        {
            id: "wonderAlgorithmicAuthoritarianism",
            title: "Algorithmic Authoritarianism",
            image: "/ach/ach_badai1.png",	    
            requirement: () => completedOnetimeJobs.value.includes("dem18"),
            requirementText: "Complete Algorithmic Authoritarianism"
        },
        {
            id: "wonderUniversalEducationTutor",
            title: "Universal Education Tutor",
            requirement: () => completedOnetimeJobs.value.includes("edu8"),
            requirementText: "Complete Universal Education Tutor"
        },
        {
            id: "wonderGlobalLearningNetwork",
            title: "Global Learning Network",
            requirement: () => completedOnetimeJobs.value.includes("edu11"),
            requirementText: "Complete Global Learning Network"
        },
        {
            id: "wonderHighlyLocalizedWeatherForecasting",
            title: "Highly Localized Weather Forecasting",
            requirement: () => completedOnetimeJobs.value.includes("clim4"),
            requirementText: "Complete Highly Localized Weather Forecasting"
        },
        {
            id: "wonderGlobalEmissionsTracking",
            title: "Global Emissions Tracking",
            requirement: () => completedOnetimeJobs.value.includes("clim7"),
            requirementText: "Complete Global Emissions Tracking"
        },
        {
            id: "wonderClimateAwareGridBalancing",
            title: "Climate-Aware Grid Balancing",
            requirement: () => completedOnetimeJobs.value.includes("clim11"),
            requirementText: "Complete Climate-Aware Grid Balancing"
        },
        {
            id: "wonderPrecisionOncology",
            title: "Precision Oncology",
	    image: "/ach/ach_medtargt.png",	
            requirement: () => completedOnetimeJobs.value.includes("med4"),
            requirementText: "Complete Precision Oncology"
        },
        {
            id: "wonderAcceleratedDrugDiscovery",
            title: "Accelerated Drug Discovery",
            requirement: () => completedOnetimeJobs.value.includes("med8"),
            requirementText: "Complete Accelerated Drug Discovery"
        },
        {
            id: "wonderUniversalDiseaseTherapeutics",
            title: "Universal Disease Therapeutics",
            requirement: () => completedOnetimeJobs.value.includes("med12"),
            requirementText: "Complete Universal Disease Therapeutics"
        },
        {
            id: "wonderReversalOfAging",
            title: "Reversal of Aging",
            image: "/ach/ach_age2.png",
            requirement: () => completedOnetimeJobs.value.includes("med14"),
            requirementText: "Complete Reversal of Aging"
        },
        {
            id: "agiOverload",
            title: "AGI Overload",
	    image: "/ach/ach_badai3.png",			
            description: "Exceed A+G+I safety threshold.",
            requirement: () =>
                player.gameOver === true &&
                Array.isArray(player.tabs) &&
                player.tabs.includes("ending_lose_agi_threshold"),
            requirementText: "Lose by exceeding the A+G+I threshold"
        },
        {
            id: "worker",
            title: "Worker",
            description: "Complete 1,000 jobs.",
            image: "/ach/ach_tasks.png",
            requirement: () => jobCompletions.value >= 1000,
            requirementText: "Complete 1,000 jobs"
        },
        {
            id: "money1",
            title: "Series A",
            description: "Reach $5000",
            image: "/ach/ach_cash1.png",
            requirement: () => Decimal.gte(money.value, 5000),
            requirementText: "Reach $5000"
        },
        {
            id: "money2",
            title: "Funded",
            description: "Reach $50,000",
            image: "/ach/ach_cash2.png",
            requirement: () => Decimal.gte(money.value, 50000),
            requirementText: "Reach $50000"
        },

	


    ];

    /*
    // Track used images so auto-generated achievements do not reuse them
    const usedImages = new Set(baseAchievementDefs.map(def => def.image ?? defaultImage));

    // Auto-generated achievements from /public/ach/ directory
    // Run 'node scripts/ach_img_names.js' to regenerate the list
    const autoGeneratedAchievements = achievementImages.flatMap(img => {
        const imagePath = `/ach/${img}.png`;
        if (usedImages.has(imagePath)) return [];
        usedImages.add(imagePath);
        return [
            {
                id: img,
                title: img,
                description: img,
                image: imagePath,
                requirement: () => totalCompute.value >= 88
            }
        ];
    });
    */
    
    // const achievementDefs = [...baseAchievementDefs, ...autoGeneratedAchievements];
    const achievementDefs = [...baseAchievementDefs];

    achievements = Object.fromEntries(
        achievementDefs.map(def => [
            def.id,
            createAchievement(() => ({
                display: () => def.title,
                image: def.image ?? defaultImage,
                requirements: createBooleanRequirement(
                    def.requirement,
                    () => <>{("requirementText" in def && def.requirementText) || ""}</>
                )
            }))
        ])
    ) as Record<string, ReturnType<typeof createAchievement>>;

    const achievementCards = achievementDefs.map(def => ({
        id: def.id,
        title: def.title,
        description: def.description,
        image: def.image ?? defaultImage,
        achievement: (achievements as any)[def.id],
        reward: "reward" in def ? def.reward : undefined
    }));

    // Load persisted meta on layer init (and whenever this layer is constructed)
    // IMPORTANT: This must happen AFTER the player save is loaded to ensure the sidecar
    // overrides any achievement state from the main save. The 100ms delay ensures this.
    setTimeout(() => {
        loadAchievementMeta();
    }, 100);

    const display = () => (
        <div style="padding: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0;  color: rgb(230, 218, 199)">Achievements</h2>

            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <button
                    onClick={() => (player.tabs = ["main"])}
                    style={{
                        background: "#4CAF50",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold"
                    }}
                >
                    Return to Game
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                {achievementCards.map(card => (
                    <div
                        key={card.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: `2px solid ${card.achievement.earned.value ? "#4CAF50" : "#333"}`,
                            background: card.achievement.earned.value ? "#e8f5e9" : "#3E4450",
                            color: card.achievement.earned.value ? "#555555" : "#777777",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            width: "300px"
                        }}
                    >
                        <img
                            src={card.image}
                            alt={card.title}
                            style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                opacity: card.achievement.earned.value ? 0.8 : 0.8
                            }}
                        />
                        <div style="flex: 1; text-align: left;">
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">
                                {card.title}
                                {card.achievement.earned.value && (
                                    <span style="color: #388E3C; margin-left: 8px; font-size: 14px;">✓</span>
                                )}
                            </div>
			    <div style="fontSize:15px; marginBottom:4px;">{card.description}</div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return {
        name,
        color,
        achievements,
        display,
        treeNode: createTreeNode(() => ({
            display: name,
            color
        }))
    };
});

export default layer;
