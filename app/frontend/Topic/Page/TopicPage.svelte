<vbox class="topic-page-container" flex>
  <hbox class="toolbar">
    <HTMLEditorToolbar {editor} />
    <hbox class="buttons">
      <RoundButton
        label={$t`Save`}
        icon={SaveIcon}
        onClick={onSave}
        border={false}
        iconSize="24px"
        />
      <ButtonMenu bind:isMenuOpen={isMenuOpen}>
        <RoundButton
          slot="control"
          tooltip={$t`More actions`}
          icon={MenuIcon}
          onClick={() => isMenuOpen = !isMenuOpen}
          classes="plain"
          border={false}
          iconSize="24px"
          />
        <MenuItem
          classes="danger"
          label={$t`Delete topic`}
          tooltip={$t`Delete topic ${topic.name} including all contents`}
          icon={TrashIcon}
          onClick={onDelete} />
      </ButtonMenu>
    </hbox>
  </hbox>
  <Scroll>
    <Paper>
      <vbox class="topic-page" flex>
        <hbox class="title">
          <input type="text" bind:value={topic.name} />
        </hbox>

        <vbox class="content">
          {#each $contents.each as content}
            {#if content instanceof Paragraph}
              <ParagraphEdit {topic} paragraph={content} bind:editor />
            {:else if content instanceof Image}
              <ImageEdit {topic} image={content} />
            {/if}
          {/each}
        </vbox>
        <Clickable onClick={onEditLast}>
          <vbox class="last" flex />
        </Clickable>
      </vbox>
    </Paper>
  </Scroll>
</vbox>

<script lang="ts">
  import { Image, Paragraph } from "../../../logic/Topic/PageContent";
  import { Topic } from "../../../logic/Topic/Topic";
  import ParagraphEdit from "./ParagraphEdit.svelte";
  import ImageEdit from "./ImageEdit.svelte";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Clickable from "../../Shared/Clickable.svelte";
  import SaveIcon from "lucide-svelte/icons/save";
  import MenuIcon from "lucide-svelte/icons/ellipsis";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import { gt, t } from "../../../l10n/l10n";
  import type { Editor } from "@tiptap/core";

  export let topic: Topic;

  $: contents = topic.content;
  let editor: Editor;
  let isMenuOpen = false;

  async function onSave() {
    for (let p of topic.content) {
      if (p instanceof Paragraph) {
        console.log("p", p.rawHTMLDangerous)
      }
    }
    topic.trimEnd();
    await topic.save();
    new Paragraph(topic);
  }

  function onEditLast() {
    new Paragraph(topic);
  }

  async function onDelete() {
    if (topic.content.hasItems) {
      let ok = confirm(gt`Do you want to delete topic ${topic.name}, including the page and all its contents?`);
      if (!ok) {
        return;
      }
    }
    await topic.deleteIt();
  }
</script>

<style>
  .topic-page-container {
    margin-block-end: 4px;
    position: relative;
  }
  .toolbar {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    padding-block-end: 2px;
    justify-content: end;
  }
  .toolbar .buttons {
    align-items: center;
    justify-content: center;
    margin-inline-start: 24px;
    margin-inline-end: 4px;
  }
  .topic-page {
    margin-inline: 24px 12px;
    margin-block-start: 12px;
  }
  .title input {
    margin-block-start: 0px;
    margin-block-end: 24px;
    margin-inline-end: 16px;
    font-size: 48px;
    font-weight: bold;
  }
  .content :global(.paragraph:last-of-type .html-editor) {
    min-height: 10em;
  }
</style>
