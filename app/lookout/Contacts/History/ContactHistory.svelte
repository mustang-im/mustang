<vbox class="activity-list">
  {#each shown as entry (entry)}
    <LogBox message={entry} />
  {:else}
    <hbox class="empty">{emptyText}</hbox>
  {/each}
  {#if maxCount && $entries.length > maxCount}
    <button class="more" on:click={onShowAll}>{$t`Show all`}</button>
  {:else if !maxCount && $entries.length >= activities.limit}
    <button class="more" on:click={onShowMore}>{$t`Show more`}</button>
  {/if}
</vbox>

<script lang="ts">
  import type { ContactActivities, ActivityKind } from "./ContactActivities";
  import LogBox from "./LogBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let activities: ContactActivities;
  export let kind: ActivityKind;
  export let emptyText: string;
  export let maxCount: number = null;
  export let onShowAll: () => void = null;
  export let onShowMore: () => void = null;

  $: entries = activities.of(kind);
  $: shown = maxCount ? $entries.contents.slice(0, maxCount) : $entries.contents;
</script>

<style>
  .activity-list {
    gap: 2px;
  }
  .empty {
    margin: 8px;
    color: var(--lo-fg-secondary);
  }
  .more {
    align-self: start;
    margin: 4px 8px;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .more:hover {
    text-decoration: underline;
  }
</style>
