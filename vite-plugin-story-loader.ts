import type { Plugin } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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

interface StoryContent {
    [chapterId: string]: ChapterData;
}

function parseMarkdown(content: string): StoryContent {
    const lines = content.split('\n');
    const chapters: StoryContent = {};

    let currentChapter: ChapterData | null = null;
    let currentPage: StoryPage | null = null;
    let currentOption: any = null;
    let inBlockquote = false;
    let blockquoteText: string[] = [];
    let inHtmlComment = false;

    function ensurePage() {
        if (currentChapter && !currentPage) {
            currentPage = {
                paragraphs: [],
                isChoice: false
            };
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Handle HTML comments
        if (trimmed.startsWith('<!--')) {
            inHtmlComment = true;
            continue;
        }
        if (trimmed.includes('-->')) {
            inHtmlComment = false;
            continue;
        }
        if (inHtmlComment) {
            continue;
        }

        // Handle chapter, interlude, and ending headers
        if (trimmed.startsWith('# Chapter') || trimmed.startsWith('# Interlude') || trimmed.startsWith('# Ending:')) {
            // Save previous chapter/ending
            if (currentChapter && currentPage) {
                currentChapter.pages.push(currentPage);
            }
            if (currentChapter) {
                chapters[currentChapter.id] = currentChapter;
            }

            // Start new chapter/ending
            currentChapter = {
                id: '',
                title: trimmed.substring(2).trim(),
                pages: []
            };
            currentPage = null;
            continue;
        }

        // Handle metadata
        if (trimmed.startsWith('**id:**') && currentChapter) {
            currentChapter.id = trimmed.substring(7).trim();
            continue;
        }

        // Skip interlude metadata lines that aren't page content
        if (
            trimmed.startsWith('**story_trigger:**') ||
            trimmed.startsWith('**next_wonder:**') ||
            trimmed.startsWith('**wonder_trigger:**')
        ) {
            continue;
        }

        // Handle page headers (## Page...)
        if (trimmed.startsWith('## Page')) {
            // Save previous page
            if (currentChapter && currentPage) {
                currentChapter.pages.push(currentPage);
            }

            // Start new page
            const isChoice = trimmed.includes('[CHOICE]');
            const ifMatch = trimmed.match(/\[IF:\s*(\w+)\]/);

            currentPage = {
                paragraphs: [],
                isChoice: isChoice,
                choiceType: ifMatch ? ifMatch[1] : undefined
            };

            if (isChoice) {
                currentPage.choices = [];
            }

            // Reset option state when starting new page
            currentOption = null;

            continue;
        }

        // Handle page title metadata (only if NOT inside an option block)
        if (trimmed.startsWith('**title:**') && currentPage && !currentOption) {
            currentPage.title = trimmed.substring(10).trim();
            continue;
        }

        // Handle page type metadata (only if NOT inside an option block)
        if (trimmed.startsWith('**pageType:**') && currentPage && !currentOption) {
            currentPage.pageType = trimmed.substring(13).trim();
            continue;
        }

        // Handle button text metadata (only if NOT inside an option block)
        if (trimmed.startsWith('**button_text:**') && currentPage && !currentOption) {
            currentPage.buttonText = trimmed.substring(16).trim();
            continue;
        }

        // Handle choice options
        if (trimmed.startsWith('[OPTION:')) {
            const optionId = trimmed.match(/\[OPTION:\s*(\w+)\]/)?.[1];
            if (optionId && currentPage?.choices) {
                currentOption = { id: optionId };
                currentPage.choices.push(currentOption);
            }
            continue;
        }

        // Handle option metadata
        if (currentOption) {
            if (trimmed.startsWith('**button:**')) {
                currentOption.button = trimmed.substring(11).trim();
                continue;
            }
            if (trimmed.startsWith('**title:**')) {
                currentOption.title = trimmed.substring(10).trim();
                continue;
            }
            if (trimmed.startsWith('**description:**')) {
                currentOption.description = trimmed.substring(16).trim();
                continue;
            }
            if (trimmed.startsWith('**effect:**')) {
                currentOption.effect = trimmed.substring(11).trim();
                continue;
            }
            if (trimmed.startsWith('**unlock_job:**')) {
                currentOption.unlockJobId = trimmed.substring(15).trim();
                continue;
            }
            if (trimmed.startsWith('**color:**')) {
                currentOption.color = trimmed.substring(10).trim();
                continue;
            }
        }

        // Handle blockquotes (for the open letter)
        if (trimmed.startsWith('>')) {
            ensurePage();
            if (!inBlockquote) {
                inBlockquote = true;
                blockquoteText = [];
            }
            blockquoteText.push(trimmed.substring(1).trim());
            continue;
        } else if (inBlockquote && trimmed === '') {
            // End of blockquote
            inBlockquote = false;
            if (currentPage && blockquoteText.length > 0) {
                currentPage.paragraphs.push('<blockquote>' + blockquoteText.join('\n\n') + '</blockquote>');
                blockquoteText = [];
            }
            continue;
        }

        // Handle separator (---)
        if (trimmed === '---') {
            continue;
        }

        // Handle content paragraphs
        if (trimmed && currentPage) {
            // Skip lines that are metadata (but allow bold text like **headline**)
            const isMetadata =
                trimmed.startsWith('**') &&
                (trimmed.includes(':**') || trimmed === '**');

            if (!isMetadata) {
                currentPage.paragraphs.push(trimmed);
            }
        } else if (trimmed && currentChapter) {
            // No page header encountered yet in this chapter; create a default page to hold text.
            ensurePage();
            currentPage!.paragraphs.push(trimmed);
        }
    }

    // Save final chapter and page
    if (currentChapter && currentPage) {
        currentChapter.pages.push(currentPage);
    }
    if (currentChapter) {
        chapters[currentChapter.id] = currentChapter;
    }

    return chapters;
}

export default function storyLoaderPlugin(): Plugin {
    const storyFilePath = resolve(process.cwd(), 'src/data/story.md');

    return {
        name: 'story-loader',

        // Add resolveId to handle virtual module
        resolveId(id: string) {
            if (id.includes('story.md')) {
                return id;
            }
        },

        // Load the actual file
        load(id: string) {
            if (id.includes('story.md')) {
                if (existsSync(storyFilePath)) {
                    // Add the file to watch list for HMR
                    this.addWatchFile(storyFilePath);

                    const content = readFileSync(storyFilePath, 'utf-8');
                    const parsed = parseMarkdown(content);

                    return {
                        code: `export default ${JSON.stringify(parsed, null, 2)};`,
                        map: null
                    };
                }
            }
        },

        // Handle hot module reload
        handleHotUpdate({ file, server }) {
            if (file === storyFilePath) {
                console.log('📖 Story content updated - reloading chapters...');

                // Invalidate all chapter modules
                const modules = server.moduleGraph.getModulesByFile(file);
                if (modules) {
                    modules.forEach(m => server.moduleGraph.invalidateModule(m));
                }

                // Trigger full reload for story changes
                server.ws.send({
                    type: 'full-reload',
                    path: '*'
                });
            }
        }
    };
}
