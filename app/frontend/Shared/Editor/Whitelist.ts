import { Extension, type Extensions, getSchema, Node, type GlobalAttributes, type Attribute } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';

export interface WhitelistOptions {
  editorExtensions: Extensions,
  allowedTags: string[],
  allowedAttributes: allowedAttributes,
}

export interface allowedAttributes {
  [key: string]: string[],
}

export interface WhitelistStorage {
  extensions: string[],
}

interface extensionsTags {
  [key: string]: string,
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
      editorExtensions: [],
      allowedTags: [
        "html", "head", "title", "body",  "style",
        "a", "article", "b", "blockquote", "br", "caption", "code", "del", "details", "div", "em",
        "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd", "li", "main", "ol",
        "p", "pre", "section", "span", "strike", "strong", "sub", "summary", "sup", "table",
        "tbody", "td", "th", "thead", "tr", "u", "ul",
        "font", 'footer',
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
    let tags: Extensions = [];
    let schema = getSchema(this.options.editorExtensions);
    let editorTags: string[] = getTags(schema);
    this.options.allowedTags.forEach(tag => {
      if (!editorTags.includes(tag)) {
        console.log(tag);
        const node: Node = Node.create({
          name: tag,
          content: 'block+',
          group: 'block',
          parseHTML() {
            return [
              {
                tag: tag,
              }
            ]
          },
          renderHTML() {
            return [
              tag,
              0
            ]
          }
        });
        tags.push(node);
      }
    });
    return tags;
  },
  addGlobalAttributes() {
    let allowedAttributes = this.options.allowedAttributes;
    let schema = getSchema(this.options.editorExtensions);
    let extensionTags = getExtensitonFromTags(schema);
    console.log(extensionTags);
    let attributesList: GlobalAttributes = [];
    for (const type in allowedAttributes) {
      let attributes = {};
      allowedAttributes[type].forEach(a => {
        attributes[a] = {
          default: null,
        } as Attribute;
      });
      let newAttribute = {
        types: [ type ],
        attributes: attributes,
      };
      attributesList.push(newAttribute);
    };
    console.log(attributesList);
    return attributesList;
  },
});

function getExtensitonFromTags(schema: Schema): extensionsTags {
  let extensionsTags: extensionsTags = {};
  for (const node in schema.nodes) {
    if (schema.nodes[node].spec.parseDOM) {
      schema.nodes[node].spec.parseDOM.forEach(rule => {
        const regexp: RegExp = /\w+/;
        if (rule.tag) {
          let tag = rule.tag.match(regexp)[0];
          extensionsTags[node] = tag;
        }
      });
    }
  }
  console.log(extensionsTags);
  return extensionsTags;
}

/** Gets Tags from schema */
function getTags(schema: Schema): string[] {
  let tags: string[] = [];
  for (const node in schema.nodes) {
    if (schema.nodes[node].spec.parseDOM) {
      schema.nodes[node].spec.parseDOM.forEach(rule => {
        const regexp: RegExp = /\w+/;
        if (rule.tag) {
          let tag = rule.tag.match(regexp)[0];
          tags.push(tag);  
        }
      });
    }
  }
  for (const mark in schema.marks) {
    if (schema.marks[mark].spec.parseDOM) {
      schema.marks[mark].spec.parseDOM.forEach(rule => {
        const regexp: RegExp = /\w+/;
        if (rule.tag) {
          let tag = rule.tag.match(regexp)[0];
          tags.push(tag);  
        }
      });
    }
  }
  return tags;
}
