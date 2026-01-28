<!-- TODO Jail content into an iframe -->

<div bind:this={rootEl} class="html-editor" />

<script lang="ts">
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import LinkFeature from '@tiptap/extension-link';
  import CodeWordFeature from '@tiptap/extension-code';
  import ImageResize from 'tiptap-extension-resize-image';
  import { SplitBlockquote } from './SplitBlockquote';
  import { Footer } from './Footer';
  import { BoldStar, ItalicSlash } from './StdConventions';
  import { ParagraphNewLine } from './ParagraphNewLine';
  import { InsertLink } from './InsertLink';
  // import CodeBlockLowlightFeature from '@tiptap/extension-code-block-lowlight';
  // import { common as lowlightCommon, createLowlight } from 'lowlight'
  import { onMount, onDestroy } from 'svelte';

  /** in/out */
  export let html: string;
  /** out only */
  export let editor: Editor;
  export let tabindex = null;

  let rootEl: HTMLDivElement;
  let lastHTML: string = null;

  onMount(onLoad);

  function onLoad() {
    editorElementCreatedMutationObserver.observe(rootEl, {childList: true});
    createEditor();
  }

  function createEditor() {
    editor = new Editor({
      element: rootEl,
      extensions: [
        StarterKit,
        LinkFeature,
        CodeWordFeature,
        SplitBlockquote,
        Footer,
        ImageResize.configure({
          allowBase64: true,
          inline: true,
          HTMLAttributes: {
            style: "max-width: 90%; height: auto; margin: 10px;"
          },
        }),
        BoldStar,
        ItalicSlash,
        ParagraphNewLine,
        InsertLink.configure({
          editorEl: rootEl,
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
      onUpdate: ({ editor }) => {
        html = lastHTML = editor.getHTML();
      },
    });
    lastHTML = html;
  }

  export function forceReload() {
    if (editor) {
      editor.destroy();
    }
    createEditor();
  }

  // html changed by caller, not editor
  $: html != lastHTML && forceReload();

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
    editorElementCreatedMutationObserver.disconnect();
  });

  const editorElementCreatedMutationObserver = new MutationObserver((mutationList, observer) => {
    for (let mutation of mutationList) {
      for (let element of mutation.addedNodes) {
        onEditorElementCreated(element as HTMLDivElement);
      }
    }
  });
  function onEditorElementCreated(el: HTMLDivElement) {
    if (tabindex) {
      el.tabIndex = tabindex;
    }
  }
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

  .html-editor :global(blockquote) {
    border-left: 3px solid #20AE9E;
    padding-inline-start: 20px;
    margin-inline-start: 0px;
  }
  .html-editor :global(img) {
    max-width: 100%;
  }

  /** Undo the default margin of first/last <p> */
  .html-editor :global(.tiptap) {
    margin-top: -1em;
    margin-bottom: -1em;
  }
</style>
