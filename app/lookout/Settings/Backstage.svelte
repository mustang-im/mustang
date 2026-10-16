<hbox flex class="backstage">
  <vbox class="backstage-nav">
    <button class="nav-item back" title={$t`Back`} aria-label={$t`Back`} on:click={onBack}>
      <BackIcon size="20" />
    </button>
    <button class="nav-item" class:selected={$backstageState.page == "info"}
      on:click={() => backstageState.open("info")}>
      <InfoIcon size="18" />
      <hbox class="label">{$t`Info`}</hbox>
    </button>
    <button class="nav-item" class:selected={$backstageState.page == "open-export"}
      on:click={() => backstageState.open("open-export")}>
      <OpenExportIcon size="18" />
      <hbox class="label">{$t`Open & Export`}</hbox>
    </button>
    <vbox flex class="spacer" />
    <button class="nav-item" class:selected={$backstageState.page == "account"}
      on:click={() => backstageState.open("account")}>
      <AccountIcon size="18" />
      <hbox class="label">{$t`${appName} Account`}</hbox>
    </button>
    <button class="nav-item" on:click={() => SettingsDialogs.openOptions()}>
      <OptionsIcon size="18" />
      <hbox class="label">{$t`Options`}</hbox>
    </button>
    <button class="nav-item" on:click={onExit}>
      <ExitIcon size="18" />
      <hbox class="label">{$t`Exit`}</hbox>
    </button>
  </vbox>
  <vbox flex class="backstage-page">
    {#if $backstageState.page == "info"}
      <InfoPage />
    {:else if $backstageState.page == "open-export"}
      <OpenExportPage />
    {:else if $backstageState.page == "account"}
      <ProductAccountPage />
    {/if}
  </vbox>
</hbox>
<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import { backstageState } from "./BackstageState";
  import { SettingsDialogs } from "./SettingsDialogs";
  import InfoPage from "./Backstage/InfoPage.svelte";
  import OpenExportPage from "./Backstage/OpenExportPage.svelte";
  import ProductAccountPage from "./Backstage/ProductAccountPage.svelte";
  import AccountIcon from "lucide-svelte/icons/circle-user-round";
  import { appName } from "../../logic/build";
  import BackIcon from "lucide-svelte/icons/arrow-left";
  import InfoIcon from "lucide-svelte/icons/info";
  import OpenExportIcon from "lucide-svelte/icons/folder-open";
  import OptionsIcon from "lucide-svelte/icons/sliders-horizontal";
  import ExitIcon from "lucide-svelte/icons/log-out";
  import { t } from "../../l10n/l10n";

  function onBack() {
    backstageState.close();
  }

  function onExit() {
    window.close();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Escape" && !event.defaultPrevented) {
      backstageState.close();
    }
  }
</script>

<style>
  .backstage {
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    min-height: 0;
  }
  .backstage-nav {
    flex: 0 0 auto;
    width: 200px;
    padding: 8px 0;
    background-color: var(--lo-backstage-nav-bg);
    color: var(--lo-backstage-nav-fg);
  }
  .nav-item {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 20px;
    border: none;
    background-color: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 15px;
    text-align: start;
  }
  .nav-item.back {
    width: 34px;
    height: 34px;
    margin: 4px 0 16px 16px;
    padding: 0;
    justify-content: center;
    border: 1px solid var(--lo-border-strong);
    border-radius: 50%;
  }
  .nav-item:hover {
    background-color: var(--lo-backstage-nav-hover-bg);
  }
  .nav-item.selected {
    background-color: var(--lo-backstage-nav-selected-bg);
    font-weight: 600;
  }
  .nav-item.selected::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .backstage-page {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }
</style>
