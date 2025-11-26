/**
 * Job Types Configuration
 *
 * Defines all job types available in the game.
 * Each job type specifies unlock conditions, costs, payouts, and prerequisites.
 */

import { TRAINING_RUN_JOBS } from './trainingRuns';


// Todo "Universal Modeling Engine"     as a wonder from the TRAINING RUNS
// Autonomous Scientific Discovery Engine    as a wonder from the TRAINING RUNS
// AI-Orchestrated Megascale Engineering 



// Todo,  maybe web scraper should auto unlock at start of chapter 2

/// Todo, tweak UI of training runs. Maybe while they are running, don't say "processing" say "Training" or such
// Players will just be clicking everything click click click, make it more clear to them in UI that some things happening are different



// Note that prereq and displayTrigger are very similar
// displayTrigger is optional, if it is not set, will defualt to prerequisite
// If they are both set, the displayTrigger will allow the button to be displayed, and prereq will be needed for it to be clicked.

// Prerequisite condition for unlocking a job
export interface PrereqCondition {
    type: string;  // "job", "money", "iq", "autonomy", "generality", "choice", etc.
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
    acceptanceChance?: number;  // Probability of accepting on first click (0-1, default 1.0 = always accept)
    rejectionChain?: string[];  // Array of button texts to show when acceptance fails (e.g., ["No", "I don't want to"])
    is_wonder?: boolean;     // Whether this job creates a Wonder (default: false)
    bad_end?: boolean;       // Optional: marks jobs that trigger a bad ending (default false)
    path?: string;       // Tech tree path (optional) (not used yet)
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
            { type: "money", min: 20, max: 30 }
        ],
        duration: { min: 2, max: 4 },
        category: "tool",
        cost: [
            { type: "compute", value: 1 }
        ]
    },
    {
        id: "spellchecker",
        displayName: "Spell Checker",
        //description: "How do you spell pepperoni?",
        chapter: [1,2,3,4],
        prereq: [
            { type: "job", value: "imgclassifier", display_prereq: false  }
	    , 		{type:"compute", value:2 , display_prereq: false  }
	],
        unlockCost: [            { type: "money", value: 10 }],
        payout: [
            { type: "money", min: 25, max: 35 }
        ],
        duration: { min: 3, max: 6 },
        category: "tool",
        cost: [
            { type: "compute", value: 1 }
        ]
    },

    {
        id: "game1",
        displayName: "Digit Recognition",
        chapter: [99],
        prereq: [
	    {type:"compute", value:999 , display_prereq: false  },
	],
        unlockCost: [            { type: "money", value: 10 }],
        payout: [
            { type: "money", min: 20, max: 20 }
        ],
        duration: { min: 5, max: 5 },
        category: "tool",
        cost: [
            { type: "compute", value: 1 }
        ]
    },



    {
        id: "speechtran",
        displayName: "Speech Transcription",
        description: "",
        chapter: [1,2,3,4],
        prereq: [
		{type:"compute", value:3 , display_prereq: false  },
	    { type: "money", value: 50 },
            { type: "job", value: "spellchecker" }
	],
        unlockCost: [            { type: "money", value: 50 }],
        payout: [
            { type: "money", min: 40, max: 55 }
        ],
        duration: { min: 7, max: 10 },
        category: "tool",
        cost: [
            { type: "compute", value: 2 }
        ]
    },
    {
        id: "spamfilter",
        displayName: "Spam Filter",
        description: "",
        chapter: [1,2,3],
        prereq: [
	    { type: "money", value: 70 },
            { type: "job", value: "spellchecker" }
	],
        unlockCost: [            { type: "money", value: 80 }],
        payout: [
            { type: "money", min: 40, max: 60 }
        ],
        duration: { min: 5, max: 9 },
        category: "tool",
        cost: [
            { type: "compute", value: 2 }
        ]
    },

    {
        id: "routeopt",
        displayName: "Route Optimizer",
        description: "Popular with salesmen",
        chapter: [1,2,3],
        prereq: [
	    { type: "money", value: 280 },
            { type: "job", value: "speechtran", display_prereq: false }
	],
        unlockCost: [            { type: "money", value: 100 }],
        payout: [
            { type: "money", min: 50, max: 80 }
        ],
        duration: { min: 8, max: 11 },
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

        unlockCost: [            { type: "money", value: 10 }],
        payout: [
            { type: "data", min: 80, max: 110 }
        ],
        duration: { min: 7, max: 10 }, // todo Make slower
        category: "gameplay",
        cost: [
            { type: "compute", value: 1 },
            { type: "money", value: 20 }
        ]
    },


    {
        id: "chess",
        displayName: "Chess Engine",
        description: "",
        chapter: [2,3,4,5],
	displayTrigger: [ { type: "iq", value: 1 } ],
        prereq: [ { type: "iq", value: 2 } ],
        unlockCost: [            { type: "money", value: 300 }],
        payout: [
            { type: "money", min: 80, max: 100 }
	    ,             { type: "data", min: 5, max: 15 }
        ],
        duration: { min: 8, max: 11 },
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
	displayTrigger: [ { type: "job", value: "chess"} ],
        prereq: [ { type: "iq", value: 3 },
		  { type: "compute", value:6}
	],
        unlockCost: [            { type: "money", value: 500 }],
        payout: [
		{ type: "money", min: 90, max: 110 }
	    ,   { type: "data", min: 15, max: 25 }
	    ],
        duration: { min: 11, max: 15 },
        category: "tool",
        cost: [                                                  { type: "compute", value: 3 }]
    },


    /*
    // IQ-Gated Money Jobs (Requires IQ ≥ 2)
    {
        id: "legalresearch",
        displayName: "Legal Research Assistant",
        description: "Analyze case law and precedents",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 1 }],
        prereq: [{ type: "iq", value: 2 }],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [{ type: "money", min: 650, max: 800 }],
        duration: { min: 13, max: 17 },
        cost: [{ type: "compute", value: 4 }],
        category: "tool"
    },
    */

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
        duration: { min: 8, max: 11 },
        category: "gameplay",
        cost: [
            { type: "compute", value: 4 },
            { type: "money", value: 500 }
        ]
    },



//// Wonders (end game win)

     /**

    {
        id: "wonder5",
        displayName: "Recursive Self Improvement",
        description: "Dev",

	chapter: [2,3,4,5,6],
        prereq: [
            { type: "compute", value: 9 }
        ],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [
            { type: "wonder", min: 3, max: 3 }
	    , { type: "iq", min: 13, max: 13 }
        ],
        duration: { min: 20, max: 20 },
        category: "onetime",
	is_wonder: true,
        cost: [
            { type: "compute", value: 13 },
            { type: "money", value: 100 },
            { type: "data", value: 10 }
        ]
    },


    {
        id: "wonder6",
        displayName: "Autonomous Goal System",
        description: "Dev",

	chapter: [5,6],
        prereq: [
            { type: "compute", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 200 }],
        payout: [
            { type: "wonder", min: 3, max: 3 },
	     { type: "auto", min: 13, max: 13 }
            ],
        duration: { min: 3, max: 3 },
        category: "onetime",
	is_wonder: true,
        cost: [
            { type: "compute", value: 3 },
            { type: "money", value: 100 },
            { type: "data", value: 10 }
        ]
    },


    {
        id: "wonder7",
        displayName: "Civilization Management System",
        description: "Dev",

	chapter: [5,6],
        prereq: [
            { type: "compute", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 200 }],
        payout: [
            { type: "wonder", min: 3, max: 3 }
	    , { type: "auto", min: 5, max: 5 }
	    , { type: "generality", min: 4, max: 4 }
            ],
        duration: { min: 3, max: 3 },
        category: "onetime",
	is_wonder: true,
        cost: [
            { type: "compute", value: 3 },
            { type: "money", value: 100 },
            { type: "data", value: 10 }
        ]
    },
**/



    // Training runs are imported from trainingRuns.ts
    ...TRAINING_RUN_JOBS




/*

Science & Engineering Tech Tree

Job 1 is trigged by route opt

Scientific Data Processing                        
└── Rapid Science Modeling 
    └── Scientific Prediction Work             
        └── Structure Prediction         
            └── Molecular Structure Prediction 
                ├── Nanotechnology
	        │    └──Molecular Manufacturing   [WONDER]
		│       └──Materials Modeling Work    
                │          └── Materials Discovery        [WONDER]
                │
                └── Physics Pattern Recognition
		    └──Energy Modeling           // fusion-scale modeling + simulation
                       └── Fusion Energy              [WONDER]
                

*/



    ,{
        id: "sci1",
        displayName: "Scientific Data Processing",
        chapter: [2,3,4,5],
	prereq: [{ type: "job", value: "routeopt" }],
        unlockCost: [{ type: "money", value: 100 }],
        payout: [
            { type: "data", min: 80, max: 130 }
        ],
        duration: { min: 3, max: 4 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 3 }
        ]
    }

    ,{
        id: "sci2",
        displayName: "Rapid Science Modeling",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci1" }],
        unlockCost: [{ type: "money", value: 200 }],
        payout: [
            { type: "money", min: 144, max: 173 }
        ],
        duration: { min: 2, max: 8 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 4 }
        ]
    }

    ,{
        id: "sci3",
        displayName: "Scientific Prediction Work",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci2" }],
        unlockCost: [{ type: "money", value: 300 }],
        payout: [
            { type: "money", min: 192, max: 230 }
        ],
        duration: { min: 3, max: 9 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "sci4",
        displayName: "Structure Prediction",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci3" }],
        unlockCost: [{ type: "money", value: 500 }],
        payout: [
            { type: "money", min: 252, max: 302 }
        ],
        duration: { min: 4, max: 8 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 120 }
        ]
    }

    ,{
        id: "sci5",
        displayName: "Molecular Structure Prediction",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci4" }],
        unlockCost: [
            { type: "money", value: 500 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "money", min: 312, max: 374 }
        ],
        duration: { min: 5, max: 22 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 140 }
        ]
    }

    ,{
        id: "sci6",
        displayName: "Nanotechnology",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci5" }],
        unlockCost: [
            { type: "money", value: 600 },
            { type: "data", value: 180 }
        ],
        payout: [
            { type: "money", min: 372, max: 446 }
        ],
        duration: { min: 16, max: 24 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 160 }
        ]
    }

    ,{
        id: "sci7",
        displayName: "Molecular Manufacturing",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci6" }],
        unlockCost: [
            { type: "money", value: 8500 },
            { type: "data", value: 600 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "sci",
        cost: [
            { type: "compute", value: 9 },
            { type: "data", value: 700 }
        ]
    }

    ,{
        id: "sci8",
        displayName: "Materials Modeling Work",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci7" }],
        unlockCost: [
            { type: "money", value: 5200 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 312, max: 374 }
        ],
        duration: { min: 15, max: 22 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 150 }
        ]
    }

    ,{
        id: "sci9",
        displayName: "Materials Discovery",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci8" }],
        unlockCost: [
            { type: "money", value: 9000 },
            { type: "data", value: 700 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "sci",
        cost: [
            { type: "compute", value: 9 },
            { type: "data", value: 800 }
        ]
    }

    ,{
        id: "sci10",
        displayName: "Physics Pattern Recognition",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci5" }],
        unlockCost: [{ type: "money", value: 5200 }],
        payout: [
            { type: "money", min: 312, max: 374 }
        ],
        duration: { min: 15, max: 22 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 140 }
        ]
    }

    ,{
        id: "sci11",
        displayName: "Energy Modeling",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci10" }],
        unlockCost: [
            { type: "money", value: 7000 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 432, max: 518 }
        ],
        duration: { min: 16, max: 24 },
        category: "tool",
        path: "sci",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 200 }
        ]
    }

    ,{
        id: "sci12",
        displayName: "Fusion Energy",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci11" }],
        unlockCost: [
            { type: "money", value: 10000 },
            { type: "data", value: 800 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 20, max: 28 },
        category: "onetime",
        is_wonder: true,
        path: "sci",
        cost: [
            { type: "compute", value: 9 },
            { type: "data", value: 900 }
        ]
    }


/*

// Democracy (or not) path

path "dem"  

the first job (dem1) has a prereq of job spamfilter
        prereq: [{ type: "job", value: "spamfilter" }],


Sentiment Analysis
└── Digital Civic Information System  //  onetime job, pays +1 generality
    └── Public Sentiment Analysis     //   This triggers a choice by the player
        ├── Multi-Stakeholder Dialogue Support        // prereq is choice by player
        │   ├── Consensus Modeling 
        │   │   └── Identify Consensus   
        │   │       └── Democratic Consensus Synthesizer        [WONDER]
        │   │
        │   └── Narrative Transparency Frameworks  // onetime job, pays +1 generality
        │       └── Misinformation Detection 
        │           └── Information Integrity Audit
        │               └── Civic Trust Infrastructure          [WONDER]
        │
        └── Targeted Persuasion                   // prereq is choice by player
            ├── Political Microtargeting          // (pay a lot of money)
            │   └── AI-Driven Propaganda          // (cost mid data, pay a lot of money)
            │       └── Perception Manipulation Apparatus       [BAD WONDER]
            │
            └── Predictive Social Control 
                └── Population Compliance Modeling // NOT a onetime, a regular tool, but pays +1 auto. Costs a lot of data and money, locked until chapter 5
                    └── Algorithmic Authoritarianism            [BAD WONDER]

// To do!! Bad wonders lead to bad game ending.
// Done! test!



XX to do: add mental health path startgin from  "Multi-Stakeholder Dialogue"  (update, skip it)
This will be it's own path "menheal"  but will be triggered by the good dem choice dem4

// Also, these names could be better, this tree shorter, this is a placeholder atm


├── Multi-Stakeholder Dialogue  (ch2)           // prereq: choice:dem4
│   └── Mental Health Signal Tagging
│       └── Behavioral Pattern Analysis
│           └── Mood and Stress Classification
│               └── Early Crisis Detection
│                   └── Mental Health Check-ins
│                       └── Continuous Support Monitoring
│                           └── Mental Health Early-Warning Guardian   [GOOD WONDER]


Update -- Not doing Mental health tree/wonder. 
*/


    // Edu path


/*
Education Tech Tree

Digital Learning Platforms
├── Adaptive Education 
│   ├── Personalized Curriculum Generation
│   │   └── AI-Guided Study Coach
│   └── Multimodal Student Teaching
│       └── Real-Time Learning Assessment
│           └── Virtual Tutoring Service
│               └── Universal Education Tutor       [WONDER]
│
├── Language-Universal Instruction Tools
    └── Accessible Virtual Tutoring Systems
        └── Global Learning Network             [WONDER]

*/



,{
        id: "dem1",
        displayName: "Sentiment Analysis",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "spamfilter" }],
        unlockCost: [{ type: "money", value: 90 }],
        payout: [
            { type: "money", min: 144, max: 173 }
	    ,             { type: "data", min: 10, max: 20 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 4 }
        ]
    }

    ,{
        id: "dem2",
        displayName: "Digital Civic Information System",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem1", display_prereq: false },
	  	 { type: "iq", value: 2 }
		 , { type: "compute", value: 6 }],
        unlockCost: [{ type: "money", value: 400 }],
        payout: [
            { type: "generality", min: 1, max: 1 }
        ],
        duration: { min: 20, max: 25 },
        category: "onetime",
        path: "dem",
        cost: [
            { type: "compute", value: 4 },
            { type: "data", value: 150 }
        ]
    }

    ,{
        id: "dem3",
        displayName: "Public Sentiment Analysis",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem2" }],
        unlockCost: [
            { type: "money", value: 4200 },
            { type: "data", value: 160 }
        ],
        payout: [
            { type: "money", min: 216, max: 259 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 140 }
        ]
    }

    ,{
        id: "dem4",
        displayName: "Multi-Stakeholder Dialogue",
        chapter: [2,3,4,5],
        prereq: [{ type: "choice", value: "dem4" }],
        unlockCost: [{ type: "money", value: 3000 }],
        payout: [
            { type: "money", min: 168, max: 202 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "dem5",
        displayName: "Consensus Modeling Engine",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem4" }],
        unlockCost: [{ type: "money", value: 4200 }
		    , { type: "data", value: 4200 }
		    ],
        payout: [
            { type: "data", min: 5000, max: 5600 }
        ],
        duration: { min: 9, max: 12 },
        category: "onetime",
        path: "dem",
        cost: [
            { type: "compute", value: 9 },
            { type: "money", value: 1200 }
        ]
    }

    ,{
        id: "dem6",
        displayName: "Identify Consensus",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem5" }],
        unlockCost: [
            { type: "money", value: 5200 },
            { type: "data", value: 180 }
        ],
        payout: [
            { type: "money", min: 270, max: 324 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 150 }
        ]
    }

    ,{
        id: "dem7",
        displayName: "Democratic Consensus Synthesizer",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem6" }],
        unlockCost: [
            { type: "money", value: 7000 },
            { type: "data", value: 400 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "dem",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 500 }
        ]
    }

    ,{
        id: "dem8",
        displayName: "Narrative Transparency Frameworks",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem4" }],
        unlockCost: [
            { type: "money", value: 3600 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "generality", min: 1, max: 1 }
        ],
        duration: { min: 9, max: 12 },
        category: "onetime",
        path: "dem",
        cost: [
            { type: "compute", value: 5 },
            { type: "data", value: 150 }
        ]
    }

    ,{
        id: "dem9",
        displayName: "Misinformation Detection",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem8" }],
        unlockCost: [
            { type: "money", value: 4200 },
            { type: "data", value: 180 }
        ],
        payout: [
            { type: "money", min: 216, max: 259 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 160 }
        ]
    }

    ,{
        id: "dem10",
        displayName: "Information Integrity Audit",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem9" }],
        unlockCost: [
            { type: "money", value: 5200 },
            { type: "data", value: 220 }
        ],
        payout: [
            { type: "money", min: 276, max: 331 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 180 }
        ]
    }

    ,{
        id: "dem11",
        displayName: "Civic Trust Infrastructure",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem10" }],
        unlockCost: [
            { type: "money", value: 7600 },
            { type: "data", value: 500 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "dem",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 600 }
        ]
    }

    ,{
        id: "dem12",
        displayName: "Targeted Persuasion",
        chapter: [2,3,4,5],
        prereq: [{ type: "choice", value: "dem12" }],
        unlockCost: [{ type: "money", value: 3200 }],
        payout: [
            { type: "money", min: 384, max: 461 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "dem13",
        displayName: "Political Microtargeting",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem12" }],
        unlockCost: [
            { type: "money", value: 5000 }
        ],
        payout: [
            { type: "money", min: 552, max: 662 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 6 },
            { type: "money", value: 400 }
        ]
    }

    ,{
        id: "dem14",
        displayName: "AI-Driven Propaganda",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem13" }],
        unlockCost: [
            { type: "money", value: 6500 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 432, max: 518 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 220 }
        ]
    }

    ,{
        id: "dem15",
        displayName: "Perception Manipulation Apparatus",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem14" }],
        unlockCost: [
            { type: "money", value: 9000 },
            { type: "data", value: 600 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        bad_end: true,
        path: "dem",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 650 }
        ]
    }

    ,{
        id: "dem16",
        displayName: "Predictive Social Control",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "dem12" }],
        unlockCost: [
            { type: "money", value: 4600 },
            { type: "data", value: 160 }
        ],
        payout: [
            { type: "money", min: 252, max: 302 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 180 }
        ]
    }

    ,{
        id: "dem17",
        displayName: "Population Compliance Modeling",
        chapter: [5,6],
        prereq: [{ type: "job", value: "dem16" }],
        unlockCost: [
            { type: "money", value: 7200 },
            { type: "data", value: 400 }
        ],
        payout: [
            { type: "autonomy", min: 1, max: 1 },
            { type: "data", min: 200, max:300}
        ],
        duration: { min: 11, max: 15 },
        category: "tool",
        path: "dem",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 600 },
            { type: "data", value: 500 }
        ]
    }

    ,{
        id: "dem18",
        displayName: "Algorithmic Authoritarianism",
        chapter: [5,6],
        prereq: [{ type: "job", value: "dem17" }],
        unlockCost: [
            { type: "money", value: 11000 },
            { type: "data", value: 800 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 20, max: 28 },
        category: "onetime",
        is_wonder: true,
        bad_end: true,
        path: "dem",
        cost: [
            { type: "compute", value: 9 },
            { type: "data", value: 900 }
        ]
    }


,{
        id: "edu1",
        displayName: "Digital Learning Platform",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "choice", value: "edu1" }],
        unlockCost: [{ type: "money", value: 800 }],
        payout: [
            { type: "money", min: 96, max: 115 }
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 3 }
        ]
    }

    ,{
        id: "edu2",
        displayName: "Adaptive Education",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu1" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [
            { type: "money", min: 132, max: 158 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 4 }
        ]
    }

    ,{
        id: "edu3",
        displayName: "Personalized Curriculum Generation",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu2" }],
        unlockCost: [
            { type: "money", value: 3800 }
        ],
        payout: [
            { type: "money", min: 192, max: 230 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "edu4",
        displayName: "AI-Guided Study Coach",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu3" }],
        unlockCost: [
            { type: "money", value: 4800 },
            { type: "data", value: 150 }
        ],
        payout: [
            { type: "money", min: 312, max: 374 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 6 }
        ]
    }

    ,{
        id: "edu5",
        displayName: "Multimodal Student Teaching",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu2" }],
        unlockCost: [{ type: "money", value: 3400 }],
        payout: [
            { type: "money", min: 204, max: 245 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "edu6",
        displayName: "Real-Time Learning Assessment",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu5" }],
        unlockCost: [
            { type: "money", value: 4600 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "money", min: 276, max: 331 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 6 }
        ]
    }

    ,{
        id: "edu7",
        displayName: "Virtual Tutoring Service",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu6" }],
        unlockCost: [
            { type: "money", value: 6000 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 336, max: 403 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 7 }
        ]
    }

    ,{
        id: "edu8",
        displayName: "Universal Education Tutor",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu7" }],
        unlockCost: [
            { type: "money", value: 8500 },
            { type: "data", value: 700 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "edu",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 600 }
        ]
    }

    ,{
        id: "edu9",
        displayName: "Language-Universal Instruction Tools",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu1" }],
        unlockCost: [
            { type: "money", value: 3800 }
        ],
        payout: [
            { type: "money", min: 216, max: 259 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "edu10",
        displayName: "Accessible Virtual Tutoring Systems",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu9" }],
        unlockCost: [
            { type: "money", value: 5200 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "money", min: 312, max: 374 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "edu",
        cost: [
            { type: "compute", value: 6 }
        ]
    }

    ,{
        id: "edu11",
        displayName: "Global Learning Network",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu10" }],
        unlockCost: [
            { type: "money", value: 7800 },
            { type: "data", value: 600 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "edu",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 700 }
        ]
    }




    // Climate wonder path

/* // Climate tree

Climate Data Interpreter
├── Atmospheric Pattern Recognition
│   └── Micro-Climate Simulation
│   │   └── Highly Localized Weather Forecasting [WONDER]  
│   │
│   └── Satellite Signal Decomposition
│       └── Emissions Source Detection
│            └── Global Emissions Tracking [WONDER]  
│
└── Energy Grid Intelligence
    ├── Smart Grid Forecasting
    │   └── Anticipatory Wind and Solar
    │       └── Climate-Aware Grid Balancing [WONDER]

*/




    ,{
        id: "clim1",
        displayName: "Climate Data Interpreter",
        chapter: [1,2,3,4],
        prereq: [{ type: "choice", value: "clim1" }],   /// Unlocked via choice only!
        unlockCost: [{ type: "money", value: 50 }],
        payout: [
            { type: "money", min: 84, max: 101 }
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
	path: "clim",
        cost: [
            { type: "compute", value: 2 }
        ]
    }

    ,{
        id: "clim2",
        displayName: "Atmospheric Pattern Recognition",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim1" }],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [
            { type: "money", min: 120, max: 144 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "clim3",
        displayName: "Micro-Climate Simulation",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim2" }],
        unlockCost: [
            { type: "money", value: 3500 },
            { type: "data", value: 100 }
        ],
        payout: [
            { type: "money", min: 180, max: 216 },
            { type: "data", min: 80, max: 130 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 120 }
        ]
    }

    ,{
        id: "clim4",
        displayName: "Highly Localized Weather Forecasting",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim3" }],
        unlockCost: [
            { type: "data", value: 400 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 24 },
        category: "onetime",
        is_wonder: true,
        path: "clim",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 2800 },
            { type: "data", value: 500 }
        ]
    }

    ,{
        id: "clim5",
        displayName: "Satellite Signal Decomposition",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim2" }],
        unlockCost: [{ type: "money", value: 3200 }],
        payout: [
            { type: "money", min: 168, max: 202 },
            { type: "data", min: 70, max: 120 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 120 }
        ]
    }

    ,{
        id: "clim6",
        displayName: "Emissions Source Detection",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim5" }],
        unlockCost: [
            { type: "money", value: 4800 },
            { type: "data", value: 150 }
        ],
        payout: [
            { type: "money", min: 252, max: 302 },
            { type: "data", min: 150, max: 240 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 200 }
        ]
    }

    ,{
        id: "clim7",
        displayName: "Global Emissions Tracking",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim6" }],
        unlockCost: [
            { type: "money", value: 7000 },
            { type: "data", value: 700 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "clim",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 3200 },
            { type: "data", value: 600 }
        ]
    }

    ,{
        id: "clim8",
        displayName: "Energy Grid Intelligence",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "clim1" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [
            { type: "money", min: 132, max: 158 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 5 }
        ]
    }

    ,{
        id: "clim9",
        displayName: "Smart Grid Forecasting",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "clim8" }],
        unlockCost: [{ type: "money", value: 4000 }],
        payout: [
            { type: "money", min: 192, max: 230 },
            { type: "data", min: 60, max: 120 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 100 }
        ]
    }

    ,{
        id: "clim10",
        displayName: "Anticipatory Wind and Solar",
        chapter: [4,5],
        prereq: [{ type: "job", value: "clim9" }],
        unlockCost: [
            { type: "money", value: 5500 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "money", min: 288, max: 346 },
            { type: "data", min: 90, max: 160 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "clim",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 150 }
        ]
    }

    ,{
        id: "clim11",
        displayName: "Climate-Aware Grid Balancing",
        chapter: [4,5],
        prereq: [{ type: "job", value: "clim10" }],
        unlockCost: [
            { type: "money", value: 8000 },
            { type: "data", value: 650 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "clim",
        cost: [
            { type: "compute", value: 9 },
            { type: "money", value: 3600 },
            { type: "data", value: 750 }
        ]
    }



    /// Medical Wonder Path

    ,{
        id: "med1",
        displayName: "Medical Advisor",
        description: "Assist with medical research",
        chapter: [2,3,4],
        prereq: [{ type: "choice", value: "med1" }],   /// Unlocked via choice only!
        unlockCost: [{ type: "money", value: 1500 }],
        payout: [
            { type: "money", min: 84, max: 101 }
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
	path: "med",
        cost: [
            { type: "compute", value: 4 }
        ]
    },

    {
        id: "med2",
        displayName: "Enhanced Diagnostic Imaging",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med1" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [
            { type: "money", min: 120, max: 144 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 5 }
        ]
    },

    {
        id: "med3",
        displayName: "Personalized Medicine Engines",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med2" }],
        unlockCost: [{ type: "money", value: 4000 }],
        payout: [
            { type: "money", min: 180, max: 216 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 100 }
        ]
    },

    {
        id: "med4",
        displayName: "Precision Oncology",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med3" }],
        unlockCost: [{ type: "data", value: 400 }],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 24 },
        category: "onetime",
        is_wonder: true,
        path: "med",
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 3000 },
            { type: "data", value: 500 }
        ]
    },

    {
        id: "med5",
        displayName: "Protein Structure Prediction",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med2" }],
        unlockCost: [{ type: "money", value: 3500 }],
        payout: [
            { type: "money", min: 192, max: 230 },
            { type: "data", min: 80, max: 140 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 150 }
        ]
    },

    {
        id: "med6",
        displayName: "Molecular Interaction Modeling",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med5" }],
        unlockCost: [{ type: "money", value: 5000 }],
        payout: [
            { type: "money", min: 270, max: 324 },
            { type: "data", min: 120, max: 220 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "med7",
        displayName: "Drug Discovery AI",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med6" }],
        unlockCost: [
            { type: "money", value: 7000 },
            { type: "data", value: 300 }
        ],
        payout: [
            { type: "money", min: 390, max: 468 },
            { type: "data", min: 200, max: 350 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 300 }
        ]
    },

    {
        id: "med8",
        displayName: "Accelerated Drug Discovery",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med7" }],
        unlockCost: [
            { type: "money", value: 9000 },
            { type: "data", value: 800 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 },
            { type: "generality", min: 1, max: 1 },
            { type: "auto", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 26 },
        category: "onetime",
        is_wonder: true,
        path: "med",
        cost: [
            { type: "compute", value: 9 },
            { type: "money", value: 4000 },
            { type: "data", value: 800 }
        ]
    },

    {
        id: "med9",
        displayName: "Biomarker Analysis",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med1" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [
            { type: "money", min: 132, max: 158 },
            { type: "data", min: 40, max: 90 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 5 }
        ]
    },

    {
        id: "med10",
        displayName: "Early Disease Detection",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med9" }],
        unlockCost: [{ type: "money", value: 4000 }],
        payout: [
            { type: "money", min: 192, max: 230 },
            { type: "data", min: 50, max: 100 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 6 },
            { type: "data", value: 100 }
        ]
    },

    {
        id: "med11",
        displayName: "Predictive Medicine",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med10" }],
        unlockCost: [
            { type: "money", value: 5500 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "money", min: 300, max: 360 },
            { type: "data", min: 80, max: 160 }
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 7 },
            { type: "data", value: 150 }
        ]
    },

    {
        id: "med12",
        displayName: "Universal Disease Therapeutics",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med11" }],
        unlockCost: [
            { type: "money", value: 8500 },
            { type: "data", value: 700 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 18, max: 25 },
        category: "onetime",
        is_wonder: true,
        path: "med",
        cost: [
            { type: "compute", value: 9 },
            { type: "money", value: 3500 },
            { type: "data", value: 700 }
        ]
    },

    {
        id: "med13",
        displayName: "Regenerative Medicine Platforms",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med11" }],
        unlockCost: [
            { type: "money", value: 6500 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 330, max: 396 },
            { type: "data", min: 120, max: 220 }
        ],
        duration: { min: 10, max: 13 },
        category: "tool",
        path: "med",
        cost: [
            { type: "compute", value: 8 },
            { type: "data", value: 200 }
        ]
    },

    {
        id: "med14",
        displayName: "Reversal of Aging",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med13" }],
        unlockCost: [
            { type: "money", value: 10000 },
            { type: "data", value: 900 }
        ],
        payout: [
            { type: "wonder", min: 1, max: 1 }
        ],
        duration: { min: 20, max: 28 },
        category: "onetime",
        is_wonder: true,
        path: "med",
        cost: [
            { type: "compute", value: 10 },
            { type: "money", value: 4500 },
            { type: "data", value: 900 }
        ]
    },





/* // Medical tree

Basic Medical Advisor
├── Enhanced Diagnostic Imaging
    ├─ Personalized Medicine Engines
│   |  └── Precision Oncology [WONDER]  ============ 
|   └─Protein Structure Prediction
│     └── Molecular Interaction Modeling
│         └── Drug Discovery AI
│             └── Accelerated Drug Discovery [WONDER] ==========
├── Biomarker Analysis
|    └── Early Disease Detection
│       └── Predictive Medicine
│           ├── Universal Disease Therapeutics [WONDER]   ============
│           └── Regenerative Medicine Platforms
│               └── Reversal of Aging [WONDER]  ==========
*/




];
