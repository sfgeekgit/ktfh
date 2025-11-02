/**
 * Job Types Configuration
 *
 * Defines all job types available in the game.
 * Each job type specifies unlock conditions, costs, payouts, and prerequisites.
 */



/// Todo, tweak UI of training runs. Maybe while they are running, don't say "processing" say "Training" or such
// Players will just be clicking everything click click click, make it more clear to them in UI that some things happening are different



// Note that prereq and displayTrigger are very similar
// displayTrigger is optional, if it is not set, will defualt to prerequisite
// If they are both set, the displayTrigger will allow the button to be displayed, and prereq will be needed for it to be clicked.

// Prerequisite condition for unlocking a job
interface PrereqCondition {
    type: string;  // "job", "money", "iq", "autonomy", "generality", etc.
    value: string | number;  // job id (string) or numeric threshold
}

// Cost specification
interface CostSpec {
    type: string;  // "money", "data", "compute", etc.
    value: number;
}

// Payout specification
interface PayoutSpec {
    type: string;  // "money", "data", etc.
    min: number;
    max: number;
}

// Duration specification
interface DurationSpec {
    min: number;  // minimum seconds
    max: number;  // maximum seconds
}

// Job Type definition
interface JobType {
    id: string;              // Internal identifier (used for prereqs)
    displayName: string;     // Name shown to player
    description: string;     // Job description
    chapter: number | number[];  // Which chapter(s) this is available in
    prereq: PrereqCondition[];  // Prerequisites to display button to unlock this job type (empty array if none)
    displayTrigger?: PrereqCondition[];  // Optional: Override prereq for display visibility (button shows earlier but might be Disabled)
    unlockCost: CostSpec[];  // Cost to unlock this job type (empty array if free)
    cost?: CostSpec[];       // Cost to run this job (compute, data, etc.) (optional)
    payout: PayoutSpec[];    // What the job pays out
    duration?: DurationSpec; // How long the job takes (optional)
    category?: string;       // Job category (optional)
}

// ===== JOB TYPES =====
export const JOB_TYPES: JobType[] = [
       {
        id: "imgclassifier",
        displayName: "Image Classifier",
        description: "Find Waldo",
        chapter: [1,2,3],
        prereq: [],
        unlockCost: [],
        payout: [
            { type: "money", min: 10, max: 50 }
        ],
        duration: { min: 2, max: 3 },
        cost: [
            { type: "compute", value: 1 }
        ]
    },
    {
        id: "spellchecker",
        displayName: "Spell Checker",
        description: "How do you spell pepperoni?",
        chapter: [1,2],
        prereq: [
            { type: "job", value: "imgclassifier" }
	],
        unlockCost: [            { type: "money", value: 0 }],
        payout: [
            { type: "money", min: 10, max: 50 }
        ],
        duration: { min: 2, max: 3 },
        category: "tool",
        cost: [
            { type: "compute", value: 1 }
        ]
    },
    {
        id: "speechtran",
        displayName: "Speech Transcription",
        description: "",
        chapter: [1,2],
        prereq: [
		{type:"compute", value:2},
	    { type: "money", value: 20 },
            { type: "job", value: "spellchecker" }
	],
        unlockCost: [            { type: "money", value: 50 }],
        payout: [
            { type: "money", min: 40, max: 90 }
        ],
        duration: { min: 2, max: 3 },
        category: "tool",
        cost: [
            { type: "compute", value: 2 }
        ]
    },
    {
        id: "spamfileter",
        displayName: "Spam Filter",
        description: "",
        chapter: [1,2,3,4],
        prereq: [
	    { type: "money", value: 120 },
            { type: "job", value: "spellchecker" }
	],
        unlockCost: [            { type: "money", value: 150 }],
        payout: [
            { type: "money", min: 140, max: 190 }
        ],
        duration: { min: 2, max: 3 },
        category: "tool",
        cost: [
            { type: "compute", value: 2 }
        ]
    },

    {
        id: "routeopt",
        displayName: "Route Optimizer",
        description: "Popular with salesmen",
        chapter: [1,2,3,4],
        prereq: [
	    { type: "money", value: 80 },
            { type: "job", value: "spellchecker", display_prereq: false }
	],
        unlockCost: [            { type: "money", value: 100 }],
        payout: [
            { type: "money", min: 70, max: 150 }
        ],
        duration: { min: 2, max: 3 },
        category: "tool",
        cost: [
            { type: "compute", value: 3 }
        ]
    },


    //// Chapter 2

    {
        id: "webscrape",
        displayName: "Web Scraper",
        description: "Collect Data",
        chapter: [2,3,4,5],
        prereq: [],   // should unlock as soon as chapter 2 begins

        unlockCost: [            { type: "money", value: 100 }],
        payout: [
            { type: "data", min: 70, max: 150 }
        ],
        duration: { min: 3, max: 5 }, // todo Make slower
        category: "gameplay",
        cost: [
            { type: "compute", value: 2 },
            { type: "money", value: 50 }
        ]
    },


    {
        id: "chess",
        displayName: "Chess Engine",
        description: "",
        chapter: [2,3,4,5],
	displayTrigger: [ { type: "iq", value: 1 } ],
        prereq: [ { type: "iq", value: 2 } ],
        unlockCost: [            { type: "money", value: 100 }],
        payout: [
            { type: "money", min: 70, max: 150 }
        ],
        duration: { min: 2, max: 3 },
        category: "tool",
        cost: [
            { type: "compute", value: 3 }
        ]
    },


    {
        id: "goengine",
        displayName: "Go Engine",
        description: "",
        chapter: [2,3,4,5],
	displayTrigger: [ { type: "job", value: "chess", display_prereq: false } ],
        prereq: [ { type: "iq", value: 3 },
		  { type: "money", value:6000},
		  { type: "compute", value:6}
	],
        unlockCost: [            { type: "money", value: 100 }],
        payout: [                                                    { type: "money", min: 870, max: 1150 } ],
        duration:                                                    { min: 2, max: 3 },
        category: "tool",
        cost: [                                                  { type: "compute", value: 3 }]
    },



    // IQ-Gated Money Jobs (Requires IQ ≥ 2)
    {
        id: "medicaladvisor",
        displayName: "Medical Advisor",
        description: "Assist with medical research queries",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 1 }],
        prereq: [{ type: "iq", value: 2 }],
        unlockCost: [{ type: "money", value: 5000 }],
        payout: [{ type: "money", min: 700, max: 900 }],
        duration: { min: 38, max: 42 },
        cost: [{ type: "compute", value: 5 }],
        category: "tool"
    },
    {
        id: "legalresearch",
        displayName: "Legal Research Assistant",
        description: "Analyze case law and precedents",
        chapter: [2, 3, 4],
	displayTrigger: [ { type: "job", value: "medicaladvisor", display_prereq: false } ],
        prereq: [{ type: "iq", value: 3 }],
        unlockCost: [{ type: "money", value: 5000 }],
        payout: [{ type: "money", min: 650, max: 800 }],
        duration: { min: 34, max: 38 },
        cost: [{ type: "compute", value: 4 }],
        category: "tool"
    },



    {
        id: "synthdata",
        displayName: "Synthetic Data Generator",
        description: "More Data",
        chapter: [2,3,4,5,6,7],
	displayTrigger: [ { type: "job", value: "goengine", display_prereq: false } ],
        prereq: [ { type: "iq", value: 4 } ],
        unlockCost: [            { type: "money", value: 1000 }],
        payout: [
            { type: "data", min: 500, max: 550 }
        ],
        duration: { min: 9, max: 25 },
        category: "gameplay",
        cost: [
            { type: "compute", value: 4 },
            { type: "money", value: 500 }
        ]
    },


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
