import { createLayer } from "game/layers";
import { createChapterLayer } from "./chapterRenderer";
import storyContent from "@/data/story.md";

const id = "chapter3";
const layer = createLayer(id, createChapterLayer(id, storyContent.chapter3));

export default layer;
