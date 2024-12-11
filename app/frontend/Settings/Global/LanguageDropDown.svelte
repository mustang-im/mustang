<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<select bind:value={language} on:change>
  <option value="">{$t`System`}</option>
  {#each Object.keys(localeNames) as langCode }
    <option value={langCode}>
      {localeNames[langCode]}
    </option>
  {/each}
</select>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import { localeNames } from "../../../l10n/list";

  /** 2-letter ISO language code. in/out */
  export let language: string;
</script>

<style>
</style>
