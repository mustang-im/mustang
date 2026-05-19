import { Extension } from "@tiptap/core";

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
});
