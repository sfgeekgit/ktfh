/**
 * Job Types Configuration
 *
 * Defines all job types available in the game.
 * Each job type specifies unlock conditions, costs, payouts, and prerequisites.
 */

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
    prereq: PrereqCondition[];  // Prerequisites to unlock (empty array if none)
    unlockCost: CostSpec[];  // Cost to unlock this job type (empty array if free)
    cost?: CostSpec[];       // Cost to run this job (compute, data, etc.) (optional)
    payout: PayoutSpec[];    // What the job pays out
    duration?: DurationSpec; // How long the job takes (optional)
    category?: string;       // Job category (optional)
}

// ===== JOB TYPES =====
export const JOB_TYPES: JobType[] = [
    {
        id: "cheese",
        displayName: "Cheese",
        description: "Basic cheese pizza delivery",
        chapter: 1,
        prereq: [],
        unlockCost: [],
        payout: [
            { type: "money", min: 10, max: 50 }
        ],
        duration: { min: 2, max: 3 },
        category: "pizza",
        cost: [
            { type: "compute", value: 1 }
        ]
    },
    {
        id: "pepperoni",
        displayName: "Pepperoni",
        description: "Classic pepperoni pizza delivery",
        chapter: [1, 2],
        prereq: [
            { type: "job", value: "cheese" },
            { type: "money", value: 40 }
        ],
        unlockCost: [
            { type: "money", value: 50 }
        ],
        payout: [
            { type: "money", min: 20, max: 100 }
        ],
        duration: { min: 10, max: 20 },
        category: "pizza",
        cost: [
            { type: "compute", value: 1 }
        ]
    },
    {
        id: "supreme",
        displayName: "Supreme",
        description: "Supreme pizza with all the toppings",
        chapter: 1,
        prereq: [
            { type: "job", value: "pepperoni" }
        ],
        unlockCost: [
            { type: "money", value: 150 }
        ],
        payout: [
            { type: "money", min: 30, max: 150 }
        ],
        duration: { min: 10, max: 40 },
        category: "pizza",
        cost: [
            { type: "compute", value: 2 }
        ]
    },
    {
        id: "hawaiian",
        displayName: "Hawaiian",
        description: "Pineapple and ham pizza delivery",
        chapter: 1,
        prereq: [
            { type: "job", value: "supreme" },
            { type: "money", value: 300 }
        ],
        unlockCost: [
            { type: "money", value: 400 }
        ],
        payout: [
            { type: "money", min: 40, max: 200 }
        ],
        duration: { min: 10, max: 40 },
        category: "pizza",
        cost: [
            { type: "compute", value: 2 }
        ]
    },
    {
        id: "meat_lovers",
        displayName: "Meat Lovers",
        description: "Premium meat lovers pizza delivery",
        chapter: 1,
        prereq: [
            { type: "job", value: "hawaiian" }
        ],
        unlockCost: [
            { type: "money", value: 1000 }
        ],
        payout: [
            { type: "money", min: 50, max: 250 }
        ],
        duration: { min: 10, max: 40 },
        category: "pizza",
        cost: [
            { type: "compute", value: 3 }
        ]
    }
];
