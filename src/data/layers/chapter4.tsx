import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";

const id = "chapter4";
const layer = createLayer(id, function (this: any) {
    const name = "Chapter 4: Systems That Act";
    const color = "#FFA500";

    // Persistent state
    const complete = persistent<boolean>(false);
    const currentPage = ref(0);


    // Story pages
    const pages = [
        {
            title: "Chapter 4: Systems That Act",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        MegaCorp announces "The Year of the Agent." 
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Autonomous AI systems that don't just advise, they act.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your competitors deploy them everywhere. Trading algorithms that rewrite strategies. Research assistants designing experiments. 
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The industry is transforming. <br/>Automation isn't coming, it's here.
                    </p>
                </div>
            )
        },
        {
            title: "Acceleration",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The benefits are undeniable.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Autonomous systems work faster. No waiting for approval, no human bottlenecks, jobs complete themselves.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your financial AI picks trades at machine speed. Your logistics system optimizes routes in real-time. 
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        It's like having a data center full of employees who never sleep.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
		    <h2><b>AUTONOMY</b> Unlocked</h2> 
                    </p>
                </div>
            )
        },
        {
            title: "The Shift",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your systems are no longer just intelligent and general, they're becoming independent.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        News fills with stories: "AI Systems Operating Independently" "The Rise of Autonomous Agents" "Machines Making Decisions"
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your investors love the numbers. <br/>Your engineers seem... uneasy.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        But there's no going back. This is where the industry is headed.
                    </p>
                </div>
            )
        },
        {
            title: "A New Threshold",
            content: (
                <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        You realize something important.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Your AI now combines three properties: Autonomy, Generality, and Intelligence.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Individually, each is manageable. Together, they form something different.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        Something powerful. Something that approaches what makes humans uniquely capable.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        The triple-intersection, researchers call it.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        MegaCorp is racing toward it. Other labs are following.
                    </p>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        And now, so are you.
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

    const display = (() => {
        const page = pages[currentPage.value];

        if (!page) {
            completeChapter();
            return null;
        }

        const isLastPage = currentPage.value === pages.length - 1;

        return (
            <div>
                <h2 style="color: #FFA500; font-size: 32px; margin-bottom: 30px;">{page.title}</h2>

                <div style="margin: 20px 0; padding: 30px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                    {page.content}
                </div>

                <div style="margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button
                        onClick={isLastPage ? completeChapter : nextPage}
                        style={{
                            background: isLastPage ? "#4CAF50" : "#2196F3",
                            color: "white",
                            padding: "15px 40px",
                            fontSize: "20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        {isLastPage ? "Continue to Main" : "Continue"}
                    </button>
                </div>

                <div style="margin-top: 40px; font-size: 14px; color: #666;">
                    Page {currentPage.value + 1} of {pages.length}
                </div>
            </div>
        );
    }) as any;

    return {
        name,
        color,
        display,
        complete,
        currentPage
    };
});

export default layer;
