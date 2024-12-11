<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

{#if $meetings.length > 1}
  <grid>
    {#each $meetings.each as meeting}
      <hbox>{meeting.startTime.toLocaleTimeString(getUILocale())} - {meeting.endTime.toLocaleTimeString(getUILocale())}</hbox>
      <hbox>{meeting.title}</hbox>
    {/each}
  </grid>
{:else}
  <slot name="emptyMsg" />
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import { getUILocale } from "../../../l10n/l10n";

  export let meetings: Collection<Event>;
</script>

<style>
  grid {
    grid-template-columns: auto 1fr;
  }
</style>
