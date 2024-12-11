<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox class="list">
  {#each recipients.each as to, i}
    {#if i > 0}
      <hbox class="comma">,</hbox>
    {/if}
    <Recipient recipient={to} />
  {/each}
</hbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import Recipient from "./Recipient.svelte";

  export let recipients: Collection<PersonUID>;
</script>

<style>
  .list {
    flex-wrap: wrap;
    max-height: 3em;
    overflow-y: hidden;
  }
  .comma {
    margin-inline-end: 0.3em;
  }
</style>
