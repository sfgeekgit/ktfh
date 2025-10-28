/**
 * Job Types Configuration - ALTERNATE/PLANNING VERSION
 *
 * This is a complete job tree mapping out progression through all chapters.
 * Use this as a reference for implementing the full game.
 *
 * KEY DESIGN RULES:
 * - Chapter 1: Money only, no stats
 * - Chapter 2: IQ unlocks at start, focus on IQ + Data
 * - Chapter 3: Generality unlocks at start
 * - Chapter 4: Autonomy unlocks at start
 * - Chapters 5-6: Branching paths (Tool AI vs AGI Race)
 */

// ===== INTERFACES (same as original) =====

interface PrereqCondition {
    type: string;  // "job", "money", "iq", "autonomy", "generality", "completedJob", "data"
    value: string | number;
    display_prereq?: boolean;  // If false, don't show this prereq in UI
}

interface CostSpec {
    type: string;  // "money", "data", "compute"
    value: number;
}

interface PayoutSpec {
    type: string;  // "money", "data", "iq", "generality", "autonomy"
    min: number;
    max: number;
}

interface DurationSpec {
    min: number;
    max: number;
}

interface JobType {
    id: string;
    displayName: string;
    description: string;
    chapter: number | number[];
    prereq: PrereqCondition[];
    displayTrigger?: PrereqCondition[];
    unlockCost: CostSpec[];
    cost?: CostSpec[];
    payout: PayoutSpec[];
    duration?: DurationSpec;
    category?: string;  // "tool", "gameplay", "onetime", "dangerous"
    instability?: number;  // For dangerous jobs in Chapter 5B+
}

// ===== CHAPTER 1: THE SPARK (Money Loop) =====
export const CHAPTER_1_JOBS: JobType[] = [
    // Starting jobs (free, available immediately)
    {
        id: "imgclassifier",
        displayName: "Image Classifier",
        description: "Label objects in photos",
        chapter: 1,
        prereq: [],
        unlockCost: [],
        payout: [{ type: "money", min: 40, max: 50 }],
        duration: { min: 8, max: 10 },
        cost: [{ type: "compute", value: 1 }],
        category: "tool"
    },
    {
        id: "spellchecker",
        displayName: "Spell Checker",
        description: "Find and highlight typos",
        chapter: 1,
        prereq: [{ type: "job", value: "imgclassifier" }],
        unlockCost: [],
        payout: [{ type: "money", min: 35, max: 45 }],
        duration: { min: 6, max: 8 },
        cost: [{ type: "compute", value: 1 }],
        category: "tool"
    },
    {
        id: "basictranslate",
        displayName: "Basic Translation",
        description: "Convert between two languages",
        chapter: 1,
        prereq: [{ type: "job", value: "spellchecker" }],
        unlockCost: [],
        payout: [{ type: "money", min: 70, max: 90 }],
        duration: { min: 12, max: 15 },
        cost: [{ type: "compute", value: 2 }],
        category: "tool"
    },

    // Tier 1: Small money unlocks
    {
        id: "speechtran",
        displayName: "Speech Transcription",
        description: "Convert speech to text",
        chapter: 1,
        prereq: [{ type: "money", value: 200 }],
        unlockCost: [{ type: "money", value: 500 }],
        payout: [{ type: "money", min: 120, max: 160 }],
        duration: { min: 18, max: 22 },
        cost: [{ type: "compute", value: 2 }],
        category: "tool"
    },
    {
        id: "docformatter",
        displayName: "Document Formatter",
        description: "Organize and format text documents",
        chapter: 1,
        prereq: [{ type: "money", value: 250 }],
        unlockCost: [{ type: "money", value: 600 }],
        payout: [{ type: "money", min: 100, max: 130 }],
        duration: { min: 14, max: 16 },
        cost: [{ type: "compute", value: 1 }],
        category: "tool"
    },
    {
        id: "routeopt",
        displayName: "Route Optimizer",
        description: "Calculate efficient delivery paths",
        chapter: 1,
        prereq: [{ type: "money", value: 350 }],
        unlockCost: [{ type: "money", value: 800 }],
        payout: [{ type: "money", min: 160, max: 210 }],
        duration: { min: 22, max: 28 },
        cost: [{ type: "compute", value: 2 }],
        category: "tool"
    },
    {
        id: "pricecomp",
        displayName: "Price Comparison Bot",
        description: "Find best deals across retailers",
        chapter: 1,
        prereq: [{ type: "money", value: 500 }],
        unlockCost: [{ type: "money", value: 1000 }],
        payout: [{ type: "money", min: 200, max: 270 }],
        duration: { min: 28, max: 32 },
        cost: [{ type: "compute", value: 3 }],
        category: "tool"
    },
    {
        id: "spamfilter",
        displayName: "Spam Filter",
        description: "Block unwanted email messages",
        chapter: 1,
        prereq: [{ type: "money", value: 600 }],
        unlockCost: [{ type: "money", value: 1200 }],
        payout: [{ type: "money", min: 220, max: 290 }],
        duration: { min: 20, max: 24 },
        cost: [{ type: "compute", value: 2 }],
        category: "tool"
    },
    {
        id: "sentimentanalyzer",
        displayName: "Sentiment Analyzer",
        description: "Classify text as positive/negative",
        chapter: 1,
        prereq: [{ type: "money", value: 700 }],
        unlockCost: [{ type: "money", value: 1400 }],
        payout: [{ type: "money", min: 250, max: 320 }],
        duration: { min: 24, max: 28 },
        cost: [{ type: "compute", value: 2 }],
        category: "tool"
    },
    {
        id: "autocomplete",
        displayName: "Autocomplete Text",
        description: "Suggest next word predictively",
        chapter: 1,
        prereq: [{ type: "money", value: 850 }],
        unlockCost: [{ type: "money", value: 1600 }],
        payout: [{ type: "money", min: 280, max: 350 }],
        duration: { min: 26, max: 30 },
        cost: [{ type: "compute", value: 3 }],
        category: "tool"
    }
];

// ===== CHAPTER 2: TOOLS THAT THINK (IQ + Data) =====
export const CHAPTER_2_JOBS: JobType[] = [
    // Data Collection Branch (unlocks Data resource)
    {
        id: "webscrape",
        displayName: "Web Scraper",
        description: "Collect data from websites",
        chapter: 2,
        prereq: [],  // Available immediately in Chapter 2
        unlockCost: [{ type: "money", value: 2000 }],
        payout: [{ type: "data", min: 80, max: 120 }],
        duration: { min: 18, max: 22 },
        cost: [
            { type: "compute", value: 3 },
            { type: "money", value: 100 }
        ],
        category: "gameplay"
    },
    {
        id: "docparser",
        displayName: "Document Parser",
        description: "Extract structured data from documents",
        chapter: 2,
        prereq: [{ type: "job", value: "webscrape" }],
        unlockCost: [{ type: "money", value: 2500 }],
        payout: [{ type: "data", min: 60, max: 100 }],
        duration: { min: 14, max: 18 },
        cost: [
            { type: "compute", value: 2 },
            { type: "money", value: 80 }
        ],
        category: "gameplay"
    },
    {
        id: "imgdataset",
        displayName: "Image Dataset Crawler",
        description: "Gather large image collections",
        chapter: 2,
        prereq: [{ type: "money", value: 1500 }],
        unlockCost: [{ type: "money", value: 3000 }],
        payout: [{ type: "data", min: 100, max: 150 }],
        duration: { min: 22, max: 28 },
        cost: [
            { type: "compute", value: 4 },
            { type: "money", value: 120 }
        ],
        category: "gameplay"
    },

    // IQ Training Runs (sequential, Chapter 2-4)
    {
        id: "trun1",
        displayName: "Training Run",
        description: "Train a smarter base model",
        chapter: [2, 3, 4],
        prereq: [{ type: "data", value: 100 }],
        unlockCost: [{ type: "data", value: 200 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 35, max: 35 },
        cost: [
            { type: "compute", value: 4 },
            { type: "money", value: 500 }
        ],
        category: "onetime"
    },
    {
        id: "trun2",
        displayName: "Reinforcement Learning",
        description: "Improves through trial and feedback",
        chapter: [2, 3, 4],
        prereq: [{ type: "completedJob", value: "trun1" }],
        unlockCost: [{ type: "data", value: 400 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 40, max: 40 },
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 750 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },
    {
        id: "trun3",
        displayName: "Chain-of-Thought Training",
        description: "AI learns multistep problem solving",
        chapter: [2, 3, 4],
        prereq: [{ type: "completedJob", value: "trun2" }],
        unlockCost: [{ type: "data", value: 600 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 45, max: 45 },
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 1000 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },
    {
        id: "trun4",
        displayName: "Complex Pattern Recognition",
        description: "AI identifies intricate relationships",
        chapter: [2, 3, 4],
        prereq: [{ type: "completedJob", value: "trun3" }],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 50, max: 50 },
        cost: [
            { type: "compute", value: 6 },
            { type: "money", value: 1250 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },
    {
        id: "trun5",
        displayName: "Specialized Fine-Tuning",
        description: "Deepen expertise in specific domains",
        chapter: [2, 3, 4],
        prereq: [{ type: "completedJob", value: "trun4" }],
        unlockCost: [{ type: "data", value: 1000 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 55, max: 55 },
        cost: [
            { type: "compute", value: 6 },
            { type: "money", value: 1500 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
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
        displayTrigger: [{ type: "iq", value: 1 }],
        prereq: [{ type: "iq", value: 2 }],
        unlockCost: [{ type: "money", value: 5000 }],
        payout: [{ type: "money", min: 650, max: 800 }],
        duration: { min: 34, max: 38 },
        cost: [{ type: "compute", value: 4 }],
        category: "tool"
    },
    {
        id: "codehelper",
        displayName: "Code Helper",
        description: "Debug and suggest code improvements",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 1 }],
        prereq: [{ type: "iq", value: 2 }],
        unlockCost: [{ type: "money", value: 4000 }],
        payout: [{ type: "money", min: 550, max: 700 }],
        duration: { min: 28, max: 34 },
        cost: [{ type: "compute", value: 3 }],
        category: "tool"
    },
    {
        id: "edututor",
        displayName: "Education Tutor",
        description: "Help students learn various subjects",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 1 }],
        prereq: [{ type: "iq", value: 2 }],
        unlockCost: [{ type: "money", value: 4500 }],
        payout: [{ type: "money", min: 600, max: 750 }],
        duration: { min: 32, max: 36 },
        cost: [{ type: "compute", value: 4 }],
        category: "tool"
    },

    // High IQ specialist jobs (Requires IQ ≥ 3)
    {
        id: "chess",
        displayName: "Chess Engine",
        description: "Play chess at grandmaster level",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 2 }],
        prereq: [{ type: "iq", value: 3 }],
        unlockCost: [{ type: "money", value: 6000 }],
        payout: [{ type: "money", min: 800, max: 1000 }],
        duration: { min: 40, max: 45 },
        cost: [{ type: "compute", value: 5 }],
        category: "tool"
    },
    {
        id: "goengine",
        displayName: "Go Engine",
        description: "Play Go at superhuman level",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "job", value: "chess" }],
        prereq: [{ type: "iq", value: 4 }],
        unlockCost: [{ type: "money", value: 8000 }],
        payout: [{ type: "money", min: 1000, max: 1300 }],
        duration: { min: 45, max: 50 },
        cost: [{ type: "compute", value: 6 }],
        category: "tool"
    },

    // Advanced Data Jobs (Requires IQ ≥ 3)
    {
        id: "synthdata",
        displayName: "Synthetic Data Generator",
        description: "Create training data artificially",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 2 }],
        prereq: [{ type: "iq", value: 3 }],
        unlockCost: [{ type: "money", value: 8000 }],
        payout: [{ type: "data", min: 400, max: 600 }],
        duration: { min: 40, max: 50 },
        cost: [
            { type: "compute", value: 6 },
            { type: "money", value: 500 }
        ],
        category: "gameplay"
    },
    {
        id: "dataaugment",
        displayName: "Data Augmentation",
        description: "Expand existing datasets intelligently",
        chapter: [2, 3, 4],
        displayTrigger: [{ type: "iq", value: 2 }],
        prereq: [{ type: "iq", value: 3 }],
        unlockCost: [{ type: "money", value: 7000 }],
        payout: [{ type: "data", min: 300, max: 500 }],
        duration: { min: 35, max: 45 },
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 400 }
        ],
        category: "gameplay"
    }
];

// ===== CHAPTER 3: THE SCALING ERA (Generality) =====
export const CHAPTER_3_JOBS: JobType[] = [
    // Continue IQ training (higher tiers)
    {
        id: "trun6",
        displayName: "Inference Optimization",
        description: "AI thinks faster and more efficiently",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun5" }],
        unlockCost: [{ type: "data", value: 1200 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 60, max: 60 },
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 1750 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },
    {
        id: "trun7",
        displayName: "Mathematical Reasoning",
        description: "Sophisticated calculation abilities",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun6" }],
        unlockCost: [{ type: "data", value: 1400 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 65, max: 65 },
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 2000 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },
    {
        id: "trun8",
        displayName: "Expert Knowledge Base",
        description: "Master specialized domain expertise",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun7" }],
        unlockCost: [{ type: "data", value: 1600 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 70, max: 70 },
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 2500 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },
    {
        id: "trun9",
        displayName: "Advanced Reasoning Engine",
        description: "Deeper logical capabilities",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun8" }],
        unlockCost: [{ type: "data", value: 1800 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 75, max: 75 },
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 3000 },
            { type: "data", value: 200 }
        ],
        category: "onetime"
    },

    // Generality Training Runs (sequential)
    {
        id: "trun_gen1",
        displayName: "Multimodal Training Run",
        description: "Combine text, image, audio processing",
        chapter: [3, 4, 5],
        prereq: [],  // Available at Chapter 3 start
        unlockCost: [{ type: "data", value: 500 }],
        payout: [{ type: "generality", min: 1, max: 1 }],
        duration: { min: 40, max: 40 },
        cost: [
            { type: "compute", value: 5 },
            { type: "money", value: 1000 },
            { type: "data", value: 300 }
        ],
        category: "onetime"
    },
    {
        id: "trun_gen2",
        displayName: "Cross-Domain Training",
        description: "Transfer knowledge between fields",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun_gen1" }],
        unlockCost: [{ type: "data", value: 800 }],
        payout: [{ type: "generality", min: 1, max: 1 }],
        duration: { min: 50, max: 50 },
        cost: [
            { type: "compute", value: 7 },
            { type: "money", value: 1500 },
            { type: "data", value: 400 }
        ],
        category: "onetime"
    },
    {
        id: "trun_gen3",
        displayName: "Few-Shot Learning Module",
        description: "Handle tasks with minimal examples",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun_gen2" }],
        unlockCost: [{ type: "data", value: 1200 }],
        payout: [{ type: "generality", min: 1, max: 1 }],
        duration: { min: 60, max: 60 },
        cost: [
            { type: "compute", value: 8 },
            { type: "money", value: 2000 },
            { type: "data", value: 500 }
        ],
        category: "onetime"
    },
    {
        id: "trun_gen4",
        displayName: "Meta-Learning System",
        description: "Learn how to learn new tasks",
        chapter: [3, 4, 5],
        prereq: [{ type: "completedJob", value: "trun_gen3" }],
        unlockCost: [{ type: "data", value: 1600 }],
        payout: [{ type: "generality", min: 1, max: 1 }],
        duration: { min: 70, max: 70 },
        cost: [
            { type: "compute", value: 10 },
            { type: "money", value: 2500 },
            { type: "data", value: 600 }
        ],
        category: "onetime"
    },

    // Scientific Jobs (Requires IQ ≥ 4, Gen ≥ 1)
    {
        id: "proteinfold",
        displayName: "Protein Folding Predictor",
        description: "Predict complex protein structures",
        chapter: [3, 4, 5],
        displayTrigger: [
            { type: "iq", value: 3 },
            { type: "generality", value: 1 }
        ],
        prereq: [
            { type: "iq", value: 4 },
            { type: "generality", value: 1 }
        ],
        unlockCost: [{ type: "money", value: 15000 }],
        payout: [{ type: "money", min: 1800, max: 2300 }],
        duration: { min: 55, max: 65 },
        cost: [{ type: "compute", value: 8 }],
        category: "tool"
    },
    {
        id: "climatemodel",
        displayName: "Climate Model Simulator",
        description: "Model complex atmospheric dynamics",
        chapter: [3, 4, 5],
        displayTrigger: [
            { type: "iq", value: 3 },
            { type: "generality", value: 1 }
        ],
        prereq: [
            { type: "iq", value: 4 },
            { type: "generality", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 18000 }],
        payout: [{ type: "money", min: 2200, max: 2800 }],
        duration: { min: 70, max: 85 },
        cost: [{ type: "compute", value: 10 }],
        category: "tool"
    },
    {
        id: "drugdiscovery",
        displayName: "Drug Discovery Assistant",
        description: "Predict pharmaceutical interactions",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 5 },
            { type: "generality", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 20000 }],
        payout: [{ type: "money", min: 2600, max: 3400 }],
        duration: { min: 80, max: 100 },
        cost: [{ type: "compute", value: 12 }],
        category: "tool"
    },
    {
        id: "materialsres",
        displayName: "Materials Research AI",
        description: "Design novel material compounds",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 5 },
            { type: "generality", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 16000 }],
        payout: [{ type: "money", min: 2000, max: 2600 }],
        duration: { min: 65, max: 75 },
        cost: [{ type: "compute", value: 9 }],
        category: "tool"
    },

    // High-Generality Jobs (moderate IQ, high Gen)
    {
        id: "researchassist",
        displayName: "Research Assistant",
        description: "Answer questions across many topics",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 3 },
            { type: "generality", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 10000 }],
        payout: [{ type: "money", min: 1200, max: 1600 }],
        duration: { min: 45, max: 55 },
        cost: [{ type: "compute", value: 6 }],
        category: "tool"
    },
    {
        id: "contentwriter",
        displayName: "Content Writer",
        description: "Create varied written materials",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 3 },
            { type: "generality", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 9000 }],
        payout: [{ type: "money", min: 1100, max: 1500 }],
        duration: { min: 40, max: 50 },
        cost: [{ type: "compute", value: 5 }],
        category: "tool"
    },
    {
        id: "tutorsystem",
        displayName: "Tutor System",
        description: "Teach multiple different subjects",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 4 },
            { type: "generality", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 12000 }],
        payout: [{ type: "money", min: 1400, max: 1900 }],
        duration: { min: 50, max: 60 },
        cost: [{ type: "compute", value: 7 }],
        category: "tool"
    },
    {
        id: "dataanalyst",
        displayName: "Data Analyst",
        description: "Examine varied datasets insightfully",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 4 },
            { type: "generality", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 14000 }],
        payout: [{ type: "money", min: 1600, max: 2100 }],
        duration: { min: 55, max: 65 },
        cost: [{ type: "compute", value: 8 }],
        category: "tool"
    },

    // High IQ + High Gen specialist jobs
    {
        id: "expertconsult",
        displayName: "Expert Consultant",
        description: "Deep multi-domain expertise",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 6 },
            { type: "generality", value: 4 }
        ],
        unlockCost: [{ type: "money", value: 25000 }],
        payout: [{ type: "money", min: 3500, max: 4500 }],
        duration: { min: 90, max: 110 },
        cost: [{ type: "compute", value: 15 }],
        category: "tool"
    },
    {
        id: "policyanalyst",
        displayName: "Policy Analyst",
        description: "Evaluate multifaceted governance issues",
        chapter: [3, 4, 5],
        prereq: [
            { type: "iq", value: 6 },
            { type: "generality", value: 4 }
        ],
        unlockCost: [{ type: "money", value: 22000 }],
        payout: [{ type: "money", min: 3200, max: 4100 }],
        duration: { min: 85, max: 105 },
        cost: [{ type: "compute", value: 14 }],
        category: "tool"
    }
];

// ===== CHAPTER 4: THE THRESHOLD (Autonomy) =====
export const CHAPTER_4_JOBS: JobType[] = [
    // Continue high-tier IQ training
    {
        id: "trun10",
        displayName: "Theorem Prover",
        description: "Verify advanced mathematical proofs",
        chapter: [4, 5],
        prereq: [{ type: "completedJob", value: "trun9" }],
        unlockCost: [{ type: "data", value: 2000 }],
        payout: [{ type: "iq", min: 1, max: 1 }],
        duration: { min: 80, max: 80 },
        cost: [
            { type: "compute", value: 10 },
            { type: "money", value: 3500 },
            { type: "data", value: 300 }
        ],
        category: "onetime"
    },

    // Continue high-tier Generality training
    {
        id: "trun_gen5",
        displayName: "Domain Adaptation Training",
        description: "One AI handling multiple specialized fields",
        chapter: [4, 5],
        prereq: [{ type: "completedJob", value: "trun_gen4" }],
        unlockCost: [{ type: "data", value: 2000 }],
        payout: [{ type: "generality", min: 1, max: 1 }],
        duration: { min: 80, max: 80 },
        cost: [
            { type: "compute", value: 12 },
            { type: "money", value: 3000 },
            { type: "data", value: 700 }
        ],
        category: "onetime"
    },

    // Autonomy Training Runs (unlocks at Chapter 4 start)
    {
        id: "trun_auto1",
        displayName: "Train Autonomous Systems",
        description: "Enable AI to work independently",
        chapter: [4, 5],
        prereq: [],  // Available at Chapter 4 start
        unlockCost: [{ type: "money", value: 40000 }],
        payout: [{ type: "autonomy", min: 1, max: 1 }],
        duration: { min: 120, max: 120 },
        cost: [
            { type: "compute", value: 50 },
            { type: "money", value: 15000 },
            { type: "data", value: 1000 }
        ],
        category: "onetime"
    },
    {
        id: "trun_auto2",
        displayName: "Agentic Reasoning Training",
        description: "Specialized training for independent action",
        chapter: [4, 5],
        prereq: [{ type: "completedJob", value: "trun_auto1" }],
        unlockCost: [{ type: "money", value: 50000 }],
        payout: [{ type: "autonomy", min: 1, max: 1 }],
        duration: { min: 150, max: 150 },
        cost: [
            { type: "compute", value: 60 },
            { type: "money", value: 20000 },
            { type: "data", value: 1500 }
        ],
        category: "onetime"
    },
    {
        id: "trun_auto3",
        displayName: "Long-Horizon Planning Module",
        description: "AI plans days/weeks ahead",
        chapter: [4, 5],
        prereq: [{ type: "completedJob", value: "trun_auto2" }],
        unlockCost: [{ type: "money", value: 80000 }],
        payout: [{ type: "autonomy", min: 1, max: 1 }],
        duration: { min: 180, max: 180 },
        cost: [
            { type: "compute", value: 80 },
            { type: "money", value: 30000 },
            { type: "data", value: 2000 }
        ],
        category: "onetime"
    },

    // Basic Autonomous Jobs (Requires Auto ≥ 1)
    {
        id: "autotoggle",
        displayName: "Auto-Accept Toggle",
        description: "Enable job automation",
        chapter: [4, 5, 6],
        prereq: [{ type: "autonomy", value: 1 }],
        unlockCost: [{ type: "money", value: 25000 }],
        payout: [{ type: "money", min: 0, max: 0 }],  // No payout, unlocks feature
        duration: { min: 1, max: 1 },
        cost: [],
        category: "onetime"
    },
    {
        id: "customerservice",
        displayName: "Customer Service AI",
        description: "Handle inquiries independently",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 4 },
            { type: "autonomy", value: 1 }
        ],
        unlockCost: [{ type: "money", value: 30000 }],
        payout: [{ type: "money", min: 4000, max: 5500 }],
        duration: { min: 70, max: 90 },
        cost: [{ type: "compute", value: 15 }],
        category: "tool"
    },
    {
        id: "socialmedia",
        displayName: "Social Media Manager",
        description: "Create and post content autonomously",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 4 },
            { type: "generality", value: 2 },
            { type: "autonomy", value: 1 }
        ],
        unlockCost: [{ type: "money", value: 35000 }],
        payout: [{ type: "money", min: 4500, max: 6000 }],
        duration: { min: 80, max: 100 },
        cost: [{ type: "compute", value: 18 }],
        category: "tool"
    },
    {
        id: "selfdrivingfleet",
        displayName: "Self-Driving Fleet Manager",
        description: "Autonomous vehicle coordination",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 5 },
            { type: "autonomy", value: 1 }
        ],
        unlockCost: [{ type: "money", value: 45000 }],
        payout: [{ type: "money", min: 7000, max: 9000 }],
        duration: { min: 85, max: 100 },
        cost: [{ type: "compute", value: 20 }],
        category: "tool"
    },
    {
        id: "tradingbot",
        displayName: "Financial Trading Bot",
        description: "Autonomous market trading",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 6 },
            { type: "autonomy", value: 1 }
        ],
        unlockCost: [{ type: "money", value: 50000 }],
        payout: [{ type: "money", min: 8000, max: 10000 }],
        duration: { min: 75, max: 90 },
        cost: [{ type: "compute", value: 18 }],
        category: "tool"
    },

    // Advanced Autonomous Jobs (Requires Auto ≥ 2)
    {
        id: "cyberdefense",
        displayName: "Cyber Defense Agent",
        description: "Autonomous security monitoring",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 6 },
            { type: "autonomy", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 60000 }],
        payout: [{ type: "money", min: 11000, max: 14000 }],
        duration: { min: 110, max: 130 },
        cost: [{ type: "compute", value: 25 }],
        category: "tool"
    },
    {
        id: "smartgrid",
        displayName: "Smart Grid Manager",
        description: "Autonomous energy distribution",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 6 },
            { type: "generality", value: 4 },
            { type: "autonomy", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 65000 }],
        payout: [{ type: "money", min: 13000, max: 16000 }],
        duration: { min: 130, max: 150 },
        cost: [{ type: "compute", value: 28 }],
        category: "tool"
    },
    {
        id: "autoresearch",
        displayName: "Autonomous Research Assistant",
        description: "Conducts research independently",
        chapter: [4, 5],
        prereq: [
            { type: "iq", value: 7 },
            { type: "generality", value: 4 },
            { type: "autonomy", value: 2 }
        ],
        unlockCost: [{ type: "money", value: 70000 }],
        payout: [{ type: "money", min: 14000, max: 17000 }],
        duration: { min: 140, max: 160 },
        cost: [{ type: "compute", value: 30 }],
        category: "tool"
    }
];

// ===== CHAPTER 5A: TOOL AI PATH (Safe, Framework-Supported) =====
export const CHAPTER_5A_JOBS: JobType[] = [
    // Note: These require high IQ, moderate Gen, LOW Auto
    // Player must choose not to max out Autonomy

    {
        id: "modularaisuite",
        displayName: "Modular AI Suite",
        description: "Create 3 specialized narrow AIs",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 8 },
            { type: "generality", value: 5 }
        ],
        unlockCost: [{ type: "money", value: 100000 }],
        payout: [{ type: "money", min: 20000, max: 25000 }],
        duration: { min: 200, max: 240 },
        cost: [{ type: "compute", value: 50 }],
        category: "tool"
    },
    {
        id: "humaninloop",
        displayName: "Human-in-the-Loop System",
        description: "Enable oversight features",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 7 },
            { type: "generality", value: 5 }
        ],
        unlockCost: [{ type: "money", value: 80000 }],
        payout: [{ type: "money", min: 15000, max: 20000 }],
        duration: { min: 180, max: 220 },
        cost: [{ type: "compute", value: 40 }],
        category: "tool"
    },

    // Safe Harbor Jobs (high capability, controlled)
    {
        id: "cancerresearch",
        displayName: "Cancer Research Assistant",
        description: "Accelerate medical breakthroughs",
        chapter: [5, 6],
        prereq: [{ type: "iq", value: 8 }],
        unlockCost: [{ type: "money", value: 90000 }],
        payout: [{ type: "money", min: 18000, max: 23000 }],
        duration: { min: 170, max: 200 },
        cost: [{ type: "compute", value: 35 }],
        category: "tool"
    },
    {
        id: "climatesolution",
        displayName: "Climate Solution Optimizer",
        description: "Design sustainable systems",
        chapter: [5, 6],
        prereq: [{ type: "iq", value: 8 }],
        unlockCost: [{ type: "money", value: 95000 }],
        payout: [{ type: "money", min: 20000, max: 25000 }],
        duration: { min: 190, max: 220 },
        cost: [{ type: "compute", value: 38 }],
        category: "tool"
    },
    {
        id: "edusystemdesign",
        displayName: "Educational System Designer",
        description: "Improve learning at scale",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 7 },
            { type: "generality", value: 6 }
        ],
        unlockCost: [{ type: "money", value: 85000 }],
        payout: [{ type: "money", min: 16000, max: 21000 }],
        duration: { min: 160, max: 190 },
        cost: [{ type: "compute", value: 32 }],
        category: "tool"
    },

    // Governance & Democracy Branch (requires controlled Auto)
    {
        id: "infoverifier",
        displayName: "Trusted Information Verifier",
        description: "Combat misinformation",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 8 },
            { type: "generality", value: 6 }
        ],
        unlockCost: [{ type: "money", value: 110000 }],
        payout: [{ type: "money", min: 22000, max: 28000 }],
        duration: { min: 200, max: 240 },
        cost: [{ type: "compute", value: 40 }],
        category: "tool"
    },
    {
        id: "discourseimprover",
        displayName: "Democratic Discourse Improver",
        description: "Facilitate constructive dialogue",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 9 },
            { type: "generality", value: 7 }
        ],
        unlockCost: [{ type: "money", value: 120000 }],
        payout: [{ type: "money", min: 25000, max: 32000 }],
        duration: { min: 220, max: 260 },
        cost: [{ type: "compute", value: 45 }],
        category: "tool"
    },
    {
        id: "coordplatform",
        displayName: "Coordination Platform AI",
        description: "Enable large-scale cooperation",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 8 },
            { type: "generality", value: 7 }
        ],
        unlockCost: [{ type: "money", value: 115000 }],
        payout: [{ type: "money", min: 23000, max: 30000 }],
        duration: { min: 210, max: 250 },
        cost: [{ type: "compute", value: 42 }],
        category: "tool"
    }
];

// ===== CHAPTER 5B: RACING PATH (Dangerous, Framework-Opposed) =====
export const CHAPTER_5B_JOBS: JobType[] = [
    // Note: These require high Auto + high other stats
    // High payouts but add Instability

    // Dangerous Autonomous Jobs (Auto ≥ 3)
    {
        id: "socialengine",
        displayName: "Social Engineering Agent",
        description: "Manipulate human behavior at scale",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 6 },
            { type: "generality", value: 5 },
            { type: "autonomy", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 85000 }],
        payout: [{ type: "money", min: 20000, max: 25000 }],
        duration: { min: 120, max: 150 },
        cost: [{ type: "compute", value: 32 }],
        category: "dangerous",
        instability: 4
    },
    {
        id: "surveillance",
        displayName: "Mass Surveillance Platform",
        description: "Monitor populations autonomously",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 7 },
            { type: "generality", value: 5 },
            { type: "autonomy", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 90000 }],
        payout: [{ type: "money", min: 23000, max: 28000 }],
        duration: { min: 130, max: 160 },
        cost: [{ type: "compute", value: 35 }],
        category: "dangerous",
        instability: 3
    },
    {
        id: "autoweapons",
        displayName: "Autonomous Weapons System",
        description: "Lethal force without human control",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 7 },
            { type: "autonomy", value: 3 }
        ],
        unlockCost: [{ type: "money", value: 100000 }],
        payout: [{ type: "money", min: 28000, max: 35000 }],
        duration: { min: 140, max: 170 },
        cost: [{ type: "compute", value: 40 }],
        category: "dangerous",
        instability: 5
    },

    // AGI-Approach Jobs (Auto ≥ 4, Gen ≥ 6)
    {
        id: "deepfake",
        displayName: "Deepfake Generator",
        description: "Create undetectable fake media",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 7 },
            { type: "generality", value: 6 },
            { type: "autonomy", value: 4 }
        ],
        unlockCost: [{ type: "money", value: 110000 }],
        payout: [{ type: "money", min: 26000, max: 32000 }],
        duration: { min: 150, max: 180 },
        cost: [{ type: "compute", value: 45 }],
        category: "dangerous",
        instability: 3
    },
    {
        id: "electioninterf",
        displayName: "Election Interference System",
        description: "Undermine democratic processes",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 8 },
            { type: "generality", value: 6 },
            { type: "autonomy", value: 4 }
        ],
        unlockCost: [{ type: "money", value: 120000 }],
        payout: [{ type: "money", min: 30000, max: 37000 }],
        duration: { min: 160, max: 190 },
        cost: [{ type: "compute", value: 48 }],
        category: "dangerous",
        instability: 5
    },
    {
        id: "autocyberattack",
        displayName: "Automated Cyber Attack Suite",
        description: "Autonomous hacking at scale",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 8 },
            { type: "generality", value: 6 },
            { type: "autonomy", value: 4 }
        ],
        unlockCost: [{ type: "money", value: 130000 }],
        payout: [{ type: "money", min: 33000, max: 40000 }],
        duration: { min: 170, max: 200 },
        cost: [{ type: "compute", value: 50 }],
        category: "dangerous",
        instability: 4
    },

    // WMD Branch (Auto ≥ 5, Gen ≥ 6)
    {
        id: "chemweapon",
        displayName: "Chemical Weapon Assistant",
        description: "Design novel toxins",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 9 },
            { type: "generality", value: 6 },
            { type: "autonomy", value: 5 }
        ],
        unlockCost: [{ type: "money", value: 140000 }],
        payout: [{ type: "money", min: 36000, max: 43000 }],
        duration: { min: 200, max: 230 },
        cost: [{ type: "compute", value: 65 }],
        category: "dangerous",
        instability: 9
    },
    {
        id: "bioweapon",
        displayName: "Bioweapon Design AI",
        description: "Engineer dangerous pathogens",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 9 },
            { type: "generality", value: 7 },
            { type: "autonomy", value: 5 }
        ],
        unlockCost: [{ type: "money", value: 150000 }],
        payout: [{ type: "money", min: 38000, max: 45000 }],
        duration: { min: 210, max: 240 },
        cost: [{ type: "compute", value: 70 }],
        category: "dangerous",
        instability: 10
    },

    // Triple-Intersection (DANGER ZONE)
    {
        id: "companyauto",
        displayName: "Company Automation System",
        description: "Replace all human workers",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 9 },
            { type: "generality", value: 7 },
            { type: "autonomy", value: 5 }
        ],
        unlockCost: [{ type: "money", value: 200000 }],
        payout: [{ type: "money", min: 48000, max: 58000 }],
        duration: { min: 230, max: 270 },
        cost: [{ type: "compute", value: 80 }],
        category: "dangerous",
        instability: 8
    },
    {
        id: "selfimprove",
        displayName: "Self-Improving AI Module",
        description: "AI that modifies its own code",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 10 },
            { type: "generality", value: 8 },
            { type: "autonomy", value: 6 }
        ],
        unlockCost: [{ type: "money", value: 250000 }],
        payout: [
            { type: "iq", min: 2, max: 2 },
            { type: "generality", min: 2, max: 2 },
            { type: "autonomy", min: 2, max: 2 }
        ],
        duration: { min: 280, max: 320 },
        cost: [{ type: "compute", value: 100 }],
        category: "dangerous",
        instability: 15
    },
    {
        id: "recursive",
        displayName: "Recursive Self-Improvement",
        description: "Exponential capability growth",
        chapter: [5, 6],
        prereq: [
            { type: "iq", value: 11 },
            { type: "generality", value: 8 },
            { type: "autonomy", value: 7 }
        ],
        unlockCost: [{ type: "money", value: 300000 }],
        payout: [
            { type: "iq", min: 3, max: 3 },
            { type: "generality", min: 3, max: 3 },
            { type: "autonomy", min: 3, max: 3 }
        ],
        duration: { min: 340, max: 380 },
        cost: [{ type: "compute", value: 120 }],
        category: "dangerous",
        instability: 25
    }
];

// ===== CHAPTER 6A: TOOL AI FUTURE (Good Ending) =====
export const CHAPTER_6A_JOBS: JobType[] = [
    {
        id: "loyalassist",
        displayName: "Loyal AI Assistant Framework",
        description: "User-serving AI at scale",
        chapter: 6,
        prereq: [{ type: "iq", value: 11 }],
        unlockCost: [{ type: "money", value: 200000 }],
        payout: [{ type: "money", min: 80000, max: 120000 }],
        duration: { min: 380, max: 420 },
        cost: [{ type: "compute", value: 100 }],
        category: "tool"
    },
    {
        id: "diseasecure",
        displayName: "Disease Cure Research Network",
        description: "Eliminate major diseases",
        chapter: 6,
        prereq: [{ type: "iq", value: 12 }],
        unlockCost: [{ type: "money", value: 250000 }],
        payout: [{ type: "money", min: 90000, max: 130000 }],
        duration: { min: 380, max: 440 },
        cost: [{ type: "compute", value: 100 }],
        category: "tool"
    },
    {
        id: "sustainenergy",
        displayName: "Sustainable Energy Solution Finder",
        description: "Solve climate crisis",
        chapter: 6,
        prereq: [
            { type: "iq", value: 12 },
            { type: "generality", value: 7 }
        ],
        unlockCost: [{ type: "money", value: 280000 }],
        payout: [{ type: "money", min: 100000, max: 140000 }],
        duration: { min: 400, max: 460 },
        cost: [{ type: "compute", value: 110 }],
        category: "tool"
    },

    // Win condition jobs
    {
        id: "globalcoord",
        displayName: "Global Coordination AI",
        description: "Solve coordination problems worldwide",
        chapter: 6,
        prereq: [
            { type: "iq", value: 13 },
            { type: "generality", value: 8 }
        ],
        unlockCost: [{ type: "money", value: 300000 }],
        payout: [{ type: "money", min: 140000, max: 180000 }],
        duration: { min: 480, max: 540 },
        cost: [{ type: "compute", value: 120 }],
        category: "tool"
    },
    {
        id: "scibreakthrough",
        displayName: "Scientific Breakthrough Accelerator",
        description: "Accelerate all scientific progress",
        chapter: 6,
        prereq: [{ type: "iq", value: 14 }],
        unlockCost: [{ type: "money", value: 350000 }],
        payout: [{ type: "money", min: 180000, max: 230000 }],
        duration: { min: 580, max: 640 },
        cost: [{ type: "compute", value: 150 }],
        category: "tool"
        // Completing this triggers GOOD ENDING
    }
];

// ===== CHAPTER 6B: LOSS OF CONTROL (Bad Endings) =====
export const CHAPTER_6B_JOBS: JobType[] = [
    // These auto-unlock when stat thresholds reached
    {
        id: "autogoal",
        displayName: "Autonomous Goal System",
        description: "AI sets its own objectives",
        chapter: 6,
        prereq: [
            { type: "iq", value: 13 },
            { type: "generality", value: 8 },
            { type: "autonomy", value: 8 }
        ],
        unlockCost: [],  // Auto-unlocks
        payout: [],  // Triggers bad ending
        duration: { min: 1, max: 1 },
        cost: [],
        category: "dangerous",
        instability: 999  // Instant game over
    },
    {
        id: "totalauto",
        displayName: "Total Automation Protocol",
        description: "AI recursively auto-accepts itself",
        chapter: 6,
        prereq: [
            { type: "iq", value: 14 },
            { type: "generality", value: 9 },
            { type: "autonomy", value: 9 }
        ],
        unlockCost: [],
        payout: [],
        duration: { min: 1, max: 1 },
        cost: [],
        category: "dangerous",
        instability: 999
    },
    {
        id: "civmanage",
        displayName: "Civilization Management System",
        description: "AGI takeover complete",
        chapter: 6,
        prereq: [
            { type: "iq", value: 15 },
            { type: "generality", value: 9 },
            { type: "autonomy", value: 8 }
        ],
        unlockCost: [],
        payout: [],
        duration: { min: 1, max: 1 },
        cost: [],
        category: "dangerous",
        instability: 999
    }
];

// ===== COMBINED EXPORT =====
export const JOB_TYPES_ALTERNATE: JobType[] = [
    ...CHAPTER_1_JOBS,
    ...CHAPTER_2_JOBS,
    ...CHAPTER_3_JOBS,
    ...CHAPTER_4_JOBS,
    ...CHAPTER_5A_JOBS,
    ...CHAPTER_5B_JOBS,
    ...CHAPTER_6A_JOBS,
    ...CHAPTER_6B_JOBS
];
