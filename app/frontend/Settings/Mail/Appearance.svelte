<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox class="view-switcher">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Mail app view`}</hbox>
    <ViewSwitcher large={true} />
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import ViewSwitcher from "../../Mail/LeftPane/ViewSwitcher.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
</script>

<style>
  .view-switcher :global(svg) {
    width: 32px;
    height: 32px;
  }
</style>
