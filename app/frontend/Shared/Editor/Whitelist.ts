import { Extension, Node, type Editor } from '@tiptap/core';

export interface WhitelistOptions {
  allowedTags: string[],
  allowedAttributes: allowedAttributes,
}

export interface allowedAttributes {
  [key: string]: string[],
}

export interface WhitelistStorage {
  editorExtensions: string[],
}

/** Extension which allows arbitrary HTML elements and attributes */
export const Whitelist = Extension.create<WhitelistOptions, WhitelistStorage>({
  addStorage() {
    return {
      editorExtensions: [],
    }
  },
  addOptions() {
    return {
      allowedTags: [
        "html", "head", "title", "body",  "style",
        "a", "article", "b", "blockquote", "br", "caption", "code", "del", "details", "div", "em",
        "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd", "li", "main", "ol",
        "p", "pre", "section", "span", "strike", "strong", "sub", "summary", "sup", "table",
        "tbody", "td", "th", "thead", "tr", "u", "ul",
        "font",
      ],
      allowedAttributes: {
        "a": ["href", "name", "target"],
        "iframe": ["allowfullscreen", "frameborder", "src"],
        "img": ["src", "alt", "height", "width"],
        "blockquote": ["cite"],
        "td": ["width", "valign", "align"],
        "font": ["size", "color"],
        "*": ["class", "name", "id", "title", "style", "border"],
      },
    }
  },
  addExtensions() {
    const Tags: Node[] = [];
    this.options.allowedTags.forEach(tag => {
      if (!this.storage.editorExtensions.includes(tag)) {
        let Tag = Node.create({
          name: tag,
          content: 'block*',
          parseHTML() {
            return [
              {
                tag: tag,
              },
            ]
          },
          renderHTML() {
            return [
              tag,
            ]
          }
        })
        Tags.push(Tag);
      }
    });
    return Tags;
  },
  // addGlobalAttributes() {
  //   let allowedAttributes = this.options.allowedAttributes;
  //   let attributesList: GlobalAttributes;
  //   for (const attribute in allowedAttributes) {
  //     let newAttribute = {
  //       type: [ attribute ],
  //       attribute: allowedAttributes[attribute],
  //     };
  //     let attribute: Attribute = [

  //     ]
  //   }
  //   console.log(attributesList);
  //   return [];
  // },
  onBeforeCreate() {
    this.editor.extensionManager.extensions.forEach(extension => {
      this.storage.editorExtensions.push(extension.name);
    });
  },
});
