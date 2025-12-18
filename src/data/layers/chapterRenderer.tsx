import { ref } from "vue";
import { persistent } from "game/persistence";
import player from "game/player";
import { save } from "util/save";
import { globalBus } from "game/events";

// Page type styling configuration
const PAGE_STYLES = {
    intro: {
        headerColor: "#88C0D0",
        headerSize: "40px",
        borderColor: "#3B4252",
        background: "#2E3440",
        buttonColor: "#4A7C8C",
        textAlign: "center",
        textColor: "#E5E9F0"
    },
    default: {
        headerColor: "#FFA500",
        headerSize: "32px",
        borderColor: "#FFA500",
        background: "#fff3e0",
        buttonColor: "#2196F3",
        textAlign: "left",
        textColor: "#000000"
    }
};

interface StoryPage {
    title?: string;
    paragraphs: string[];
    isChoice?: boolean;
    choiceType?: string;
    pageType?: string;
    buttonText?: string;
    choices?: Array<{
        id: string;
        button: string;
        title: string;
        description: string;
        effect: string;
        color: string;
        unlockJobId?: string;
    }>;
}

interface ChapterData {
    id: string;
    title: string;
    pages: StoryPage[];
}

export function createChapterLayer(chapterId: string, chapterData: ChapterData) {
    return function (this: any) {
        const name = chapterData.title;

        // Persistent state
        const complete = persistent<boolean>(false);
        const playerChoice = persistent<string | null>(null, false);
        const currentPage = ref(0);

        const pages = chapterData.pages;

        function makeChoice(choiceId: string) {
            playerChoice.value = choiceId;

            // Emit choice event for downstream unlock logic (e.g., jobs)
            const page = pages[currentPage.value];
            const choice = page?.choices?.find(c => c.id === choiceId);
            if (choice?.unlockJobId) {
                globalBus.emit("storyChoice", {
                    chapterId,
                    choiceId,
                    unlockJobId: choice.unlockJobId
                });
            }

            // Set framework choice for Chapter 5
            if (chapterId === 'chapter5' && (choiceId === 'support' || choiceId === 'oppose')) {
                player.frameworkChoice = choiceId;
            }

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

            // Get styles based on page type
            const styles = page.pageType === 'intro' ? PAGE_STYLES.intro : PAGE_STYLES.default;

            // Handle choice pages differently
            if (page.isChoice) {
                const titleText = page.title !== undefined ? page.title : chapterData.title;
                const enableTyping = chapterId === 'chapter1' && currentPage.value === 1;
                return (
                    <div class={page.pageType === 'intro' ? 'story-page-intro' : ''}>
                        <h2 style={`color: ${styles.headerColor}; font-size: ${styles.headerSize}; margin-bottom: 30px;`}>
                            {titleText}
                        </h2>

                        <div style={`margin: 20px 0; padding: 30px; border: 2px solid ${styles.borderColor}; border-radius: 10px; background: ${styles.background}; color: ${styles.textColor};`}>
                            {renderContent(page, styles.textAlign, styles.textColor, enableTyping)}
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
                                            class="story-button"
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
                    </div>
                );
            }

            // Determine button text - custom text takes priority
            let buttonText = page.buttonText || "Continue";
            if (!page.buttonText) {
                // Only use default logic if no custom button text is set
                const isChapter5Outcome = chapterId === 'chapter5' && isOutcomePage;
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
            }

            const titleText = page.title !== undefined ? page.title : chapterData.title;
            const enableTyping = chapterId === 'chapter1' && currentPage.value === 1;

            // Add background image for Page Intro0
            const isIntroPage0 = chapterId === 'chapter1' && currentPage.value === 0;
            const backgroundStyle = isIntroPage0
                ? `margin: 20px 0; padding: 30px; border: 2px solid ${styles.borderColor}; border-radius: 10px; background-image: url('./ach/tcbu_crop.png'); background-size: cover; background-position: center; background-color: ${styles.background}; color: #222222;`
                : `margin: 20px 0; padding: 30px; border: 2px solid ${styles.borderColor}; border-radius: 10px; background: ${styles.background}; color: ${styles.textColor};`;

            return (
                <div class={page.pageType === 'intro' ? 'story-page-intro' : ''}>
                    <h2 style={`color: ${styles.headerColor}; font-size: ${styles.headerSize}; margin-bottom: 30px;`}>
                        {titleText}
                    </h2>

                    <div style={backgroundStyle} class={isIntroPage0 ? 'intro-page-0-content' : ''}>
                        {renderContent(page, styles.textAlign, styles.textColor, enableTyping, isIntroPage0)}
                    </div>

                    <div style="margin: 30px 0; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button
                            class="story-button"
                            onClick={isOutcomePage ? completeChapter : nextPage}
                            style={{
                                background: isOutcomePage ? "#4CAF50" : styles.buttonColor,
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
                </div>
            );
        }) as any;

        return {
            name,
            display,
            complete,
            playerChoice,
            currentPage
        };
    };
}

function renderContent(page: StoryPage, textAlign: string = "left", textColor: string = "#000000", enableTypingEffect: boolean = false, needsSemiTransparentBg: boolean = false) {
    const lastWonderName = (player as any).lastWonderName ?? "";
    const containerMargin = needsSemiTransparentBg ? '20px auto 40px auto' : '40px auto';

    return (
        <div style={`text-align: ${textAlign}; max-width: 600px; margin: ${containerMargin}; line-height: 1.6;`}>
            {page.paragraphs.map((paragraph, index) => {
                const contentWithVars = paragraph.replace(/{{lastWonderName}}/g, lastWonderName);
                const forceLeft = contentWithVars.startsWith('[left]');
                const normalizedContent = forceLeft ? contentWithVars.substring(6) : contentWithVars;

                // Handle special formatting
                if (normalizedContent.startsWith('<blockquote>')) {
                    const content = normalizedContent.substring(12, normalizedContent.length - 13);
                    return (
                        <p
                            key={index}
                            style="font-size: 16px; margin-bottom: 20px; padding: 20px; background: #f5f5f5; border-left: 4px solid #d32f2f; font-style: italic;"
                            innerHTML={content.replace(/\n\n/g, '<br/><br/>')}
                        />
                    );
                }

                // Handle bold headlines (like "MegaCorp AI Raises $8 Billion")
                if (normalizedContent.startsWith('**') && normalizedContent.endsWith('**')) {
                    const content = normalizedContent.substring(2, normalizedContent.length - 2);
                    return (
                        <p
                            key={index}
                            style={`font-size: 20px; margin-bottom: 20px; font-weight: bold; color: ${textColor}; text-align: center;`}
                        >
                            {content}
                        </p>
                    );
                }

                // Handle italic paragraphs
                if (normalizedContent.startsWith('*') && normalizedContent.endsWith('*')) {
                    const content = normalizedContent.substring(1, normalizedContent.length - 1);
                    return (
                        <p key={index} style="font-size: 18px; margin-bottom: 20px; font-style: italic;">
                            {content}
                        </p>
                    );
                }

                // Regular paragraphs
                const isCallToAction = normalizedContent.includes("Will you keep the future human");
                const shouldAnimate = enableTypingEffect && index < 2;
                const shouldFadeIn = enableTypingEffect && isCallToAction;
                const isFirstParagraphIntro0 = needsSemiTransparentBg && index === 0;
                const fontSize = isCallToAction ? "21.6px" : (isFirstParagraphIntro0 ? "15px" : "18px");
                const fadeDelay = shouldFadeIn ? `${2 * 2.55 + 0.5}s` : "";
                const semiTransparentBg = needsSemiTransparentBg ? 'background: rgba(255, 255, 255, 0.7); padding: 10px 15px; border-radius: 6px; width: fit-content;' : '';

                return (
                    <p
                        key={index}
                        class={shouldAnimate ? "story-paragraph" : (shouldFadeIn ? "story-fade-in" : "")}
                        style={`font-size: ${fontSize}; margin-bottom: 20px; text-align: ${forceLeft ? 'left' : textAlign}; ${shouldAnimate ? `animation-delay: ${index * 2.55}s;` : ''} ${shouldFadeIn ? `animation-delay: ${fadeDelay}; font-weight: bold;` : ''} ${isCallToAction && !enableTypingEffect ? 'font-weight: bold;' : ''} ${semiTransparentBg}`}
                        innerHTML={normalizedContent.replace(/<br\/>/g, '<br/>')}
                    />
                );
            })}
        </div>
    );
}
