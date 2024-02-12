<div bind:this={divEl} class="html-editor" />

<script lang="ts">
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Link from '@tiptap/extension-link';
  import Highlight from '@tiptap/extension-highlight';
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
        Link,
        Highlight.configure({
          multicolor: true,
        }),
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
