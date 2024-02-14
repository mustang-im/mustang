<div bind:this={divEl} class="html-editor" />

<script lang="ts">
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import LinkFeature from '@tiptap/extension-link';
  import CodeWordFeature from '@tiptap/extension-code';
  // import CodeBlockLowlightFeature from '@tiptap/extension-code-block-lowlight';
  // import { common as lowlightCommon, createLowlight } from 'lowlight'

  import { onMount, onDestroy } from 'svelte';

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
</style>
