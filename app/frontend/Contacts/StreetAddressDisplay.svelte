<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox class="value">
  {#each lines as line}
    <div>{line}</div>
  {/each}
</vbox>

<script lang="ts">
  export let value: string;

  $: lines = value.split("\n");
</script>

<style>
</style>
