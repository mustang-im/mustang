<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox class="scroll" bind:this={containerE}>
  <slot />
</vbox>

<script lang="ts">
  let containerE: HTMLDivElement;
  export function scrollDown() {
    containerE.scrollTop = containerE.scrollHeight;
  }
  export function scrollTo(y: number) {
    containerE.scrollTop = y;
  }
</script>

<style>
  .scroll {
    flex: 1 0 0;
    position: relative;
    overflow: auto;
    overflow-wrap: anywhere;
  }
</style>
