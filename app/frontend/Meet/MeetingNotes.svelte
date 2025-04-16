{#if event}
  <vbox class="meeting-header font-normal" class:showDescription>
    <hbox class="title-row">
      <hbox class="title-container">
        <div class="title value font-normal">
          {event.title}
        </div>
      </hbox>
      <Button plain
        classes="description-collapse"
        label={showDescription ? $t`Collapse description` : $t`Show meeting description`}
        on:click={() => showDescription = !showDescription}
        icon={showDescription ? CollapseIcon : ExpandIcon}
        iconOnly
        iconSize="16px"
        />
    </hbox>
    {#if showDescription}
      <Scroll>
        <div class="description value font-small">
          {#if event.descriptionHTML}
            {@html event.descriptionHTML}
          {:else}
            {event.descriptionText}
          {/if}
        </div>
      </Scroll>
    {/if}
  </vbox>
{/if}

<script lang="ts">
  import type { VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import Scroll from "../Shared/Scroll.svelte";
  import Button from "../Shared/Button.svelte";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import { t } from "../../l10n/l10n";

  export let meeting: VideoConfMeeting;

  $: event = meeting?.event;
  let showDescription = !!meeting?.event?.descriptionHTML;
</script>

<style>
  .meeting-header.showDescription {
    flex: 2 0 0;
  }
  .meeting-header {
    align-items: center;
  }
  .title-row {
    margin-block-start: 8px;
    margin-block-end: 16px;
    /*padding-inline-end: 16px;*/
  }
  .title-container {
    justify-content: center;
    width: 100%;
  }
  .title {
    font-weight: bold;
  }
  .description {
  }
</style>
