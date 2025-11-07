declare module '@/data/story.md' {
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

    interface StoryContent {
        chapter1: ChapterData;
        chapter2: ChapterData;
        chapter3: ChapterData;
        chapter4: ChapterData;
        chapter5: ChapterData;
        [key: string]: ChapterData;
    }

    const storyContent: StoryContent;
    export default storyContent;
}
