import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

const id = "chapter1";
const layer = createLayer(id, createChapterLayer(id, storyContent.chapter1));

export default layer;
