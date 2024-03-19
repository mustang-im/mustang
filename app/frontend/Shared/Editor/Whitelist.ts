import { Extension, type Extensions, getSchema, Node, type GlobalAttributes, type Attribute, mergeAttributes } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';

export interface WhitelistOptions {
  /** **MUST** add all extension that'll be in the editor */
  editorExtensions: Extensions,
  allowedTags: string[],
  /** `[tagname | '*' for all elements] : [...attributes]` */
  allowedAttributes: allowedAttributes,
}

export interface allowedAttributes {
  [key: string]: string[],
}

// Common options interface Arbitrary Elements
export interface TagOptions {
  HTMLAttributes: Record<string, any>,
}

/**
 * This Extension is built this way because:
 * 1. It needs a list of extensions for adding attributes to all tags and prevention of adding tags that already exist
 * 2. We cannot the list of extension before the editor is initialized
 * 3. Tiptap seems to want devs to enable and disable manually e.g. History and Collaboration extension conflict
 * 4. We cannot add another tag type to the Schema after initialization
 */

/** Extension which allows arbitrary HTML elements and attributes */
export const Whitelist = Extension.create<WhitelistOptions>({
  name: 'whitelist',
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
    let schema: Schema = getSchema(this.options.editorExtensions);
    let editorTags: string[] = getTags(schema); // Gets list of existing tags in editor

    // Create a Node Type for each tag
    for (const tag in this.options.allowedTags) {
      if (!editorTags.includes(tag)) {
        continue;
      }

      const node: Node = Node.create<TagOptions>({
        name: tag,
        priority: 50, // Load after all defaults
        content: 'block+',
        group: 'block',
        addOptions() {
          return {
            HTMLAttributes: {},
          }
        },
        parseHTML() {
          return [
            {
              tag: tag,
            }
          ]
        },
        renderHTML({HTMLAttributes}) {
          return [
            tag,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0
          ]
        }
      });

      tags.push(node);
    }

    return tags;
  },
  addGlobalAttributes() {
    let allowedAttributes = this.options.allowedAttributes;
    let attributesList: GlobalAttributes = [];
    let schema: Schema = getSchema(this.options.editorExtensions);
    let tagExtension: Object = getTagExtension(schema);
    let extensionAttribute: Object = getExtensionAttribute(schema);

    this.options.allowedTags.forEach(tag => {
      if (!tagExtension.hasOwnProperty(tag)) {
        tagExtension[tag] = tag;
      }
      if (!extensionAttribute.hasOwnProperty(tag)) {
        extensionAttribute[tag] = null;
      }
    });
    /**
     * TODO
     * 1. Check and validate tag is the schema
     * 2. Search for the tag in the schema
     * 3. Check if tag already has the attribute
     */

    /**
     * 1. List of tag: extension
     * 2. List of extension: attribute
     */
    // Create attribute for each attribute
    for (const tag in allowedAttributes) {
      if (!tagExtension.hasOwnProperty(tag) && tag !== '*') {
        continue;
      }

      let tags: string[] =  [tag];
      if (tag === '*') {
        tags = [];
        for (const tag in tagExtension) {
          let extension = tagExtension[tag];
          if (!tags.includes(extension)) {
            tags.push(extension);
          }
        }
      }

      if (tagExtension.hasOwnProperty(tag)) {
        tags = [tagExtension[tag]];
      }

      // Create a attribute for each attribute
      let attributes = {};
      allowedAttributes[tag].forEach(a => {
        if (tag === '*' || extensionAttribute[tags[0]] && !extensionAttribute[tags[0]].includes(a)) {
          attributes[a] = {
            default: null,
          } as Attribute;
        }
      });

      if (Object.keys(attributes).length === 0) {
        continue;
      }

      let newAttribute = {
        types: [ ...tags ],
        attributes: attributes,
      }; 

      console.log(newAttribute);

      attributesList.push(newAttribute);
    };
    return attributesList;
  },
});

// Exclude the [src=*] in img[src=*]
const tagOnly: RegExp = /\w+/;

/** Gets Tags from schema */
function getTags(schema: Schema): string[] {
  let tags: string[] = [];

  // Get all node types
  let nodes = schema.nodes;
  for (const node in nodes) {
    let parseDOM = nodes[node].spec.parseDOM;
    if (parseDOM) {
      parseDOM.forEach(rule => {
        if (rule.tag) {
          let tag = rule.tag.match(tagOnly)[0];
          tags.push(tag);  
        }
      });
    }
  }

  // Get all mark types
  let marks = schema.marks;
  for (const mark in marks) {
    let parseDOM = marks[mark].spec.parseDOM;
    if (parseDOM) {
      parseDOM.forEach(rule => {
        if (rule.tag) {
          let tag = rule.tag.match(tagOnly)[0];
          tags.push(tag);  
        }
      });
    }
  }
  return tags;
}

/** Get a map of `[tag]:[extension]` */
function getTagExtension(schema: Schema): Object {
  let tagExtension: Object = {};

  // Get all node types
  let nodes = schema.nodes;
  for (const node in nodes) {
    let parseDOM = nodes[node].spec.parseDOM;
    if (parseDOM) {
      parseDOM.forEach(rule => {
        if (rule.tag) {
          let tag = rule.tag.match(tagOnly)[0];
          let nodeName = nodes[node].name;
          tagExtension[tag] = nodeName; 
        }
      });
    }
  }

  // Get all mark types
  let marks = schema.marks;
  for (const mark in marks) {
    let parseDOM = marks[mark].spec.parseDOM;
    if (parseDOM) {
      parseDOM.forEach(rule => {
        if (rule.tag) {
          let tag = rule.tag.match(tagOnly)[0];
          let markName = marks[mark].name;
          tagExtension[tag] = markName;
        }
      });
    }
  }
  return tagExtension;
}

/** Get a map of `[extension]:[...attributes]` */
function getExtensionAttribute(schema: Schema): Object {
  let extensionAttribute: Object = {};
    // Get all attributes in Node
    let nodes = schema.nodes;
    for (const node in nodes) {
      let attrs = nodes[node].spec.attrs;
      if (!attrs) {
        continue;
      }
      let attributesList: string[] = [];
      for (const attribute in attrs) {
        attributesList.push(attribute);
      }
      let nodeName = nodes[node].name;
      extensionAttribute[nodeName] = attributesList;
    }
  
    // Get attributes in Mark
    let marks = schema.marks;
    for (const mark in marks) {
      let attrs = marks[mark].spec.attrs;
      if (!attrs) {
        continue;
      }
      let attributesList: string[] = [];
      for (const attribute in attrs) {
        attributesList.push(attribute);
      }
      let markName = marks[mark].name;
      extensionAttribute[markName] = attributesList;
    }
    return extensionAttribute;
}