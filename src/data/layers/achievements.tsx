import { createAchievement } from "features/achievements/achievement";
import { createLayer, layers } from "game/layers";
import { createBooleanRequirement } from "game/requirements";
import { createTreeNode } from "features/trees/tree";
import { computed } from "vue";
import Decimal from "util/bignum";
import player from "game/player";
import { loadAchievementMeta, saveAchievementMeta } from "util/achievementStorage";

const id = "achievements";

export let achievements: Record<string, ReturnType<typeof createAchievement>> = {};

const layer = createLayer(id, function () {
    const name = "Achievements";
    const color = "#9C27B0";

    const mainLayer = computed(() => layers.main as any);
    const totalCompute = computed(() => mainLayer.value?.gpusOwned?.value ?? 0);
    const money = computed(() => mainLayer.value?.money?.value ?? 0);


    
    // requirementText is not used, I think
    // Reward is not used
    const defaultImage = "/ach/ach0.png";

    const achievementDefs = [

        {
            id: "dev01",
            title: "Lorum Ip",
            description: "Hi there",
            image: "/ach/ach0.png",
            requirement: () => totalCompute.value >= 88,

        },

        // New achievements mirroring dev01; update behavior later
        ...[
            "ach0",
            "ach2",
            "ach3",
            "ach_age1",
            "ach_age2",
            "ach_age3",
            "ach_badai1",
            "ach_badai2",
            "ach_badai3",
            "ach_badai4",
            "ach_burn",
            "ach_dem1",
            "ach_dem2",
            "ach_edu1",
            "ach_edu2",
            "ach_edu3",
            "ach_edu4",
            "ach_fiss",
            "ach_globe",
            "ach_med",
            "ach_med2",
            "ach_medtargt",
            "ach_molen1",
            "ach_molen2",
            "ach_nuc",
            "ach_server",
            "ach_suneng",
            "achmed1"
        ].map(img => ({
            id: img,
            title: img,
            description: img,
            image: `/ach/${img}.png`,
            requirement: () => totalCompute.value >= 88
        })),



        {
            id: "computeCluster2",
            title: "Buy it",
	    image: '/ach/ach_suneng.png',
            description: "Click that buy button",
            requirement: () => totalCompute.value >= 2,
            //requirementText: "Own at least 8 compute units"
        },
        {
            id: "computeCluster3",
            title: "Buy 3",
            description: "Click that buy button",
            requirement: () => totalCompute.value >= 3,
            //requirementText: "Own at least 8 compute units"
        },
        {
            id: "computeCluster4",
            title: "Buy 4",
            description: "Click that buy button",
            requirement: () => totalCompute.value >= 4,
            //requirementText: "Own at least 8 compute units"
        },
        {
            id: "computeCluster5",
            title: "Buy 5",
            description: "Click that buy button",
            requirement: () => totalCompute.value >= 5,
            //requirementText: "Own at least 8 compute units"
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
            id: "computeHorizon",
            title: "Compute Horizon",
            description: "This is Description Reach 9 total compute units.",
            reward: "This is reward Your compute reach grows ever farther.",
            image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 9,
            requirementText: "This is Req Text Own at least 9 compute units"
        },
        {
            id: "computeAscension",
            title: "Compute Ascension",
            description: "Reach 10 total compute units.",
            reward: "Ascend beyond previous limits.",
            image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 10,
            requirementText: "Own at least 10 compute units"
        },
        {
            id: "computeLegend",
            title: "Compute Legend",
            description: "Reach 11 total compute units.",
            reward: "Legendary compute mastery.",
            //image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 11,
            requirementText: "Own at least 11 compute units"
        },
        {
            id: "computeMyth",
            title: "Compute Myth",
            description: "Reach 17 total compute units.",
            reward: "A mythical level of compute.",
            //image: "/ach/ach2.png",
            requirement: () => totalCompute.value >= 17,
            requirementText: "Own at least 17 compute units"
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
            id: "moneySpark",
            title: "Cash Spark",
            description: "Amass $800 for the first time.",
            reward: "Proof of concept cash milestone.",
            image: "/ach/ach2.png",
            requirement: () => Decimal.gte(money.value, 800),
            requirementText: "Reach $800"
        }
    ];

    achievements = Object.fromEntries(
        achievementDefs.map(def => [
            def.id,
            createAchievement(() => ({
                display: () => def.title,
                image: def.image ?? defaultImage,
                requirements: createBooleanRequirement(def.requirement, () => <>{def.requirementText}</>)
            }))
        ])
    ) as Record<string, ReturnType<typeof createAchievement>>;

    const achievementCards = achievementDefs.map(def => ({
        id: def.id,
        title: def.title,
        description: def.description,
        image: def.image ?? defaultImage,
        achievement: (achievements as any)[def.id],
        reward: def.reward
    }));

    // Load persisted meta on layer init (and whenever this layer is constructed)
    loadAchievementMeta();

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
