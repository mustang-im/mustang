import { Node } from "@tiptap/core";

export type EmbeddedRenderer = (
  target: HTMLElement,
  content: any,
  deleteNode: () => void,
) => { destroy: () => void };

export interface EmbeddedContentOptions {
  getContent: (contentID: string) => any;
  renderers: Record<string, EmbeddedRenderer>;
}

/** Generic TipTap block node that mounts an arbitrary Svelte component.
 *
 * The node is atom (cursor skips over it, not into it).
 * The host page registers a renderer function per content type.
 * All data lives in the renderer's closure — TipTap only stores two
 * opaque string attributes (contentType, contentID) for round-tripping. */
export let EmbeddedContent = Node.create<EmbeddedContentOptions>({
  name: "embedded-content",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      getContent: () => null,
      renderers: {},
    };
  },

  addAttributes() {
    return {
      contentType: { default: null },
      contentID: { default: null },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-type="embedded-content"]',
      getAttrs(el) {
        let element = el as HTMLElement;
        return {
          contentType: element.dataset.contentType,
          contentID: element.dataset.contentId,
        };
      },
    }];
  },

  renderHTML({ node }) {
    return ["div", {
      "data-type": "embedded-content",
      "data-content-type": node.attrs.contentType,
      "data-content-id": node.attrs.contentID,
    }];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      let { contentType, contentID } = node.attrs;
      let content = this.options.getContent(contentID);
      let renderer = this.options.renderers[contentType];

      let deleteNode = () => {
        let from = getPos();
        if (typeof from === "number") {
          editor.commands.deleteRange({ from, to: from + node.nodeSize });
        }
      };

      let dom = document.createElement("div");

      let mounted: { destroy: () => void } | null = null;
      if (renderer && content != null) {
        mounted = renderer(dom, content, deleteNode);
      }

      return {
        dom,
        destroy() {
          mounted?.destroy();
        },
      };
    };
  },
});
