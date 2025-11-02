import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";
import { save } from "util/save";

interface StoryPage {
    title?: string;
    paragraphs: string[];
    isChoice?: boolean;
    choiceType?: string;
    choices?: Array<{
        id: string;
        button: string;
        title: string;
        description: string;
        effect: string;
        color: string;
    }>;
}

interface ChapterData {
    id: string;
    title: string;
    color: string;
    pages: StoryPage[];
}

export function createChapterLayer(chapterId: string, chapterData: ChapterData) {
    return function (this: any) {
        const name = chapterData.title;
        const color = chapterData.color;

        // Persistent state
        const complete = persistent<boolean>(false);
        const playerChoice = persistent<string | null>(null, false);
        const currentPage = ref(0);

        const pages = chapterData.pages;

        function makeChoice(choiceId: string) {
            playerChoice.value = choiceId;
            save();
            // Find the next page that matches this choice
            const choicePageIndex = currentPage.value;
            for (let i = choicePageIndex + 1; i < pages.length; i++) {
                if (pages[i].choiceType === choiceId) {
                    currentPage.value = i;
                    return;
                }
            }
            // If no matching page found, just advance
            currentPage.value++;
        }

        function completeChapter() {
            complete.value = true;
            player.tabs = ["main"];
            save();
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

            // Handle outcome pages (after choice)
            const isOutcomePage = page.choiceType !== undefined;
            const isCorrectOutcome = !isOutcomePage || page.choiceType === playerChoice.value;

            // Skip this page if it's an outcome for a choice we didn't make
            if (isOutcomePage && !isCorrectOutcome) {
                completeChapter();
                return null;
            }

            // Handle choice pages differently
            if (page.isChoice) {
                return (
                    <div>
                        <h2 style="color: #FFA500; font-size: 32px; margin-bottom: 30px;">
                            {page.title || chapterData.title}
                        </h2>

                        <div style="margin: 20px 0; padding: 30px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                            {renderContent(page)}
                        </div>

                        <div style="margin: 30px 0; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                            {page.choices?.map((choice) => {
                                const bgColor = choice.color === '#4CAF50' ? '#f1f8f4' : '#fff8f0';
                                const borderColor = choice.color;
                                const titleColor = choice.color === '#4CAF50' ? '#2e7d32' : '#e65100';

                                return (
                                    <div
                                        key={choice.id}
                                        style={`flex: 1; max-width: 400px; padding: 20px; border: 2px solid ${borderColor}; border-radius: 10px; background: ${bgColor};`}
                                    >
                                        <h3 style={`color: ${titleColor}; margin-bottom: 15px;`}>
                                            {choice.title}
                                        </h3>
                                        <p style="font-size: 16px; margin-bottom: 15px; line-height: 1.5;">
                                            {choice.description}
                                        </p>
                                        <p style={`font-size: 14px; margin-bottom: 15px; color: ${choice.color}; font-weight: bold;`}>
                                            Effect: {choice.effect}
                                        </p>
                                        <button
                                            onClick={() => makeChoice(choice.id)}
                                            style={{
                                                background: choice.color,
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
                                            {choice.button}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div style="margin-top: 40px; font-size: 14px; color: #666;">
                            Page {currentPage.value + 1} - Make your choice
                        </div>
                    </div>
                );
            }

            // For chapter 5, handle special button text
            const isChapter5Outcome = chapterId === 'chapter5' && isOutcomePage;
            let buttonText = "Continue";
            if (isOutcomePage) {
                if (isChapter5Outcome) {
                    buttonText = page.choiceType === 'support' ? "Back to work" : "We must win the race";
                } else {
                    buttonText = "Continue Your Journey";
                }
            } else {
                const isLastPage = currentPage.value === pages.length - 1;
                if (isLastPage) {
                    buttonText = chapterId === 'chapter1' ? "Let's get to work!" :
                                chapterId === 'chapter4' ? "Continue to Main" :
                                "Continue Your Journey";
                }
            }

            return (
                <div>
                    <h2 style="color: #FFA500; font-size: 32px; margin-bottom: 30px;">
                        {page.title || chapterData.title}
                    </h2>

                    <div style="margin: 20px 0; padding: 30px; border: 2px solid #FFA500; border-radius: 10px; background: #fff3e0;">
                        {renderContent(page)}
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
                            {buttonText}
                        </button>
                    </div>

                    <div style="margin-top: 40px; font-size: 14px; color: #666;">
                        {isOutcomePage
                            ? `Your choice: ${page.title}`
                            : `Page ${currentPage.value + 1} of ${pages.length}`}
                    </div>
                </div>
            );
        }) as any;

        return {
            name,
            color,
            display,
            complete,
            playerChoice,
            currentPage
        };
    };
}

function renderContent(page: StoryPage) {
    return (
        <div style="text-align: left; max-width: 600px; margin: 40px auto; line-height: 1.6;">
            {page.paragraphs.map((paragraph, index) => {
                // Handle special formatting
                if (paragraph.startsWith('<blockquote>')) {
                    const content = paragraph.substring(12, paragraph.length - 13);
                    return (
                        <p
                            key={index}
                            style="font-size: 16px; margin-bottom: 20px; padding: 20px; background: #f5f5f5; border-left: 4px solid #d32f2f; font-style: italic;"
                            innerHTML={content.replace(/\n\n/g, '<br/><br/>')}
                        />
                    );
                }

                // Handle bold headlines (like "MegaCorp AI Raises $8 Billion")
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    const content = paragraph.substring(2, paragraph.length - 2);
                    return (
                        <p
                            key={index}
                            style="font-size: 20px; margin-bottom: 20px; font-weight: bold; color: #d32f2f; text-align: center;"
                        >
                            {content}
                        </p>
                    );
                }

                // Handle italic paragraphs
                if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                    const content = paragraph.substring(1, paragraph.length - 1);
                    return (
                        <p key={index} style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                            {content}
                        </p>
                    );
                }

                // Regular paragraphs
                return (
                    <p
                        key={index}
                        style="font-size: 18px; margin-bottom: 20px;"
                        innerHTML={paragraph.replace(/<br\/>/g, '<br/>')}
                    />
                );
            })}
        </div>
    );
}
