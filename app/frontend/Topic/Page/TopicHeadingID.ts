import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// Preserves data-topic-id on heading elements so renamed headings can be
// matched back to their existing child Topic by ID rather than by name.
export const TopicHeadingID = Extension.create({
  name: "topic-heading-id",
  addGlobalAttributes() {
    return [{
      types: ["heading"],
      attributes: {
        topicID: {
          default: null,
          parseHTML: el => (el as HTMLElement).dataset.topicId ?? null,
          renderHTML: attrs => attrs.topicID ? { "data-topic-id": attrs.topicID } : {},
        },
      },
    }];
  },
  addProseMirrorPlugins() {
    return [new Plugin({
      key: new PluginKey("strip-topic-id-on-paste"),
      props: {
        // Strip data-topic-id from pasted headings so copies get their own topic.
        transformPastedHTML(html) {
          let div = document.createElement("div");
          div.innerHTML = html;
          for (let el of div.querySelectorAll("[data-topic-id]")) {
            el.removeAttribute("data-topic-id");
          }
          return div.innerHTML;
        },
      },
    })];
  },
});
