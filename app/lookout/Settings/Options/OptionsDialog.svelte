<Dialog title={$t`${appName} Options`}
  okLabel={$t`OK`}
  onOK={onOK}
  width="880px"
  height="680px"
  on:close>
  <hbox flex class="options-dialog">
    <vbox class="categories" role="tablist" aria-orientation="vertical">
      {#each categoryGroups as group, groupIndex}
        {#if groupIndex > 0}
          <hbox class="separator" />
        {/if}
        {#each group as entry (entry.id)}
          <button class="category" class:selected={entry.id == category}
            role="tab" aria-selected={entry.id == category}
            on:click={() => category = entry.id}>
            {entry.label}
          </button>
        {/each}
      {/each}
    </vbox>
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
  .categories {
    flex-shrink: 0;
    width: 180px;
    padding: 4px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-alt-bg);
    overflow-y: auto;
  }
  .category {
    position: relative;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .category:hover {
    background-color: var(--lo-hover-bg);
  }
  .category.selected {
    background-color: var(--lo-selected-bg);
    font-weight: 600;
  }
  .category.selected::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .separator {
    margin: 6px 8px;
    border-block-start: 1px solid var(--lo-divider);
  }
  .page {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
  }
</style>
