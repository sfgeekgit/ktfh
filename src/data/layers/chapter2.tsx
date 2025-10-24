import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";

const id = "chapter2";
const layer = createLayer(id, function (this: any) {
    const name = "Chapter 2: Tools That Think";
    const color = "#FFA500";

    // Persistent state
    const complete = persistent<boolean>(false);
    const currentPage = ref(0);
    const playerChoice = persistent<string | null>(null, false); // false = disable NaN check for strings

    // Story pages
    const pages = [
        {
            title: "Chapter 2: Tools That Think",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Six months in, something shifts.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        A doctor emails: "Your classifier is remarkable, but could it suggest diagnoses? Not make decisions, just offer possibilities?"
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        This requires a more general system. Broader training. More sophisticated reasoning.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You build it carefully. The medical advisor augments expert judgment. The doctor stays in control.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Word spreads. Teachers want tutoring AI. Lawyers want research assistants.
                    </p>
                </div>
            )
        },
        {
            title: "Training at Scale",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The key breakthrough is training at scale.
                        Larger models trained on more data simply work better. 
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You start collecting data systematically. Terabytes of information.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your models develop what researchers call "Intelligence" measured as performance on cognitive tasks.
                    </p>
		    <h2>New Resource Unlocked:  <i>IQ</i></h2> 

                </div>
            )
        },
        {
            title: "The Investor's Question",
            isChoice: true,
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        An investor approaches with significant funding.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "Your technology is impressive. But the market is getting crowded. What's your strategy?"
                    </p>
                    <p style="font-size: 18px; margin-bottom: 30px;">
                        Two paths:
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
                        You choose the careful path.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "We're building tools that people trust their lives with. Doctors, teachers, lawyers—they need to understand what our AI is doing and why."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Rigorous testing protocols. Human oversight on critical decisions. Growth is slower, but every system is rock-solid.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your reputation grows: the AI company that does it right.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You train for intelligence, but always controllable. Always explainable.
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
                        You choose speed.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        "The AI race is heating up. We need to move fast or get left behind."
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You deploy systems quickly. Add automation to reduce costs. Train models for intelligence, autonomy, and generality.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        It works. Growth accelerates. Systems handle more jobs with less supervision.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                        But sometimes, late at night, you wonder: are you still building tools? Or something else?
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
            currentPage.value = 3; // Quality path page
        } else if (choice === "speed") {
            currentPage.value = 4; // Speed path page
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
                                Thorough testing. Careful deployment. Build systems you deeply understand. Slower growth, but complete control and trustworthy AI.
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
                                Deploy rapidly. Automate where possible. Let systems learn from real-world usage. Faster growth, stay competitive.
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
