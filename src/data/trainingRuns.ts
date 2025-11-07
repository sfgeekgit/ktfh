/**
 * Training Run Jobs Configuration
 *
 * Defines all training run job types that increase AI capabilities (IQ, generality).
 * These are typically one-time jobs that represent major AI model improvements.
 */

import type { JobType } from './jobTypes';

export const TRAINING_RUN_JOBS: JobType[] = [
    {
        id: "trun1",
        displayName: "Training Run",
        description: "Train a smarter base model",
        chapter: [2,3,4],
        prereq: [
            { type: "data", value: 100 },
            { type: "compute", value: 6 }
        ],
        unlockCost: [            { type: "data", value: 200 }],
        payout: [{ type: "iq", min: 1, max: 1 } ],
        duration: { min: 35, max: 35 },
        category: "onetime",
        cost: [
            { type: "compute", value: 4 },
	    { type: "money", value: 500 }

        ]
    },

    {
        id: "trun2",
        displayName: "Reinforcement Learning",
        description: "Training Run",
        chapter: [2,3,4],
        prereq: [
            { type: "completedJob", value: "trun1", display_prereq: false }
	    , { type: "compute", value: 7}
        ],
        unlockCost: [{ type: "data", value: 400 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 40, max: 40 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 750 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun3",
        displayName: "Chain-of-Thought Training",
        description: "AI learns multistep problem solving",
        chapter: [2,3,4],
        prereq: [
            { type: "completedJob", value: "trun2", display_prereq: false },
            { type: "compute", value: 7 }
        ],
        unlockCost: [{ type: "data", value: 600 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 45, max: 45 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 1000 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun4",
        displayName: "Complex Pattern Recognition",
        description: "AI identifies intricate relationships in data",
        chapter: [2,3,4,5],
        prereq: [
            { type: "completedJob", value: "trun3", display_prereq: false },
            { type: "compute", value: 8 }
        ],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 50, max: 50 },
        category: "onetime",
        cost: [
            { type: "compute", value: 6 },
            { type: "money", value: 1250 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun5",
        displayName: "Specialized Fine-Tuning",
        description: "Deepen expertise in specific domains",
        chapter: [2,3,4,5],
        prereq: [
            { type: "completedJob", value: "trun4", display_prereq: false },
            { type: "compute", value: 8 }
        ],
        unlockCost: [{ type: "data", value: 1000 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 55, max: 55 },
        category: "onetime",
        cost: [
            { type: "compute", value: 6 },
            { type: "money", value: 1500 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun6",
        displayName: "Inference Optimization",
        description: "AI thinks faster and more efficiently",
        chapter: [3,4,5,6],
        prereq: [
            { type: "completedJob", value: "trun5", display_prereq: false },
            { type: "compute", value: 9 }
        ],
        unlockCost: [{ type: "data", value: 1200 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 60, max: 60 },
        category: "onetime",
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 1750 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun7",
        displayName: "Mathematical Reasoning",
        description: "AI develops sophisticated calculation abilities",
        chapter: [3,4,5,6],
        prereq: [
            { type: "completedJob", value: "trun6", display_prereq: false },
            { type: "compute", value: 9 }
        ],
        unlockCost: [{ type: "data", value: 1400 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 65, max: 65 },
        category: "onetime",
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 2000 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "trun8",
        displayName: "Expert Knowledge Base",
        description: "AI masters specialized domain expertise",
        chapter: [3,4,5,6],
        prereq: [
            { type: "completedJob", value: "trun7", display_prereq: false },
            { type: "compute", value: 10 }
        ],
        unlockCost: [{ type: "data", value: 1600 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 70, max: 70 },
        category: "onetime",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 2500 },
            { type: "data", value: 200 }
        ]
    },
    {
        id: "trun9",
        displayName: "Advanced Reasoning Engine",
        description: "AI develops deeper logical capabilities",
        chapter: [3,4,5,6],
        prereq: [
            { type: "completedJob", value: "trun8", display_prereq: false },
            { type: "compute", value: 10 }
        ],
        unlockCost: [{ type: "data", value: 1800 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 75, max: 75 },
        category: "onetime",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 3000 },
            { type: "data", value: 200 }
        ]
    },

    // Generality job chain - sequential onetime jobs
    {
        id: "trun_mm1",
        displayName: "Multimodal Training Run",
        description: "Combine text, image, audio processing",
        chapter: [2,3,4],
        prereq: [
		    	{ type: "iq", value: 2 },
            { type: "compute", value: 5 }
	],
        unlockCost: [{ type: "data", value: 200 }],
        payout: [
            { type: "generality", min: 1, max: 1 }
        ],
        duration: { min: 10, max: 10 },
        category: "onetime",
        cost: [
            { type: "compute", value: 3 },
	    { type: "money", value: 50 },
	    { type: "data", value: 100 }
        ]
    },

    {
        id: "trun_mm2",
        displayName: "Cross-Domain Training",
        description: "Transfer knowledge between fields",
        chapter: [2,3,4],
        prereq: [
            { type: "completedJob", value: "trun_mm1", display_prereq: false  },
            { type: "compute", value: 6 }
        ],
        unlockCost: [{ type: "data", value: 400 }],
        payout: [
            { type: "generality", min: 1, max: 1 }
        ],
        duration: { min: 35, max: 35 },
        category: "onetime",
        cost: [
            { type: "compute", value: 4 },
	    { type: "money", value: 100 },
	    { type: "data", value: 200 }
        ]
    },

    {
        id: "trun_mm3",
        displayName: "Few-Shot Learning Module",
        description: "Better Generality",
        chapter: [2,3,4],
        prereq: [
            { type: "completedJob", value: "trun_mm2", display_prereq: false  },
            { type: "compute", value: 7 }
        ],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [
            { type: "generality", min: 1, max: 1 }
        ],
        duration: { min: 40, max: 40 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
	    { type: "money", value: 200 },
	    { type: "data", value: 400 }
        ]
    },

    {
        id: "trun_mm4",
        displayName: "Meta-Learning System",
        description: "AI that learns how to learn new tasks",
        chapter: [3,4,5,6],
        prereq: [
            { type: "completedJob", value: "trun_mm3", display_prereq: false  },
            { type: "compute", value: 7 }
        ],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [
            { type: "generality", min: 1, max: 1 }
        ],
        duration: { min: 40, max: 40 },
        category: "onetime",
        cost: [
            { type: "compute", value: 5 },
	    { type: "money", value: 200 },
	    { type: "data", value: 400 }
        ]
    },
];
