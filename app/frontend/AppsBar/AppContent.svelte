<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox flex class="app-frame">
  <svelte:component this={app.mainWindow} {...app.mainWindowProperties} />
</vbox>

<script lang="ts">
  import type { MustangApp } from "./MustangApp";

  export let app: MustangApp;
</script>
