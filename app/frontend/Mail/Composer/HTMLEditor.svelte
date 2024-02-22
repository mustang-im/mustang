<!-- TODO Jail content into an iframe -->

<div bind:this={divEl} class="html-editor" />

<script lang="ts">
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import LinkFeature from '@tiptap/extension-link';
  import CodeWordFeature from '@tiptap/extension-code';
  import Blockquote from '@tiptap/extension-blockquote';
  // import CodeBlockLowlightFeature from '@tiptap/extension-code-block-lowlight';
  // import { common as lowlightCommon, createLowlight } from 'lowlight'
  import { onMount, onDestroy } from 'svelte';
  import { canSplit } from '@tiptap/pm/transform';

  /* in/out */
  export let html: string;
  /* out only */
  export let editor: Editor;

  let divEl: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element: divEl,
      extensions: [
        StarterKit,
        LinkFeature,
        CodeWordFeature,
				CustomBlockquote,
        // CodeBlockLowlightFeature.configure({
        //  lowlight: createLowlight(lowlightCommon),
        // }),
      ],
      content: html,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
        html = editor.getHTML();
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  const CustomBlockquote = Blockquote.extend({
		addKeyboardShortcuts() {
			return {
				Enter: () => {
					return editor.commands.splitBlockquote();
				},
			}
		},
		addCommands() {
			return {
				splitBlockquote: () => ({ commands, chain, state }) => {
					let {$cursor} = state.selection;
					console.log($cursor.parentOffset);
					console.log($cursor.parent.content.size);
					console.log($cursor.before());
					let parent = editor.$pos($cursor.parentOffset).node;
					console.log(parent);
					if (parent.type.name != 'blockquote') {
						console.log('-1');
						return commands.splitListItem();
					}
					if ($cursor.parentOffset == 0) {
						console.log('1');
						return chain().createParagraphNear().selectNodeBackward().run();
					}
					if ($cursor.parentOffset == $cursor.parent.content.size) {
						console.log('2');
						return chain().createParagraphNear().splitListItem('blockquote').run();
					}
					console.log('3');					
					return chain().splitListItem(this.name).selectNodeBackward().liftEmptyBlock().run();
				},
			}
		},
  });
</script>

<style>
  /** Fix app.css, see .value */
  .html-editor :global(*) {
    user-select: text;
  }
  .html-editor {
    height: 100%;
  }
  .html-editor :global(.ProseMirror) {
    height: 100%;
    margin-top: -16px; /* the content was shifted down, for some reason */
  }
  .html-editor :global(.ProseMirror:focus-visible) {
    outline: none;
  }


  /* Content styles
     TODO @import url(../Message/content.css); into iframe */

  .html-editor :global(p) {
    margin: 0px;
  }
  .html-editor :global(blockquote) {
    border-left: 3px solid blue;
    padding-left: 20px;
    margin-left: 0px;
  }
</style>
