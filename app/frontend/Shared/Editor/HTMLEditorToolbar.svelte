{#if editor}
  <Toolbar>
    <slot name="start" />

    <Button
      label="Bold"
      shortCutInfo="**bold**"
      on:click={() => editor.chain().focus().toggleBold().run()}
      disabled={!editor.can().chain().focus().toggleBold().run()}
      selected={editor.isActive('bold')}
      iconOnly
      >
      <hbox slot="icon" class="bold-icon">B</hbox>
    </Button>
    <Button
      label="Italic"
      shortCutInfo="_italic_"
      on:click={() => editor.chain().focus().toggleItalic().run()}
      disabled={!editor.can().chain().focus().toggleItalic().run()}
      selected={editor.isActive('italic')}
      icon={ItalicIcon}
      iconSize="16px"
      iconOnly
      />
    <Button
      label="Strike-through"
      on:click={() => editor.chain().focus().toggleStrike().run()}
      disabled={!editor.can().chain().focus().toggleStrike().run()}
      selected={editor.isActive('strike')}
      iconOnly
      >
      <hbox slot="icon" class="strike-through-icon">s</hbox>
    </Button>
    <Button
      label="Code word, within a phrase"
      shortCutInfo="`code`"
      on:click={() => editor.chain().focus().toggleCode().run()}
      disabled={!editor.can().chain().focus().toggleCode().run()}
      selected={editor.isActive('code')}
      icon={CodeWordIcon}
      iconSize="16px"
      iconOnly
      />
    <!--
    <Button
      label="Code block with multiple lines"
      shortCutInfo="
```
code
block
```"
      on:click={() => editor.chain().focus().toggleCode().run()}
      disabled={!editor.can().chain().focus().toggleCode().run()}
      selected={editor.isActive('code')}
      icon={CodeBlockIcon}
      iconSize="16px"
      iconOnly
      />
    -->
    <Button
      label="Quote of the original email"
      shortCutInfo="> Quote"
      on:click={() => editor.chain().focus().toggleBlockquote().run()}
      disabled={!editor.can().chain().focus().toggleBlockquote().run()}
      selected={editor.isActive('blockquote')}
      icon={QuoteMailIcon}
      iconSize="16px"
      iconOnly
      />
    <!--
    <Button
      label="Third party quote"
      on:click={() => editor.chain().focus().toggleBlockquote().run()}
      disabled={!editor.can().chain().focus().toggleBlockquote().run()}
      selected={editor.isActive('blockquote')}
      icon={QuoteIcon}
      iconSize="16px"
      iconOnly
      />
    -->
    <Button
      label="Bulleted list"
      shortCutInfo="* Item"
      on:click={() => editor.chain().focus().toggleBulletList().run()}
      disabled={!editor.can().chain().focus().toggleBulletList().run()}
      selected={editor.isActive('bulletList')}
      icon={ListBulletedIcon}
      iconOnly
      />
    <Button
      label="Ordered list"
      shortCutInfo="1. Item"
      on:click={() => editor.chain().focus().toggleOrderedList().run()}
      disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      selected={editor.isActive('orderedList')}
      icon={ListNumberedIcon}
      iconOnly
      />

    <Button
      label="Title"
      shortCutInfo="# Big title"
      on:click={() => editor.chain().focus().toggleHeading({ level: 1}).run()}
      disabled={!editor.can().chain().focus().toggleHeading({ level: 1}).run()}
      selected={editor.isActive('heading', { level: 1 })}
      iconOnly
      >
      <hbox slot="icon" class="header-icon">H1</hbox>
    </Button>
    <Button
      label="Heading, hierarchy level 2"
      shortCutInfo="## Sub header"
      on:click={() => editor.chain().focus().toggleHeading({ level: 2}).run()}
      disabled={!editor.can().chain().focus().toggleHeading({ level: 2}).run()}
      selected={editor.isActive('heading', { level: 2 })}
      iconOnly
      >
      <hbox slot="icon" class="header-icon">H2</hbox>
    </Button>
    <Button
      label="Heading, hierarchy level 3"
      shortCutInfo="### Sub sub header"
      on:click={() => editor.chain().focus().toggleHeading({ level: 3}).run()}
      disabled={!editor.can().chain().focus().toggleHeading({ level: 3}).run()}
      selected={editor.isActive('heading', { level: 3 })}
      iconOnly
      >
      <hbox slot="icon" class="header-icon">H3</hbox>
    </Button>
    <Button
      label="Link to webpage"
      on:click={createLink}
      selected={editor.isActive('link')}
      icon={LinkIcon}
      iconOnly
      />
    <Button
      label="Remove link"
      on:click={() => editor.chain().focus().unsetLink().run()}
      disabled={!editor.can().chain().focus().unsetLink().run()}
      icon={LinkRemoveIcon}
      iconOnly
      />
    <Button
      label="Insert image"
      on:click={createImage}
      icon={ImageIcon}
      iconOnly
      />
    <Button
      label="Clear formatting"
      on:click={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      icon={ClearIcon}
      iconSize="16px"
      iconOnly
      />

    <Button
      label="Undo the last change"
      shortCutInfo="Ctrl-Z"
      on:click={() => editor.chain().focus().undo().run()}
      disabled={!editor.can().chain().focus().undo().run()}
      icon={UndoIcon}
      iconOnly
      />
    <Button
      label="Redo the change that was undone before"
      shortCutInfo="Ctrl-Y"
      on:click={() => editor.chain().focus().redo().run()}
      disabled={!editor.can().chain().focus().redo().run()}
      icon={RedoIcon}
      iconOnly
      />
    {#if hasExtension('sendOnEnter')}
      <Button
      label="Toggle send button"
      on:click={() => editor.chain().focus().toggleSendKey().run()}
      icon={ForwardIcon}
      iconOnly
      />    
    {/if}
      <slot name="last" />

      <hbox flex />
      <slot name="end" />
  </Toolbar>
{/if}

<script lang="ts">
  import Toolbar from '../../Shared/Toolbar/Toolbar.svelte';
  import Button from '../../Shared/Button.svelte';
  import ItalicIcon from "lucide-svelte/icons/italic";
  import CodeWordIcon from "lucide-svelte/icons/code";
  import CodeBlockIcon from "lucide-svelte/icons/code-2";
  import QuoteMailIcon from "lucide-svelte/icons/text-quote";
  import QuoteIcon from "lucide-svelte/icons/quote";
  import LinkIcon from "lucide-svelte/icons/link";
  import LinkRemoveIcon from "lucide-svelte/icons/unlink";
  import ImageIcon from "lucide-svelte/icons/image-plus";
  import ListBulletedIcon from "lucide-svelte/icons/list";
  import ListNumberedIcon from "lucide-svelte/icons/list-ordered";
  import ClearIcon from "lucide-svelte/icons/remove-formatting";
  import UndoIcon from "lucide-svelte/icons/undo";
  import RedoIcon from "lucide-svelte/icons/redo";
  import ForwardIcon from 'lucide-svelte/icons/forward';
  import type { Editor } from '@tiptap/core';

  /* in only */
  export let editor: Editor;

  function hasExtension(name: string): boolean {
    let extensions = editor?.extensionManager.extensions;
    for (const extension of extensions) {
      if (extension.name === name) {
        return true;
      }
    }
    return false;
  }

  function createLink() {
    let url = window.prompt("Location");
    editor.chain().focus().setLink({ href: url }).run();
  }

  function createImage() {
    let url = window.prompt("Image URL");
    editor.chain().focus().setImage({ src: url }).run();
  }
</script>

<style>
  .bold-icon {
    font-weight: bold;
    font-size: 16px;
    height: 16px;
    align-items: center;
  }
  .strike-through-icon {
    text-decoration: line-through;
    font-size: 18px;
    height: 16px;
    align-items: center;
  }
  .header-icon {
    font-weight: bold;
  }
</style>
