<vbox class="appearance">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Dark mode`}</hbox>
    <DarkMode />
  </HeaderGroupBox>

  <HeaderGroupBox>
    <hbox slot="header">{$t`Language`}</hbox>
    <hbox>
      <LanguageDropDown bind:language />
      {#if language != getUILocale()}
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
  import { getUILocale, saveUILocale, setUILocale, t } from "../../../l10n/l10n";
  import { appGlobal } from "../../../logic/app";
  import DarkMode from "./DarkMode.svelte";
  import LanguageDropDown from "./LanguageDropDown.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import RestartIcon from "lucide-svelte/icons/rotate-ccw";

  let language = getUILocale();

  async function onChangeLanguage() {
    saveUILocale(language);
    setUILocale(language);
    await appGlobal.remoteApp.restartApp(); // unfortunately needed for the strings in ts modules
  }
</script>

<style>
  .appearance :global(.darkmode svg) {
    width: 32px;
    height: 32px;
  }
  .appearance :global(.restart) {
    margin-inline-start: 24px;
  }
</style>
