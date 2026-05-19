<vbox class="topic-page-container" flex>
  <Paper>
    <vbox class="topic-page" flex>
      <hbox class="title">
        <h1>{topic.name}</h1>
        <hbox flex />
        <hbox class="buttons">
          <RoundButton
            classes="danger"
            label={$t`Delete topic ${topic.name} including all contents`}
            icon={TrashIcon}
            onClick={onDelete}
            />
        </hbox>
      </hbox>

      <vbox class="content">
        {#each topic.content.each as content}
          {#if content instanceof Paragraph}
            {#if isEditing}
              <ParagraphEdit {topic} paragraph={content} />
            {:else}
              <ParagraphDisplay {topic} paragraph={content} />
            {/if}
          {:else if content instanceof Image}
            {#if isEditing}
              <ImageEdit {topic} image={content} />
            {:else}
              <ImageDisplay {topic} image={content} />
            {/if}
          {/if}
        {/each}
      </vbox>
    </vbox>
  </Paper>
</vbox>

<script lang="ts">
  import { Image, Paragraph } from "../../../logic/Topic/PageContent";
  import { Topic } from "../../../logic/Topic/Topic";
  import ParagraphDisplay from "./ParagraphDisplay.svelte";
  import ParagraphEdit from "./ParagraphEdit.svelte";
  import ImageDisplay from "./ImageDisplay.svelte";
  import ImageEdit from "./ImageEdit.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import { gt, t } from "../../../l10n/l10n";

  export let topic: Topic;

  let isEditing = false;

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
    margin-block: 4px;
    margin-inline-end: 1px;
  }
  .topic-page {
    margin-inline: 16px;
  }
  .title {
    font-size: 24px;
  }
  .title h1 {
    margin-block-start: 0px;
    margin-block-end: 0px;
  }
  .buttons {
    align-items: start;
    margin-block-start: 12px;
  }
</style>
