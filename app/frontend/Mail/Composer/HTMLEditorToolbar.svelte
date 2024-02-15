{#if editor}
  <Toolbar>
    <Button
      label="Heading, top level"
      on:click={() => editor.chain().focus().toggleBold().run()}
      disabled={!editor.can().chain().focus().toggleBold().run()}
      selected={editor.isActive('bold')}
      iconOnly
      >
      <hbox slot="icon" class="bold-icon">B</hbox>
    </Button>
    <Button
      label="Italic"
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
      label="Bulleted list"
      on:click={() => editor.chain().focus().toggleBulletList().run()}
      disabled={!editor.can().chain().focus().toggleBulletList().run()}
      selected={editor.isActive('bulletList')}
      icon={ListBulletedIcon}
      iconOnly
      />
    <Button
      label="Numbered list"
      on:click={() => editor.chain().focus().toggleOrderedList().run()}
      disabled={!editor.can().chain().focus().toggleOrderedList().run()}
      selected={editor.isActive('orderedList')}
      icon={ListNumberedIcon}
      iconOnly
      />

    <Button
      label="Heading, top level"
      on:click={() => editor.chain().focus().toggleHeading({ level: 1}).run()}
      disabled={!editor.can().chain().focus().toggleHeading({ level: 1}).run()}
      selected={editor.isActive('heading', { level: 1 })}
      iconOnly
      >
      <hbox slot="icon" class="header-icon">H1</hbox>
    </Button>
    <Button
      label="Heading, hierarchy level 2"
      on:click={() => editor.chain().focus().toggleHeading({ level: 2}).run()}
      disabled={!editor.can().chain().focus().toggleHeading({ level: 2}).run()}
      selected={editor.isActive('heading', { level: 2 })}
      iconOnly
      >
      <hbox slot="icon" class="header-icon">H2</hbox>
    </Button>
    <Button
      label="Heading, hierarchy level 3"
      on:click={() => editor.chain().focus().toggleHeading({ level: 3}).run()}
      disabled={!editor.can().chain().focus().toggleHeading({ level: 3}).run()}
      selected={editor.isActive('heading', { level: 3 })}
      iconOnly
      >
      <hbox slot="icon" class="header-icon">H3</hbox>
    </Button>
    <Button
      label="Clear formatting"
      on:click={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      icon={ClearIcon}
      iconSize="16px"
      iconOnly
      />

    <Button
      label="Undo the last change"
      on:click={() => editor.chain().focus().undo().run()}
      disabled={!editor.can().chain().focus().undo().run()}
      icon={UndoIcon}
      iconOnly
      />
    <Button
      label="Redo the change that was undone before"
      on:click={() => editor.chain().focus().redo().run()}
      disabled={!editor.can().chain().focus().redo().run()}
      icon={RedoIcon}
      iconOnly
      />
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
  import ListBulletedIcon from "lucide-svelte/icons/list";
  import ListNumberedIcon from "lucide-svelte/icons/list-ordered";
  import ClearIcon from "lucide-svelte/icons/remove-formatting";
  import UndoIcon from "lucide-svelte/icons/undo";
  import RedoIcon from "lucide-svelte/icons/redo";
  import type { Editor } from '@tiptap/core';

  /* in only */
  export let editor: Editor;

  function createLink() {
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
