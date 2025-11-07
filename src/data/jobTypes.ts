/**
 * Job Types Configuration
 *
 * Defines all job types available in the game.
 * Each job type specifies unlock conditions, costs, payouts, and prerequisites.
 */

import { TRAINING_RUN_JOBS } from './trainingRuns';



/// Todo, tweak UI of training runs. Maybe while they are running, don't say "processing" say "Training" or such
// Players will just be clicking everything click click click, make it more clear to them in UI that some things happening are different



// Note that prereq and displayTrigger are very similar
// displayTrigger is optional, if it is not set, will defualt to prerequisite
// If they are both set, the displayTrigger will allow the button to be displayed, and prereq will be needed for it to be clicked.

// Prerequisite condition for unlocking a job
export interface PrereqCondition {
    type: string;  // "job", "money", "iq", "autonomy", "generality", etc.
    value: string | number;  // job id (string) or numeric threshold
    display_prereq?: boolean;  // Optional: whether to display this prereq in UI
}

// Cost specification
export interface CostSpec {
    type: string;  // "money", "data", "compute", etc.
    value: number;
}

// Payout specification
export interface PayoutSpec {
    type: string;  // "money", "data", etc.
    min: number;
    max: number;
}

// Duration specification
export interface DurationSpec {
    min: number;  // minimum seconds
    max: number;  // maximum seconds
}

// Job Type definition
export interface JobType {
    id: string;              // Internal identifier (used for prereqs)
    displayName: string;     // Name shown to player
    description?: string;    // Job description (optional)
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
        //description: "How do you spell pepperoni?",
        chapter: [1,2,3],
        prereq: [
            { type: "job", value: "imgclassifier", display_prereq: false  }
	],
        unlockCost: [            { type: "money", value: 10 }],
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



///// Data

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

    // Training runs are imported from trainingRuns.ts
    ...TRAINING_RUN_JOBS

];
