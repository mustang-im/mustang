<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

{#if typeof (icon) == "string"}
  <Icon data={icon} {size} />
{:else if icon}
  <svelte:component this={icon} {size} />
{:else}
  <MissingIcon size={parseInt(size)} />
{/if}

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';
  import MissingIcon from "lucide-svelte/icons/dot";

  /** App icon, either as SVG string or as Svelte component */
  export let icon: string | ConstructorOfATypedSvelteComponent;
  /** CSS size, e.g. "24px" */
  export let size: string;
</script>
