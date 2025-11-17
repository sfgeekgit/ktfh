import main from "./layers/main";
import achievements from "./layers/achievements";
import { chaptersMap } from "./layers/chapters";

// Expose all story layers dynamically generated from story.md, alongside core layers
export default {
    main,
    achievements,
    ...chaptersMap
};
