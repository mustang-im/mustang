<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox class="toolbar">
  <slot />
</hbox>

<script lang="ts">
</script>

<style>
  .toolbar {
    /* background-color: #DDDDDD;
    border: 1px solid #B2ADB8; */
    padding: 0px 4px;
    flex-wrap: wrap;
  }
  .toolbar :global(button.button) {
    border: none;
    border-radius: 0px;
    background-color: transparent;
    padding: 6px 6px;
    color: #595065;
  }
  .toolbar :global(button.button.disabled) {
    opacity: 20%;
  }
</style>
