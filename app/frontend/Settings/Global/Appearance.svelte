<vbox class="appearance">
  <HeaderGroupBox>
    <hbox slot="header">{$t`Dark mode`}</hbox>
    <ThemeSwitcher />
  </HeaderGroupBox>

  <HeaderGroupBox>
    <hbox slot="header">{$t`Language`}</hbox>
    <hbox class="wrap">
      <vbox class="setting language">
        <hbox class="subheader">{$t`App *=> Software application`}</hbox>
        <hbox class="dropdown">
          <LanguageDropDown bind:language on:change={() => catchErrors(onChangedLanguage)} />
        </hbox>
        {#if language != getUILocalePref()}
          <Button
            label="Save and restart"
            icon={RestartIcon}
            on:click={onSaveLanguage}
            classes="restart"
            />
        {/if}
      </vbox>
      <vbox class="setting date-format">
        <hbox class="subheader">{$t`Date and time format`}</hbox>
        <hbox class="dropdown">
          <LanguageDropDown bind:language={dateTimeFormat} on:change={() => catchErrors(onSaveDateTimeFormat)} />
        </hbox>
        <hbox class="sample">
          {sampleDate.toLocaleString(dateTimeFormat, { year: "numeric", month: "2-digit", day: "2-digit" })}
        </hbox>
        <hbox class="sample">
          {sampleDate.toLocaleString(dateTimeFormat, { dateStyle: "long" })}
        </hbox>
        <hbox class="sample">
          {sampleDate.toLocaleString(dateTimeFormat, { hour: "numeric", minute: "numeric" })}
        </hbox>
      </vbox>
    </hbox>
  </HeaderGroupBox>
</vbox>

<script lang="ts">
  import { getUILocale, getUILocalePref, getDateTimeFormatPref, saveDateTimeFormat, saveUILocale, setUILocale, t } from "../../../l10n/l10n";
  import { appGlobal } from "../../../logic/app";
  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import LanguageDropDown from "./LanguageDropDown.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import RestartIcon from "lucide-svelte/icons/rotate-ccw";
  import { catchErrors } from "../../Util/error";

  let language = getUILocalePref();
  let dateTimeFormat = getDateTimeFormatPref();
  const sampleDate = new Date(new Date().getFullYear() + 1, 0, 20, 13, 0, 0);

  async function onSaveLanguage() {
    saveUILocale(language);
    setUILocale(getUILocale());
    onSaveDateTimeFormat();
    await appGlobal.remoteApp.restartApp(); // unfortunately needed for the strings in ts modules
  }

  async function onChangedLanguage() {
    dateTimeFormat = language;
  }

  async function onSaveDateTimeFormat() {
    saveDateTimeFormat(dateTimeFormat);
  }
</script>

<style>
  .wrap {
    flex-wrap: wrap;
    margin-block-end: -16px;
  }
  .setting {
    margin-inline-end: 32px;
    margin-block-end: 24px;
  }
  .subheader {
    font-weight: 500;
    margin-block-end: 6px;
  }
  .dropdown {
    margin-inline-start: -2px;
    margin-block-end: 8px;
  }
  .language .dropdown {
    margin-block-end: 24px;
  }
  .appearance :global(.theme svg) {
    width: 32px;
    height: 32px;
  }
  .appearance :global(.restart) {
    margin-inline-start: 24px;
  }
</style>
