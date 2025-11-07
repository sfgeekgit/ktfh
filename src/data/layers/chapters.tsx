import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

// List of chapter IDs - add new chapters here when you add them to story.md
const chapterIds = ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5"];

// Dynamically create all chapter layers
const chapters: Record<string, any> = {};

for (const chapterId of chapterIds) {
    const chapterData = storyContent[chapterId];
    if (chapterData) {
        chapters[chapterId] = createLayer(chapterId, createChapterLayer(chapterId, chapterData));
    } else {
        console.warn(`Chapter data not found for ${chapterId} in story.md`);
    }
}

// Export individual chapters for the layers system
export const chapter1 = chapters.chapter1;
export const chapter2 = chapters.chapter2;
export const chapter3 = chapters.chapter3;
export const chapter4 = chapters.chapter4;
export const chapter5 = chapters.chapter5;
