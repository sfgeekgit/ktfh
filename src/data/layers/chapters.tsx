import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

// List of chapter and ending IDs - add new ones here when you add them to story.md
const chapterIds = ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5"];
const endingIds = ["ending_lose_agi", "ending_lose_agi_threshold", "ending_win"];

// Dynamically create all chapter and ending layers
const chapters: Record<string, any> = {};

for (const chapterId of [...chapterIds, ...endingIds]) {
    const chapterData = storyContent[chapterId];
    console.log(`Loading layer: ${chapterId}`, chapterData ? "✓ Found" : "✗ Not found");
    if (chapterData) {
        chapters[chapterId] = createLayer(chapterId, createChapterLayer(chapterId, chapterData));
        console.log(`Created layer: ${chapterId}`, chapters[chapterId]);
    } else {
        console.warn(`Story content not found for ${chapterId} in story.md`);
    }
}

// Export individual chapters and endings for the layers system
export const chapter1 = chapters.chapter1;
export const chapter2 = chapters.chapter2;
export const chapter3 = chapters.chapter3;
export const chapter4 = chapters.chapter4;
export const chapter5 = chapters.chapter5;
export const ending_lose_agi = chapters.ending_lose_agi;
export const ending_lose_agi_threshold = chapters.ending_lose_agi_threshold;
export const ending_win = chapters.ending_win;
