import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

const id = "chapter5";
const layer = createLayer(id, createChapterLayer(id, storyContent.chapter5));

export default layer;
