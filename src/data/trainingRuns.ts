/**
 * Training Run Jobs Configuration
 *
 * Defines all training run job types that increase AI stats
 * There are 3 "trees" one for each stat (iq, generality, autonomy)

*/

import type { JobType } from './jobTypes';

const BASE_TRAIN_DUR = 1;

export const TRAINING_RUN_JOBS: JobType[] = [
    {
        id: "trun1",
        displayName: "Basic Training Run",
        description: "Train a smarter base model",
        chapter: [2,3,4,5,6],
	displayTrigger: [ { type: "data", value: 1 } ],
        prereq: [
            { type: "compute", value: 3 }
        ],
        unlockCost: [{ type: "data", value: 100 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 3.5, max: BASE_TRAIN_DUR * 3.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 2 },
            { type: "money", value: 200 }
        ]
    },

    {
        id: "trun2",
        displayName: "Pattern Recognition Training",
        //description: "AI learns to identify patterns in data",
        chapter: [2,3,4,5,6],
	displayTrigger: [{ type: "completedJob", value: "trun1"} ],            
        prereq: [
            { type: "compute", value: 4 }
        ],
        unlockCost: [{ type: "data", value: 400 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 4, max: BASE_TRAIN_DUR * 4 },
        category: "onetime",
        cost: [
            { type: "compute", value: 3 },
            { type: "money", value: 300 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun3",
        displayName: "Deep Learning Architecture",
        //description: "Build advanced neural network architectures",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun2"}],
        prereq: [
            { type: "compute", value: 10 }
        ],
        unlockCost: [{ type: "data", value: 600 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 4.5, max: BASE_TRAIN_DUR * 4.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 400 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun4",
        displayName: "Reinforcement Learning Engine",
	//displayName: "Reinforcement Learning",
        //description: "AI learns through trial and reward feedback",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun3"}],
        prereq: [
            { type: "compute", value: 11 }
        ],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 5, max: BASE_TRAIN_DUR * 5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 500 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun5",
        displayName: "Memory Enhancement",
        //description: "Increase AI's context and recall capacity",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun4"}],
        prereq: [
            { type: "compute", value: 14 }
        ],
        unlockCost: [{ type: "data", value: 1000 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 5.5, max: BASE_TRAIN_DUR * 5.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 10 },
            { type: "money", value: 700 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun6",
        displayName: "Advanced Reasoning Core",
        //description: "Develop sophisticated logical reasoning capabilities",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun5"}],
        prereq: [
            { type: "compute", value: 14 }
        ],
        unlockCost: [{ type: "data", value: 1200 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 6, max: BASE_TRAIN_DUR * 6 },
        category: "onetime",
        cost: [
            { type: "compute", value: 10 },
            { type: "money", value: 950 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun7",
        displayName: "Chain-of-Thought Enhancer",
        //description: "Enable step-by-step reasoning processes",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun6"}],
        prereq: [
            { type: "compute", value: 15 }
        ],
        unlockCost: [{ type: "data", value: 1400 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 6.5, max: BASE_TRAIN_DUR * 6.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 10 },
            { type: "money", value: 1200 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun8",
        displayName: "Inference Optimization",
        //description: "AI thinks faster and more efficiently",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun7"}],
        prereq: [
            { type: "compute", value: 16 }
        ],
        unlockCost: [{ type: "data", value: 1600 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 7, max: BASE_TRAIN_DUR * 7 },
        category: "onetime",
        cost: [
            { type: "compute", value: 11 },
            { type: "money", value: 1400 },
            { type: "data", value: 200 }
        ]
    },
    {
        id: "trun9",
        displayName: "Strategic Planning Module",
        //description: "AI develops long-term planning capabilities",
        chapter: [2,3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun8"}],
        prereq: [
            { type: "compute", value: 17 }
        ],
        unlockCost: [{ type: "data", value: 1800 }],
        payout: [{ type: "iq", min: 1}],
        duration: { min: BASE_TRAIN_DUR * 7.5, max: BASE_TRAIN_DUR * 7.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 11 },
            { type: "money", value: 1500 },
            { type: "data", value: 200 }
        ]
    },

    // Generality job chain - sequential onetime jobs
    {
        id: "trun_mm1",
        displayName: "Multimodal Integration",
        description: "A more GENERAL intelligence",
        chapter: [3,4,5,6],
	displayTrigger: [ { type: "iq", value: 3 } ],	
        prereq: [
            { type: "compute", value: 4 }
        ],
        unlockCost: [{ type: "data", value: 200 }],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 1, max: BASE_TRAIN_DUR * 1 },
        category: "onetime",
        cost: [
            { type: "compute", value: 3 },
            { type: "money", value: 50 },
            { type: "data", value: 100 }
        ]
    },

    {
        id: "trun_mm2",
        displayName: "Cross-Domain Learning",
        description: "Transfer knowledge between fields",
        chapter: [3,4,5,6],
	displayTrigger: [{ type: "completedJob", value: "trun_mm1"}],
        prereq: [
            { type: "compute", value: 6 }
        ],
        unlockCost: [{ type: "data", value: 400 }],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 3.5, max: BASE_TRAIN_DUR * 3.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 4 },
            { type: "money", value: 100 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun_mm3",
        displayName: "Meta-Learning Scaffold",
        //description: "Build frameworks for learning new tasks",
        chapter: [3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun_mm2"}],
        prereq: [
            { type: "compute", value: 7 }
        ],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 4, max: BASE_TRAIN_DUR * 4 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 200 },
            { type: "data", value: 400 }
        ]
    },

    {
        id: "trun_mm4",
        displayName: "Few-Shot Learning",
        // description: "AI learns from minimal examples",
        chapter: [3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun_mm3"}],
        prereq: [
            { type: "compute", value: 7 }
        ],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 4, max: BASE_TRAIN_DUR * 4 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 200 },
            { type: "data", value: 400 }
        ]
    },

    {
        id: "trun_mm5",
        displayName: "Domain Bridging Framework",
        //description: "Connect and synthesize knowledge across domains",
        chapter: [3,4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun_mm4"}],
        prereq: [
            { type: "compute", value: 10 }
        ],
        unlockCost: [{ type: "data", value: 1200 }],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 4.5, max: BASE_TRAIN_DUR * 4.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 300 },
            { type: "data", value: 600 }
        ]
    },

    // Autonomy job chain - sequential onetime jobs
    {
        id: "trun_auto1",
        displayName: "Basic Agents",
        description: "+1 Autonomy",
        chapter: [4,5,6],
        prereq: [
            { type: "compute", value: 5 }
        ],
        unlockCost: [{ type: "data", value: 200 }],
        payout: [
            { type: "autonomy", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 3, max: BASE_TRAIN_DUR * 3 },
        category: "onetime",
        cost: [
            { type: "compute", value: 3 },
            { type: "money", value: 100 },
            { type: "data", value: 100 }
        ]
    },

    {
        id: "trun_auto2",
        displayName: "Agentic Reasoning Training",
        //description: "Train goal-directed reasoning capabilities",
        chapter: [4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun_auto1"}],
        prereq: [
            { type: "compute", value: 7 }
        ],
        unlockCost: [{ type: "data", value: 600 }],
        payout: [
            { type: "autonomy", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 3.5, max: BASE_TRAIN_DUR * 3.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 150 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun_auto3",
        displayName: "Multi-Step Task Planner",
        //description: "AI breaks down and executes complex tasks",
        chapter: [4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun_auto2"}],
        prereq: [
            { type: "compute", value: 11 }
        ],
        unlockCost: [{ type: "data", value: 900 }],
        payout: [
            { type: "autonomy", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 4, max: BASE_TRAIN_DUR * 4 },
        category: "onetime",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 250 },
            { type: "data", value: 400 }
        ]
    },

    {
        id: "trun_auto4",
        displayName: "Goal-Conditioned Agent",
        //description: "AI pursues objectives with strategic planning",
        chapter: [4,5,6],
        displayTrigger: [{ type: "completedJob", value: "trun_auto3"}],
        prereq: [
            { type: "compute", value: 15 }
        ],
        unlockCost: [{ type: "data", value: 1500 }],
        payout: [
            { type: "autonomy", min: 1}
        ],
        duration: { min: BASE_TRAIN_DUR * 4.5, max: BASE_TRAIN_DUR * 4.5 },
        category: "onetime",
        cost: [
            { type: "compute", value: 11 },
            { type: "money", value: 400 },
            { type: "data", value: 600 }
        ]
    },

];
