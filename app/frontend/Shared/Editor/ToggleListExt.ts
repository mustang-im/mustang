import { Extension } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleListExt: {
      /**
       * Toggle bullet list extended
       */
      toggleBulletListExt: () => ReturnType,
      /**
       * Toggle ordered list extended
       */
      toggleOrderedListExt: () => ReturnType,
    }
  }
}

export const ToggleListExt = Extension.create({
  addCommands() {
    return {
      toggleBulletListExt: () => ({ tr,  editor, chain }) => {
        let { from, to } = tr.selection;
        let nodePos = editor.$pos(from);
        let runCommands = chain();
        let i = 0;
        while (nodePos && nodePos.pos != to) {
          if (nodePos.node.type.name == "hardBreak") {
            runCommands.setNodeSelection(nodePos.pos).deleteCurrentNode().splitBlock();
          }
          let content = nodePos.content;
          if (content) {
            content.forEach((node, offset, index) => {
              if (offset + nodePos.pos > to) {
                return;
              }
              if (node.type.name == "hardBreak") {
                console.log(node.type.name, offset);
                runCommands
                  .setTextSelection({ from: offset + nodePos.pos + i, to: offset + nodePos.pos + node.nodeSize + i })
                  .splitBlock();
                  i++;
              }
          });
          }
          try {
            nodePos = nodePos.after;
          } catch (ex) {
            break;
          }
        }
        return runCommands.setTextSelection({ from, to: to + i }).toggleBulletList().run();
      },
    }
  },
});