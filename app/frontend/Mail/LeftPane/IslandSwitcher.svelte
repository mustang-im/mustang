<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox class="island" class:large class:border>
  <slot />
</hbox>

<script lang="ts">
  /**
   * Shows a number of buttons, which switch between multiple different views or modes.
   * Displays a rounded border around them, and each button is round as well.
   * Technically, these are radio buttons, because only 1 of them is active at any time.
   */

  export let large = false;
  export let border = true;
</script>

<style>
  .island.border {
    border: 1px solid var(--border);
    border-radius: 1000px;
  }
  .island :global(button) {
    border-radius: 1000px;
  }
  .island :global(button:not(:last-of-type)) {
    margin-inline-end: -6px;
  }
  .island :global(button.selected:not(.hover)) {
    background-color: var(--main-pattern-bg);
    color: var(--main-pattern-fg);
    border: none;
  }
  .island :global(button:not(.selected)) {
    background-color: transparent;
    border: none;
  }
  .island :global(button:hover) {
    z-index: 1;
  }
  .island :global(svg) {
    fill: transparent;
  }
  @media (max-width: 800px)  {
    .island.large {
      flex-direction: column;
      align-items: start;
      justify-content: stretch;
    }
  }
  </style>
