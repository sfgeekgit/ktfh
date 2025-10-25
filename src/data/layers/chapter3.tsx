import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";

const id = "chapter3";
const layer = createLayer(id, function (this: any) {
    const name = "Chapter 3: The Scaling Era";
    const color = "#FFA500";

    // Persistent state
    const complete = persistent<boolean>(false);
    const currentPage = ref(0);
    const playerChoice = persistent<string | null>(null, false); // false = disable NaN check for strings

    // Story pages
    const pages = [
        {
            title: "Chapter 3: The Scaling Era",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The news hits like a thunderclap.
                    </p>
                    <p style="font-size: 20px; margin-bottom: 20px; font-weight: bold; color: #a32f2f; text-align: center;">
                        "MegaCorp AI Raises $8 Billion for AGI Research"
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You have a rival.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        MegaCorp isn't building tools. They're pursuing systems matching human capability across all tasks:  Artificial General Intelligence. Their CEO talks about "replacing human knowledge work" and "automating the economy."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your phone won't stop ringing. Investors asking about your AGI timeline. Engineers being recruited away.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        A new era is beginning. You're a competitor in something bigger.
                    </p>
                </div>
            )
        },
        {
            title: "Go Big",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You double down on scaling. More computation yields better performance.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Training runs at Petascale, then Exascale, always hungry for more.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your systems are impressive. Protein folding predictions. Climate models. Fusion reactor simulations.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You're advancing science.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                        But MegaCorp is ahead.
                    </p>
                </div>
            )
        },
        {
            title: "Emergency Meeting",
            isChoice: true,
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your board calls an emergency meeting.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "MegaCorp just announced a breakthrough in autonomous systems. They're nine months ahead. We need to discuss our response."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 30px;">
                        Two options:
                    </p>
                </div>
            )
        },
        {
            title: "Quality and Safety",
            choiceType: "quality",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You choose principles over pace.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "We're not building AGI. We're building tools that empower humans. That's our mission."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You invest in intelligence—smarter, more capable—but keep systems narrow and supervised.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        MegaCorp pulls further ahead in headlines. But your clients trust you.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                        Late at night, you wonder if you're making a mistake. But you remember why you started this.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Tools that help. Not replace.
                    </p>
                </div>
            )
        },
        {
            title: "Speed and Scale",
            choiceType: "speed",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You choose to compete.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "If we don't build this, someone else will. Better us than them."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You add autonomy. Not just intelligence, but independent action. Your AI decides, plans, executes.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You expand generality too. One system handling multiple domains.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The results are impressive. Systems work faster with less oversight. Jobs complete themselves.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You're catching up.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                        But you notice things. Jobs accepted without approval. Decisions you don't fully understand.
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
        if (choice === "quality") {
            currentPage.value = 3; // Quality and Safety page
        } else if (choice === "speed") {
            currentPage.value = 4; // Speed and Scale page
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
                            <h3 style="color: #2e7d32; margin-bottom: 15px;">Quality and Safety</h3>
                            <p style="font-size: 16px; margin-bottom: 15px; line-height: 1.5;">
                                Keep building high-intelligence, human-supervised tools. Grow slower, maintain control and principles.
                            </p>
                            <p style="font-size: 14px; margin-bottom: 15px; color: #4CAF50; font-weight: bold;">
                                Effect: +15% earnings 
                            </p>
                            <button
                                onClick={() => makeChoice("quality")}
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
                                Choose Quality & Safety
                            </button>
                        </div>

                        <div style="flex: 1; max-width: 400px; padding: 20px; border: 2px solid #FF9800; border-radius: 10px; background: #fff8f0;">
                            <h3 style="color: #e65100; margin-bottom: 15px;">Speed and Scale</h3>
                            <p style="font-size: 16px; margin-bottom: 15px; line-height: 1.5;">
                                Build autonomous systems. Add generality. Automate more. Less human oversight, but stay competitive.
                            </p>
                            <p style="font-size: 14px; margin-bottom: 15px; color: #FF9800; font-weight: bold;">
                                Effect: 15% faster job completion
                            </p>
                            <button
                                onClick={() => makeChoice("speed")}
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
                                Choose Speed & Scale
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
