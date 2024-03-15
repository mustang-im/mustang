import { Editor, Extension, Node, getExtensionField, getSchema, mergeAttributes } from '@tiptap/core';
import { Paragraph } from '@tiptap/extension-paragraph';

export interface WhitelistOptions {
  allowedTags: string[],
  allowedAttributes: allowedAttributes,
}

export interface allowedAttributes {
  [key: string]: string[],
}

export interface WhitelistStorage {
  extensions: string[],
}

/** Extension which allows arbitrary HTML elements and attributes */
export const Whitelist = Extension.create<WhitelistOptions, WhitelistStorage>({
  name: 'whitelist',
  priority: 50,
  addStorage() {
    return {
      extensions: [],
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
      if (extension.name) {
        this.storage.extensions.push(extension.name);
      }
    });
    let Tags: Node[] = [];
    this.options.allowedTags.forEach(tag => {
      if (this.storage.extensions.includes(tag)) {
        return;
      }
      const Tag: Node = Node.create({
        name: tag,
        content: 'block+',
        group: 'block',
        parseHTML() {
          return [
            {
              tag: tag,
            },
          ]
        },
        renderHTML({HTMLAttributes}) {
          return [
            tag,
            mergeAttributes(HTMLAttributes),
            0,
          ]
        },
      });
      console.log(tag);
      Tags.push(Tag);
    });
    this.editor.extensionManager.extensions.push(...Tags);
    // this.editor.setOptions({
    //   extensions: [
    //     ...Tags,
    //   ]
    // });
    this.editor = this.editor;
    let schema = this.editor.schema;
    console.log(schema)
  },
});
