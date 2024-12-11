<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<!-- svelte-ignore a11y-autofocus -->
<input type="email" bind:value maxlength={100} autofocus={!value} />

<script lang="ts">
  export let value: string; /* in/out */
</script>

<style>
</style>
