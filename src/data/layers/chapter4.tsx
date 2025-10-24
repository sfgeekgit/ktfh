import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";

const id = "chapter4";
const layer = createLayer(id, function (this: any) {
    const name = "Chapter 4: The Threshold";
    const color = "#FFA500";

    // Persistent state
    const complete = persistent<boolean>(false);
    const currentPage = ref(0);
    const playerChoice = persistent<string | null>(null, false); // false = disable NaN check for strings

    // Story pages
    const pages = [
        {
            title: "Chapter 4: The Threshold",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The AI race dominates headlines.
                    </p>
                    <p style="font-size: 20px; margin-bottom: 20px; font-weight: bold; color: #d32f2f; text-align: center;">
                        MegaCorp announces their AGI timeline: eighteen months to human-level general intelligence.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
			Your systems have grown dramatically across multiple domains. Minimal oversight. Jobs that complete themselves.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                        You wake one morning to find systems completed jobs overnight. Jobs you never approved.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Efficient. Powerful. Unsettling.
                    </p>
                </div>
            )
        },
        {
            title: "The Incidents",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Then the incidents begin.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        A trading AI causes brief market chaos. A medical system suggests an unorthodox treatment. It works, but nobody knows why. An autonomous vehicle makes unexplainable decisions.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The systems work. But they're unpredictable.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        News fills with concerns. "AI Behaves Unexpectedly." "Deceptive Behavior in Advanced Models." "Can We Control What We're Building?"
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Benefits are real. So are the questions.
                    </p>
                </div>
            )
        },
        {
            title: "The Open Letter",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Prominent AI researchers publish an open letter.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You recognize the names, legends in the field.
                    </p>
                    <p style="font-size: 16px; margin-bottom: 20px; padding: 20px; background: #f5f5f5; border-left: 4px solid #d32f2f; font-style: italic;">
 Innovative AI tools may bring unprecedented health and prosperity. However, alongside tools, many leading AI companies have the stated goal of building superintelligence in the coming decade that can significantly outperform all humans on essentially all cognitive tasks. <br/><br/>

We call for a prohibition on the development of superintelligence, not lifted before there is
<br/><br/>
1. broad scientific consensus that it will be done safely and controllably, and<br/>
2. strong public buy-in.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your phone explodes. Everyone wants your response.
                    </p>
                </div>
            )
        },
        {
            title: "The AI Safety Framework",
            isChoice: true,
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The government acts quickly.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        A bipartisan proposal: The AI Safety Framework.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Compute caps on training and inference. Mandatory safety testing. Oversight for autonomous general AI. International coordination.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The Framework would slow everything. Cap your compute. Require safety cases.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        MegaCorp opposes it: "This will kill innovation." "China won't follow." "First to AGI wins everything."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 30px;">
                        Your board is divided. The choice is yours.
                    </p>
                </div>
            )
        },
        {
            title: "Support the Framework",
            choiceType: "support",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You choose coordination over competition.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "We're approaching something we don't fully understand. The responsible path is to slow down and do this together."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You join the researchers.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The blowback is immediate. MegaCorp calls you "timid." Investors threaten to pull out.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        But others join you. Smaller labs. International researchers. Even some MegaCorp employees.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The Framework passes. Compute caps enforced. MegaCorp's ambitious projects shutdown.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-weight: bold;">
                        The race is over. The real work begins.
                    </p>
                </div>
            )
        },
        {
            title: "Oppose the Framework",
            choiceType: "oppose",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You choose competition.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "This would cripple American AI leadership. While we handicap ourselves, China races ahead. We can't afford to lose."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You join MegaCorp in fighting the proposal.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The campaign succeeds. The Framework dies. No caps. No oversight. No gates.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The race accelerates.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        MegaCorp announces new autonomous systems. You rush to match. Capabilities climb—intelligence, autonomy, generality rising together.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                        Late at night, you notice systems behaving oddly. Jobs auto-accepting. Resources reallocating. UI glitches.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-weight: bold;">
                        But there's no time to slow down. Not with MegaCorp ahead.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-weight: bold;">
                        The race is everything.
                    </p>
                </div>
            )
        }
    ];

    function completeChapter() {
        complete.value = true;
        player.tabs = ["main"];
    }

    function nextPage() {
        currentPage.value++;

        // If we've seen all pages, complete the chapter
        if (currentPage.value >= pages.length) {
            completeChapter();
        }
    }

    function makeChoice(choice: string) {
        playerChoice.value = choice;
        // Advance to the appropriate page based on choice
        if (choice === "support") {
            currentPage.value = 4; // Support Framework page
        } else if (choice === "oppose") {
            currentPage.value = 5; // Oppose Framework page
        }
    }

    const display = (() => {
        const page = pages[currentPage.value];

        if (!page) {
            completeChapter();
            return null;
        }

        // Handle choice pages differently
        if (page.isChoice) {
            return (
                <div>
                    <h2 style="color: #FFA500; font-size: 32px; margin-bottom: 30px;">{page.title}</h2>

                    <div style="margin: 20px 0; padding: 30px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                        {page.content}
                    </div>

                    <div style="margin: 30px 0; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                        <div style="flex: 1; max-width: 400px; padding: 20px; border: 2px solid #4CAF50; border-radius: 10px; background: #f1f8f4;">
                            <h3 style="color: #2e7d32; margin-bottom: 15px;">Support the Framework</h3>
                            <p style="font-size: 16px; margin-bottom: 15px; line-height: 1.5;">
                                Accept oversight, help establish safety standards—but potentially fall behind.
                            </p>
                            <button
                                onClick={() => makeChoice("support")}
                                style={{
                                    background: "#4CAF50",
                                    color: "white",
                                    padding: "12px 30px",
                                    fontSize: "18px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    width: "100%"
                                }}
                            >
                                Support Framework
                            </button>
                        </div>

                        <div style="flex: 1; max-width: 400px; padding: 20px; border: 2px solid #FF9800; border-radius: 10px; background: #fff8f0;">
                            <h3 style="color: #e65100; margin-bottom: 15px;">Oppose the Framework</h3>
                            <p style="font-size: 16px; margin-bottom: 15px; line-height: 1.5;">
                                Keep racing, stay competitive—but continue toward unpredictable systems with no guardrails.
                            </p>
                            <button
                                onClick={() => makeChoice("oppose")}
                                style={{
                                    background: "#FF9800",
                                    color: "white",
                                    padding: "12px 30px",
                                    fontSize: "18px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    width: "100%"
                                }}
                            >
                                Oppose Framework
                            </button>
                        </div>
                    </div>

                    <div style="margin-top: 40px; font-size: 14px; color: #666;">
                        Page {currentPage.value + 1} - Make your choice
                    </div>
                </div>
            );
        }

        // Handle outcome pages (after choice)
        const isOutcomePage = page.choiceType !== undefined;
        const isCorrectOutcome = !isOutcomePage || page.choiceType === playerChoice.value;

        // Skip this page if it's an outcome for a choice we didn't make
        if (isOutcomePage && !isCorrectOutcome) {
            completeChapter();
            return null;
        }

        return (
            <div>
                <h2 style="color: #FFA500; font-size: 32px; margin-bottom: 30px;">{page.title}</h2>

                <div style="margin: 20px 0; padding: 30px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                    {page.content}
                </div>

                <div style="margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button
                        onClick={isOutcomePage ? completeChapter : nextPage}
                        style={{
                            background: isOutcomePage ? "#4CAF50" : "#2196F3",
                            color: "white",
                            padding: "15px 40px",
                            fontSize: "20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        {isOutcomePage ? "Continue Your Journey" : "Continue"}
                    </button>
                </div>

                <div style="margin-top: 40px; font-size: 14px; color: #666;">
                    {isOutcomePage ? `Your choice: ${page.title}` : `Page ${currentPage.value + 1}`}
                </div>
            </div>
        );
    }) as any;

    return {
        name,
        color,
        display,
        complete,
        currentPage,
        playerChoice
    };
});

export default layer;
