import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";
import { G_CONF } from "../gameConfig";

const id = "chapter1";
const layer = createLayer(id, function (this: any) {
    const name = "Chapter 1: The Competitor";
    const color = "#FFA500";

    // Persistent state
    const complete = persistent<boolean>(false);
    const playerChoice = persistent<string>("", false); // false = don't check for NaN on strings
    const currentPage = ref(0);

    // Story pages
    const pages = [
        {
            title: "Chapter 1: The Spark",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
		       You've done it. After months of preparation, your AI startup is finally launching.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
		       The idea is simple: build AI tools that help people, not replace them.
		       
		       Image sorting. Document translation. Transcription work.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
		        Today, your first system goes live.
                    </p>
                </div>
            )
        },
        {
            title: "Chapter 1: The Spark",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The initial deployments exceed expectations.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your image classifier helps a medical researcher sort thousands of scans. Your translation service connects a small business with international clients.
			<BR/><BR/>
		       These systems are predictable. Controllable. They do exactly what you trained them to do, and nothing more.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">

		       The feedback is immediate: "This saved me so much time." "I can finally focus on the important work."

                    </p>
                </div>
            )
        },
        {
            title: "Chapter 1: The Spark",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
		      The technology is straightforward. Narrow AI, the researchers call it. Neural networks trained on specific tasks. When given an image, they classify it. When given audio, they transcribe it.
                    </p>
		    <p style="font-size: 18px; margin-bottom: 20px;">
		       Simple inputs, reliable outputs. Nothing fancy. Just useful.
                    </p>
                </div>
            )
	    /*
            choices: [
                {
                    id: "quality",
                    text: "Focus on Quality",
                    description: `Higher payouts per delivery (+${G_CONF.CHAPTER_1_QUALITY_BONUS}% earnings)`,
                    effect: "qualityBonus"
                },
                {
                    id: "speed",
                    text: "Focus on Speed",
                    description: `Faster delivery times (-${G_CONF.CHAPTER_1_SPEED_BONUS}% delivery duration)`,
                    effect: "speedBonus"
                }
            ]*/
        },
        {
            title: "Chapter 1: The Spark",	    
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
		       At night, you read about other companies pursuing something different.
		    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
		       "Artificial General Intelligence," they call it. Systems that can do anything a human can do. You find it fascinating in theory.
		    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
		       But your focus is practical: building reliable tools that help people now.
		    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
		       Your company is small, but it's real. And it's growing.
		    </p>
                </div>
            )
        }
    ];

    function makeChoice(choiceId: string) {
        playerChoice.value = choiceId;
        currentPage.value++;
    }

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

    const display = (() => {

        const page = pages[currentPage.value];

        if (!page) {
            completeChapter();
            return null;
        }

        const isChoicePage = page.choices && page.choices.length > 0;
        const isLastPage = currentPage.value === pages.length - 1;

        return (
            <div>
                <h2 style="color: #FFA500; font-size: 32px; margin-bottom: 30px;">{page.title}</h2>

                <div style="margin: 20px 0; padding: 30px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                    {page.content}
                </div>

                <div style="margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    {isChoicePage ? (
                        // Show choices
                        page.choices!.map(choice => (
                            <div key={choice.id} style="text-align: center;">
                                <button
                                    onClick={() => makeChoice(choice.id)}
                                    style={{
                                        background: choice.id === "quality" ? "#4CAF50" : "#2196F3",
                                        color: "white",
                                        padding: "15px 30px",
                                        fontSize: "18px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        minWidth: "200px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {choice.text}
                                </button>
                                <p style="font-size: 14px; margin-top: 10px; color: #666;">
                                    {choice.description}
                                </p>
                            </div>
                        ))
                    ) : (
                        // Show continue/complete button
                        <button
                            onClick={nextPage}
                            style={{
                                background: isLastPage ? "#FF6F00" : "#2196F3",
                                color: "white",
                                padding: "15px 40px",
                                fontSize: "20px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            {isLastPage ? "Let's get to work!" : "Continue"}
                        </button>
                    )}
                </div>

                <div style="margin-top: 40px; font-size: 14px; color: #666;">
                    Page {currentPage.value + 1} of {pages.length}
                </div>
            </div>
        );
    //};
    }) as any;
    

    return {
        name,
        color,
        display,
        complete,
        playerChoice,
        currentPage
    };
});

export default layer;
