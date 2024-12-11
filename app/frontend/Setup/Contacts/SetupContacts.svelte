<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox flex class="setup-contacts-window">
  <hbox flex />
  <vbox class="page-box">
    <svelte:component this={showPage} bind:showPage bind:config
      onCancel={onClose}
      />
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { openApp, selectedApp } from "../../AppsBar/selectedApp";
  import { selectedCategory } from "../../Settings/Window/selected";
  import { getSettingsCategoryForApp } from "../../Settings/Window/CategoriesUtils";
  import { settingsMustangApp } from "../../Settings/Window/SettingsMustangApp";
  import { contactsMustangApp } from "../../Contacts/ContactsMustangApp";
  import { SetupMustangApp } from "../SetupMustangApp";
  import SelectProtocol from "./SelectProtocol.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";

  let config: Calendar;
  let showPage: ConstructorOfATypedSvelteComponent | null = SelectProtocol;

  $: checkClose(showPage);
  function checkClose(_dummy: any) {
    if (showPage) {
      return;
    }
    onClose();
  }

  function onClose() {
    if ($selectedApp instanceof SetupMustangApp && typeof($selectedApp.onBack) == "function") {
      $selectedApp.onBack();
    } else {
      $selectedCategory = getSettingsCategoryForApp(contactsMustangApp);
      openApp(settingsMustangApp);
    }
  }
</script>

<style>
  .setup-contacts-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .setup-contacts-window :global(input) {
    font-size: 16px;
  }
  .setup-contacts-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
