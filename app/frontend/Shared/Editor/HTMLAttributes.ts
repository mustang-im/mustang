import { Extension, type Extensions } from "@tiptap/core";

export const HTMLAttributes = Extension.create({
  addGlobalAttributes() {
    return [
      {
        types: [
          'blockquote',
        ],
        attributes: {
          cite: {
            default: null,
          }
        },
      },
      {
        types: [ 
          'heading',
          'paragraph'
        ],
        attributes: {
          class: {
            default: null,
          }
        }
      }
    ]
  },
});