import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

const id = "chapter4";
const layer = createLayer(id, createChapterLayer(id, storyContent.chapter4));

export default layer;
