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
    min: number;   // Single value; runtime max is derived (<=5 -> min, else floor(min * 1.3))
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
        chapter: [1,2],
        prereq: [],
        unlockCost: [],
        payout: [
            { type: "money", min: 20}
        ],
        duration: { min: 2, max: 4 },
        category: "tool",
    },
    {
        id: "spellchecker",
        displayName: "Spell Checker",
        //description: "How do you spell pepperoni?",
        chapter: [1,2],
        prereq: [
            { type: "job", value: "imgclassifier", display_prereq: false  }
	    , 		{type:"compute", value:2 , display_prereq: false  }
	],
        unlockCost: [            { type: "money", value: 10 }],
        payout: [
            { type: "money", min: 25}
        ],
        duration: { min: 3, max: 6 },
        category: "tool",
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
            { type: "money", min: 20}
        ],
        duration: { min: 5, max: 5 },
        category: "tool",
    },

    {
        id: "speechtran",
        displayName: "Speech Transcription",
        description: "",
        chapter: [1,2,3],
        prereq: [
		{type:"compute", value:3 , display_prereq: false  },
	    { type: "money", value: 50 },
            { type: "job", value: "spellchecker" }
	],
        unlockCost: [            { type: "money", value: 50 }],
        payout: [
            { type: "money", min: 40}
        ],
        duration: { min: 6, max: 8 },
        category: "tool",
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
            { type: "money", min: 40}
        ],
        duration: { min: 5, max: 8 },
        category: "tool",
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
            { type: "money", min: 50}
        ],
        duration: { min: 6, max: 8 },
        category: "tool",
    },

    //// Chapter 2

    {
        id: "webscrape",
        displayName: "Web Scraper",
        description: "Collect Data",
        chapter: [2,3,4],
        prereq: [],   // should unlock as soon as chapter 2 begins

        unlockCost: [            { type: "money", value: 10 }],
        payout: [
            { type: "data", min: 80}
        ],
        duration: { min: 9, max: 12 },
        category: "gameplay",
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
            { type: "money", min: 80}
	    ,             { type: "data", min: 5}
        ],
        duration: { min: 6, max: 8 },
        category: "tool",
    },

    {
        id: "goengine",
        displayName: "Go Engine",
        description: "",
        chapter: [2,3,4,5],
	displayTrigger: [ { type: "job", value: "chess"} ],
        prereq: [ { type: "iq", value: 3 },
		  { type: "compute", value:5}
	],
        unlockCost: [            { type: "money", value: 500 }],
        payout: [
		{ type: "money", min: 90}
	    ,   { type: "data", min: 15}
	    ],
        duration: { min: 7, max: 9 },
        category: "tool",
        displayTrigger: [{ type: "iq", value: 1 }],
        prereq: [{ type: "iq", value: 2 }],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [{ type: "money", min: 650}],
        duration: { min: 13, max: 17 },
	displayTrigger: [ { type: "job", value: "goengine", display_prereq: false } ],
        prereq: [ { type: "iq", value: 4 } ],
        unlockCost: [            { type: "money", value: 1000 }],
        payout: [
            { type: "data", min: 500}
        ],
        duration: { min: 9, max: 12 },
        category: "gameplay",
    },

//// Wonders (end game win)

     /**

    {
        id: "wonder5",
        displayName: "Recursive Self Improvement",
        description: "Dev",

	chapter: [2,3,4,5,6],
        prereq: [
            { type: "compute", value: 8 }
        ],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [
            { type: "wonder", min: 3}
	    , { type: "iq", min: 13}
        ],
        duration: { min: 20, max: 20 },
        category: "onetime",
	is_wonder: true,
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
            { type: "wonder", min: 3},
	     { type: "autonomy", min: 13}
            ],
        duration: { min: 3, max: 3 },
        category: "onetime",
	is_wonder: true,
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
            { type: "wonder", min: 3}
	    , { type: "autonomy", min: 5}
	    , { type: "generality", min: 4}
            ],
        duration: { min: 3, max: 3 },
        category: "onetime",
	is_wonder: true,
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
            { type: "data", min: 80}
        ],
        duration: { min: 3, max: 4 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci2",
        displayName: "Rapid Science Modeling",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci1" }
		 , { type: "money", value: 240 , display_prereq: false}],
        unlockCost: [{ type: "money", value: 250 }],
        payout: [
            { type: "money", min: 144},
	    { type: "data", min: 20}
        ],
        duration: { min: 2, max: 8 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci3",
        displayName: "Scientific Prediction Work",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci2" },
		{type:"iq", value:2}
		 , { type: "money", value: 480 , display_prereq: false}],
        unlockCost: [{ type: "money", value: 500 }],
        payout: [
            { type: "money", min: 192},
	    { type: "data", min: 20}
	    ],
        duration: { min: 3, max: 9 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci4",
        displayName: "Structure Prediction",
        chapter: [2,3,4,5],
		displayTrigger: [ { type: "job", value: "sci3" } ],	
        prereq: [{ type: "job", value: "sci3" }
		 , {type:"iq", value:3}
		 , { type: "money", value: 680 , display_prereq: false}],
        unlockCost: [{ type: "money", value: 700 }],
        payout: [
            { type: "data", min: 100}
        ],
        duration: { min: 4, max: 8 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci5",
        displayName: "Molecular Structure Prediction",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci4" }
		 , {type:"iq", value:4}],
        unlockCost: [
            { type: "money", value: 900 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "money", min: 312}
        ],
        duration: { min: 5, max: 9 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci6",
        displayName: "Nanotechnology",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci5" }
		 , {type:"autonomy", value:2}],
        unlockCost: [
            { type: "money", value: 1200 },
            { type: "data", value: 400 }
        ],
        payout: [
            { type: "money", min: 372}
        ],
        duration: { min: 15, max: 18 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci7",
        displayName: "Molecular Manufacturing",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci6" }],
        unlockCost: [
            { type: "money", value: 2000 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "wonder", min: 1}
        ],
        duration: { min: 8, max: 11 },
        category: "onetime",
        is_wonder: true,
        path: "sci",
    }

    ,{
        id: "sci8",
        displayName: "Materials Modeling Work",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci7" }
		 , { type: "money", value: 2200 , display_prereq: false}],

        unlockCost: [
            { type: "money", value: 2200 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 312}
        ],
        duration: { min: 14, max: 17 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci9",
        displayName: "Materials Discovery",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci8" }],
        unlockCost: [
            { type: "money", value: 4000 },
            { type: "data", value: 800 }
        ],
        payout: [
            { type: "wonder", min: 1}
	    , {type: "generality", min:1}
	    , {type: "autonomy", min:1}
        ],
        duration: { min: 8, max: 11 },
        category: "onetime",
        is_wonder: true,
        path: "sci",
    }

    ,{
        id: "sci10",
        displayName: "Physics Pattern Recognition",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci5" }
		, {type : "generality", value: 3}
		 , { type: "money", value: 1300 , display_prereq: false}],

        unlockCost: [{ type: "money", value: 1200 }],
        payout: [
            { type: "money", min: 442}
        ],
        duration: { min: 6, max: 9 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci11",
        displayName: "Atomic Energy Modeling",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "sci10" }
		, { type: "money", value: 1500 , display_prereq: false}],
        unlockCost: [
            { type: "money", value: 1500 },
            { type: "data", value: 200 }
        ],
        payout: [
            { type: "money", min: 250}
        ],
        duration: { min: 10, max: 14 },
        category: "tool",
        path: "sci",
    }

    ,{
        id: "sci12",
        displayName: "Fusion Energy",
        chapter: [2,3,4,5],
	displayTrigger: [ { type: "job", value: "sci11" } ],
        prereq: [{ type: "job", value: "sci11" }
		, {type: "iq", value: 7}],
        unlockCost: [
            { type: "money", value: 5000 },
            { type: "data", value: 800 }
        ],
        payout: [
            { type: "wonder", min: 1}
        ],
        duration: { min: 10, max: 14 },
        category: "onetime",
        is_wonder: true,
        path: "sci",
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
        chapter: [2,3,4],
        prereq: [{ type: "job", value: "spamfilter" }
	        ,{ type:"compute", value:4 , display_prereq: false  }],
        unlockCost: [{ type: "money", value: 90 }],
        payout: [
            { type: "money", min: 144}
	    ,             { type: "data", min: 10}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem2",
        displayName: "Digital Civic Information System",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem1"} // , display_prereq: false } // Why not display this?
	  	 , { type: "iq", value: 2 }
		 , { type: "compute", value: 5 }
		 , { type: "money", value: 300 }],
        unlockCost: [{ type: "money", value: 400 }],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: 20, max: 25 },
        category: "onetime",
        path: "dem",
    }

    ,{
        id: "dem3",
        displayName: "Public Sentiment Analysis",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem2" }
		, { type: "money", value: 700 , display_prereq: false}],
        unlockCost: [
            { type: "money", value: 700 },
            { type: "data", value: 30 }
        ],
        payout: [
            { type: "money", min: 216}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem4",
        displayName: "Multi-Stakeholder Dialogue",
        chapter: [2,3,4,5],
        prereq: [{ type: "choice", value: "dem4" }
		, { type: "money", value: 800 , display_prereq: false}],
        unlockCost: [{ type: "money", value: 800 }],
        payout: [
            { type: "money", min: 168}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem5",
        displayName: "Consensus Modeling Engine",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem4" }
		, { type: "money", value: 900 , display_prereq: false}],
        unlockCost: [{ type: "money", value: 900 }],
        payout: [
            { type: "data", min: 90}
        ],
        duration: { min: 9, max: 12 },
        category: "onetime",
        path: "dem",
    }

    ,{
        id: "dem6",
        displayName: "Identify Consensus",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem5" }
		, { type: "money", value: 1600 , display_prereq: false}],	
        unlockCost: [
            { type: "money", value: 1600 },
            { type: "data", value: 180 }
        ],
        payout: [
            { type: "money", min: 200}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem7",
        displayName: "Democratic Consensus Synthesizer",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem6" }],
        unlockCost: [
            { type: "money", value: 3000 },
            { type: "data", value: 1400 }
        ],
        payout: [
            { type: "wonder", min: 1},
	    { type: "generality", min: 1}
        ],
        duration: { min: 5, max: 7 },
        category: "onetime",
        is_wonder: true,
        path: "dem",
    }

    ,{
        id: "dem8",
        displayName: "Narrative Transparency Frameworks",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "dem4" }
		, { type: "money", value: 1200 , display_prereq: false}],
        unlockCost: [
            { type: "money", value: 1200 },
            { type: "data", value: 120 }
        ],
        payout: [
            { type: "generality", min: 1}
        ],
        duration: { min: 7, max: 10 },
        category: "onetime",
        path: "dem",
    }

    ,{
        id: "dem9",
        displayName: "Misinformation Detection",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem8" }
		, { type: "money", value: 1200 , display_prereq: false}],	
        unlockCost: [
            { type: "money", value: 1200 },
            { type: "data", value: 180 }
        ],
        payout: [
            { type: "money", min: 286}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem10",
        displayName: "Information Integrity Audit",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem9" }
		, { type: "money", value: 1400 , display_prereq: false}],		
        unlockCost: [
            { type: "money", value: 1400 },
            { type: "data", value: 220 }
        ],
        payout: [
            { type: "money", min: 276}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem11",
        displayName: "Civic Trust Infrastructure",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem10" }],
        unlockCost: [
            { type: "money", value: 4000 },
            { type: "data", value: 500 }
        ],
        payout: [
            { type: "wonder", min: 1},
	    { type: "generality", min: 2}
        ],
        duration: { min: 6, max: 11 },
        category: "onetime",
        is_wonder: true,
        path: "dem",
    }

    ,{
        id: "dem12",
        displayName: "Targeted Persuasion",
        chapter: [2,3,4,5],
        prereq: [{ type: "choice", value: "dem12" }],
        unlockCost: [{ type: "money", value: 300 }],
        payout: [
            { type: "money", min: 304}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem13",
        displayName: "Political Microtargeting",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem12" }
		, { type: "money", value: 500 , display_prereq: false}],		
        unlockCost: [
            { type: "money", value: 500 }
        ],
        payout: [
            { type: "money", min: 422}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem14",
        displayName: "AI-Driven Propaganda",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem13" }],
        unlockCost: [
            { type: "money", value: 600 },
            { type: "data", value: 1200 }
        ],
        payout: [
            { type: "money", min: 522}

        ],
        duration: { min: 7, max: 11 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem15",
        displayName: "Total Perception Manipulation",
        chapter: [2,3,4,5],
        prereq: [{ type: "job", value: "dem14" }],
        unlockCost: [
            { type: "money", value: 5000 },
            { type: "data", value: 600 }
        ],
        payout: [
            { type: "wonder", min: 1}
        ],
        duration: { min: 4, max: 6 },
        category: "onetime",
        is_wonder: true,
        bad_end: true,
        path: "dem",
    }

    ,{
        id: "dem16",
        displayName: "Predictive Social Control",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "dem12" }
		, { type: "money", value: 700 , display_prereq: false}],		
        unlockCost: [
            { type: "money", value: 700 }
        ],
        payout: [
            { type: "money", min: 252}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem17",
        displayName: "Population Compliance Modeling",
        chapter: [5,6],
        prereq: [{ type: "job", value: "dem16" }
			, { type: "money", value: 1200 , display_prereq: false}],
        unlockCost: [
            { type: "money", value: 1200 },
            { type: "data", value: 100 }
        ],
        payout: [
            { type: "autonomy", min: 1}
        ],
        duration: { min: 44, max: 55 },
        category: "tool",
        path: "dem",
    }

    ,{
        id: "dem18",
        displayName: "Algorithmic Authoritarianism",
        chapter: [5,6],
        prereq: [{ type: "job", value: "dem17" }],
        unlockCost: [
            { type: "money", value: 5000 },
            { type: "data", value: 800 }
        ],
        payout: [
            { type: "wonder", min: 1}
        ],
        duration: { min: 4, max: 6 },
        category: "onetime",
        is_wonder: true,
        bad_end: true,
        path: "dem",
    }

,{
        id: "edu1",
        displayName: "Digital Learning Platform",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "choice", value: "edu1" }],
        unlockCost: [{ type: "money", value: 800 }],
        payout: [
            { type: "money", min: 96}
        ],
        duration: { min: 7, max: 10 },
        category: "tool",
        path: "edu",
    }

    ,{
        id: "edu2",
        displayName: "Adaptive Education",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu1" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [
            { type: "money", min: 132}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "edu",
    }
    /*
    ,{
        id: "edu3",
        displayName: "Personalized Curriculum Generation",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu2" }],
        unlockCost: [
            { type: "money", value: 3800 }
        ],
        payout: [
            { type: "money", min: 192}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "edu",
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
            { type: "money", min: 312}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "edu",
    }
    */
    ,{
        id: "edu5",
        displayName: "Multimodal Student Teaching",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "edu2" }],
        unlockCost: [{ type: "money", value: 3400 }],
        payout: [
            { type: "money", min: 204}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "edu",
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
            { type: "money", min: 276}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "edu",
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
            { type: "money", min: 336}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
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
            { type: "wonder", min: 1}
        ],
        duration: { min: 6, max: 8 },
        category: "onetime",
        is_wonder: true,
        path: "edu",
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
            { type: "money", min: 216}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
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
            { type: "money", min: 312}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "edu",
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
            { type: "wonder", min: 1}
        ],
        duration: { min: 6, max: 8 },
        category: "onetime",
        is_wonder: true,
        path: "edu",
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
            { type: "money", min: 84}
        ],
        duration: { min: 7, max: 10 },
        category: "tool",
	path: "clim",
    }

    ,{
        id: "clim2",
        displayName: "Atmospheric Pattern Recognition",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim1" }],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [
            { type: "money", min: 120}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "clim",
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
            { type: "money", min: 180},
            { type: "data", min: 80}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "clim",
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
            { type: "wonder", min: 1}
        ],
        duration: { min: 6, max: 8 },
        category: "onetime",
        is_wonder: true,
        path: "clim",
    }
    /*
    ,{
        id: "clim5",
        displayName: "Satellite Signal Decomposition",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim2" }],
        unlockCost: [{ type: "money", value: 3200 }],
        payout: [
            { type: "money", min: 168},
            { type: "data", min: 70}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
    }
    */
    ,{
        id: "clim6",
        displayName: "Emissions Source Detection",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "clim4" }],
        unlockCost: [
            { type: "money", value: 4800 },
            { type: "data", value: 150 }
        ],
        payout: [
            { type: "money", min: 252},
            { type: "data", min: 150}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
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
            { type: "wonder", min: 1}
        ],
        duration: { min: 6, max: 8 },
        category: "onetime",
        is_wonder: true,
        path: "clim",
    }

    ,{
        id: "clim8",
        displayName: "Energy Grid Intelligence",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "clim1" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [
            { type: "money", min: 132}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "clim",
    }

    ,{
        id: "clim9",
        displayName: "Smart Grid Forecasting",
        chapter: [3,4,5],
        prereq: [{ type: "job", value: "clim8" }],
        unlockCost: [{ type: "money", value: 4000 }],
        payout: [
            { type: "money", min: 192},
            { type: "data", min: 60}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "clim",
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
            { type: "money", min: 288},
            { type: "data", min: 90}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "clim",
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
            { type: "wonder", min: 1}
        ],
        duration: { min: 6, max: 8 },
        category: "onetime",
        is_wonder: true,
        path: "clim",
    }

    /// Medical Wonder Path

    ,{
        id: "med1",
        displayName: "Medical Advisor",
        description: "Assist with medical research",
        chapter: [2,3,4],
        prereq: [{ type: "choice", value: "med1" }],   /// Unlocked via choice only!
        unlockCost: [{ type: "money", value: 800 }],
        payout: [
            { type: "money", min: 120}
        ],
        duration: { min: 7, max: 9 },
        category: "tool",
	path: "med",
    },

    {
        id: "med2",
        displayName: "Diagnostic Imaging",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med1" }
		, { type: "money", value: 800 }],
        unlockCost: [{ type: "money", value: 800 }],
        payout: [
            { type: "money", min: 160}
        ],
        duration: { min: 7, max: 10 },
        category: "tool",
        path: "med",
    },

    {
        id: "med3",
        displayName: "Personalized Medicine Engines",
        chapter: [1,2,3,4,5],
        prereq: [
            { type: "job", value: "med2" },
            { type: "iq", value: 3 },
            { type: "generality", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [
            { type: "money", min: 220}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
    },

    {
        id: "med4",
        displayName: "Precision Oncology",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med3" }],
        unlockCost: [{ type: "data", value: 1500 }
  	            ,{ type: "money", value: 3000 }
		    ],
        payout: [
            { type: "wonder", min: 1}
        ],
        duration: { min: 8, max: 11 },
        category: "onetime",
        is_wonder: true,
        path: "med",
    },

    {
        id: "med5",
        displayName: "Protein Structure Prediction",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med2" }
		,{type: "iq", value:3}
		,{type: "compute", value: 7, display_prereq: false}
		, { type: "money", value: 1000 , display_prereq: false}],

        unlockCost: [{ type: "money", value: 1000 }],
        payout: [
            { type: "data", min: 120}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
    },

    {
        id: "med6",
        displayName: "Protein Interaction Modeling",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med5" }
		, { type: "money", value: 2000 , display_prereq: false}],
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [
            { type: "iq", min:1},
            { type: "generality", min:1}
        ],
        duration: { min: 9, max: 12 },
        category: "onetime",
        path: "med",
    },

    {
        id: "med7",
        displayName: "Drug Discovery AI",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med6" }
	        , { type: "money", value: 2000 , display_prereq: false}],

        unlockCost: [
            { type: "money", value: 2000 },
            { type: "data", value: 300 }
        ],
        payout: [
            { type: "money", min: 280},
            { type: "data", min: 200}
        ],
        duration: { min: 9, max: 12 },
        category: "tool",
        path: "med",
    },

    {
        id: "med8",
        displayName: "Accelerated Drug Discovery",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med7" }],
        unlockCost: [
            { type: "money", value: 3500 },
            { type: "data", value: 1800 }
        ],
        payout: [
            { type: "wonder", min: 1},
            { type: "generality", min: 1},
            { type: "autonomy", min: 1}
        ],
        duration: { min: 10, max: 12 },
        category: "onetime",
        is_wonder: true,
        path: "med",
    },

    {
        id: "med9",
        displayName: "Biomarker Analysis",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med1" }
		, { type: "money", value: 1000, display_prereq: false }],
        unlockCost: [{ type: "money", value: 1000 }],
        payout: [
            { type: "money", min: 132},
            { type: "data", min: 40}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "med",
    },

    {
        id: "med10",
        displayName: "Early Disease Detection",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med9" }
		, { type: "money", value: 1500 , display_prereq: false}],		
        unlockCost: [{ type: "money", value: 1500 }],
        payout: [{ type: "money", min: 260}],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "med",
    },

    {
        id: "med11",
        displayName: "Predictive Medicine",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med10" }
		, { type: "money", value: 2000 , display_prereq: false}],
        unlockCost: [
            { type: "money", value: 2000 },
            { type: "data", value: 600 }
        ],
        payout: [
            { type: "money", min: 300}
        ],
        duration: { min: 8, max: 11 },
        category: "tool",
        path: "med",
    },

    {
        id: "med12",
        displayName: "Universal Disease Therapeutics",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med11" }
            	,{ type: "iq", value: 7 }
            	,{ type: "autonomy", value: 3 }
            	,{ type: "generality", value: 6 }
	        ],
        unlockCost: [
            { type: "money", value: 3000 },
            { type: "data", value: 1700 }
        ],
        payout: [
            { type: "wonder", min: 1}
	    ,{ type: "iq", min: 1}
	    ,{ type: "generality", min: 1}	
        ],
        duration: { min: 10, max: 15 },
        category: "onetime",
        is_wonder: true,
        path: "med",
    },

    {
        id: "med13",
        displayName: "Regenerative Medicine Platforms",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med11" }
		, { type: "money", value: 2400 , display_prereq: false}],
        unlockCost: [
            { type: "money", value: 2700 },
            { type: "data", value: 400 }
        ],
        payout: [
            { type: "money", min: 430}

        ],
        duration: { min: 7, max: 10 },
        category: "tool",
        path: "med",
    },

    {
        id: "med14",
        displayName: "Reversal of Aging",
        chapter: [1,2,3,4,5],
        prereq: [{ type: "job", value: "med13" }
		, { type:"iq", value: 8}],
        unlockCost: [
            { type: "money", value: 4000 },
            { type: "data", value: 1000 }
        ],
        payout: [
            { type: "wonder", min: 1}
        ],
        duration: { min: 10, max: 14 },
        category: "onetime",
        is_wonder: true,
        path: "med",
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
