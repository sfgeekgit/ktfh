/**
 * Job Types Configuration
 *
 * Defines all job types available in the game.
 * Each job type specifies unlock conditions, costs, payouts, and prerequisites.
 */

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
        chapter: [1,2,3],
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
        description: "So... Uhhhhh...",
        chapter: [1,2,3,4],
        prereq: [
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
        id: "routeopt",
        displayName: "Route Optimizer",
        description: "Popular with salesmen",
        chapter: [1,2,3,4],
        prereq: [
	    { type: "money", value: 80 },
            { type: "job", value: "spellchecker" }
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

    {
        id: "webscrape",
        displayName: "Web Scraper",
        description: "Collect Data",
        chapter: [2,3,4],
        prereq: [],   // should unlock as soon as chapter 2 begins

        unlockCost: [            { type: "money", value: 100 }],
        payout: [
            { type: "data", min: 70, max: 150 }
        ],
        duration: { min: 2, max: 3 },
        category: "gameplay",
        cost: [
            { type: "compute", value: 3 }
        ]
    },


    // TODO: new category "onetime" these are a new type of job that the player can run ONCE
    // These jobs should be added to the job queue exactly ONCE as soon as they are unlocked, no matter how many jobs are there already
    // These jobs are not in the pool of jobs that randomly get added to avaialble
    // These jobs CANNOT be dismissed by the player

    {
        id: "trun1",
        displayName: "Training Run",
        description: "Train a smarter base model",
        chapter: [2,3,4],
        prereq: [ 
	    	{ type: "data", value: 100 }
	    	],
	    
        unlockCost: [            { type: "data", value: 500 }], 
        payout: [
            { type: "iq", min: 1, max: 1 }
        ],
        duration: { min: 40, max: 40 },	
        category: "onetime",

        cost: [
            { type: "compute", value: 4 },
	    { type: "money", value: 100 }  // Can money be a cost? It should be. This should be displayed in the avaialbe jobs part of the UI

        ]
    },

    // Generality job chain - 3 sequential onetime jobs
    {
        id: "trun_mm1",
        displayName: "Multimodal Training Run",
        description: "Unlock more general abilities",
        chapter: [2,3,4],
        prereq: [
		    	{ type: "iq", value: 2 }
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
        displayName: "Multimodal Training 2",
        description: "+1 Generality",
        chapter: [2,3,4],
        prereq: [
            { type: "completedJob", value: "trun_mm1" }
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
        displayName: "Deeper Multimodal Training",
        description: "+1 Generality",
        chapter: [2,3,4],
        prereq: [
            { type: "completedJob", value: "trun_mm2" }
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
