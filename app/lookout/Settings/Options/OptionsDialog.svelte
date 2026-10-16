<Dialog title={$t`${appName} Options`}
  okLabel={$t`OK`}
  onOK={onOK}
  width="880px"
  height="680px"
  on:close>
  <hbox flex class="options-dialog">
    <CategoryList groups={categoryGroups} bind:selected={category} />
    <vbox flex class="page" role="tabpanel">
      {#if category == "general"}
        <GeneralOptions {options} />
      {:else if category == "mail"}
        <MailOptions {options} />
      {:else if category == "calendar"}
        <CalendarOptions {options} />
      {:else if category == "language"}
        <LanguageOptions {options} />
      {:else if category == "advanced"}
        <AdvancedOptions {options} />
      {:else if category == "trust-center"}
        <TrustCenterOptions {options} />
      {/if}
    </vbox>
  </hbox>
</Dialog>

<script lang="ts">
  import type { OptionsCategory } from "../SettingsDialogs";
  import { OptionsModel } from "./OptionsModel";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import GeneralOptions from "./GeneralOptions.svelte";
  import MailOptions from "./MailOptions.svelte";
  import CalendarOptions from "./CalendarOptions.svelte";
  import LanguageOptions from "./LanguageOptions.svelte";
  import AdvancedOptions from "./AdvancedOptions.svelte";
  import TrustCenterOptions from "./TrustCenterOptions.svelte";
  import CategoryList from "./CategoryList.svelte";
  import { appName } from "../../../logic/build";
  import { catchErrors } from "../../../frontend/Util/error";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let category: OptionsCategory = "general";

  const options = new OptionsModel();

  $: categoryGroups = [
    [
      { id: "general", label: $t`General` },
      { id: "mail", label: $t`Mail` },
      { id: "calendar", label: $t`Calendar` },
      { id: "language", label: $t`Language` },
      { id: "advanced", label: $t`Advanced` },
    ],
    [
      { id: "trust-center", label: $t`Trust Center` },
    ],
  ] as { id: OptionsCategory, label: string }[][];

  onMount(() => catchErrors(onLoad));
  async function onLoad() {
    await options.loadDefaultMailApp();
  }

  async function onOK() {
    await options.save();
  }
</script>

<style>
  .options-dialog {
    gap: 16px;
    height: 100%;
    min-height: 0;
  }
  .page {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
  }
</style>
