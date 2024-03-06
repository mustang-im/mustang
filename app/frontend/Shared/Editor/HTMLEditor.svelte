<!-- TODO Jail content into an iframe -->

<div bind:this={divEl} class="html-editor" />

<script lang="ts">
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import LinkFeature from '@tiptap/extension-link';
  import ImageFeature from '@tiptap/extension-image';
  import CodeWordFeature from '@tiptap/extension-code';
  import { SplitBlockquote } from './SplitBlockquote';
  import { Footer } from './Footer';
  // import CodeBlockLowlightFeature from '@tiptap/extension-code-block-lowlight';
  // import { common as lowlightCommon, createLowlight } from 'lowlight'
  import { onMount, onDestroy } from 'svelte';

  /**
   * TODO Bug: Only accepts `html` on component creation.
   * After that, it's out-only.
   * in/out */
  export let html: string;
  /** out only */
  export let editor: Editor;

  let divEl: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element: divEl,
      extensions: [
        StarterKit,
        LinkFeature,
        CodeWordFeature,
        SplitBlockquote,
        Footer,
        ImageFeature.configure({
          allowBase64: true,
          inline: true,
        }),
        // CodeBlockLowlightFeature.configure({
        //  lowlight: createLowlight(lowlightCommon),
        // }),
      ],
      content: html,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
      onUpdate: () => {
        html = editor.getHTML();
      },
    });
  });

  // TODO Listen to html. But removes all whitespace.
  //$: editor && editor.commands.setContent(html);

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
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
