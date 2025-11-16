import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

// Derive story IDs from story.md content to avoid manual registration
const storyIds = Object.keys(storyContent);
const chapterIds = storyIds.filter(id => id.startsWith("chapter")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const interludeIds = storyIds.filter(id => id.startsWith("interlude")).sort();
const endingIds = storyIds.filter(id => id.startsWith("ending_")).sort();

// Dynamically create all chapter and ending layers
const chapters: Record<string, any> = {};

for (const chapterId of [...chapterIds, ...interludeIds, ...endingIds]) {
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
export const storyChapters = chapterIds.map(id => chapters[id]).filter(Boolean);
export const storyInterludes = interludeIds.map(id => chapters[id]).filter(Boolean);
export const storyEndings = endingIds.map(id => chapters[id]).filter(Boolean);
export const storyLayers = [...storyChapters, ...storyInterludes, ...storyEndings];
export const storyChapterIds = chapterIds;
export const storyInterludeIds = interludeIds;
export const storyEndingIds = endingIds;
export const chaptersMap = chapters;
