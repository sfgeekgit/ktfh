import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

const id = "chapter2";
const layer = createLayer(id, createChapterLayer(id, storyContent.chapter2));

export default layer;
