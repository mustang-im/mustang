<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox class="appearance">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Dark mode`}</hbox>
    <ThemeSwitcher />
  </HeaderGroupBox>

  <HeaderGroupBox>
    <hbox slot="header">{$t`Language`}</hbox>
    <hbox>
      <LanguageDropDown bind:language />
      {#if language != getUILocalePref()}
        <Button
          label="Save and restart"
          icon={RestartIcon}
          on:click={onChangeLanguage}
          classes="restart"
          />
      {/if}
    </hbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { getUILocale, getUILocalePref, saveUILocale, setUILocale, t } from "../../../l10n/l10n";
  import { appGlobal } from "../../../logic/app";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import LanguageDropDown from "./LanguageDropDown.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import RestartIcon from "lucide-svelte/icons/rotate-ccw";

  let language = getUILocalePref();

  async function onChangeLanguage() {
    saveUILocale(language);
    setUILocale(getUILocale());
    await appGlobal.remoteApp.restartApp(); // unfortunately needed for the strings in ts modules
  }
</script>

<style>
  .appearance :global(.theme svg) {
    width: 32px;
    height: 32px;
  }
  .appearance :global(.restart) {
    margin-inline-start: 24px;
  }
</style>
