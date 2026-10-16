<hbox class="tell-me" class:active={isActive} bind:this={fieldEl}>
  <span class="bulb"><TellMeIcon size={16} /></span>
  <input type="text" class="tell-me-input"
    bind:value={searchTerm}
    bind:this={inputEl}
    placeholder={$t`Tell me what you want to do`}
    aria-label={$t`Tell me what you want to do`}
    aria-haspopup="menu"
    aria-expanded={isMenuOpen}
    autocomplete="off" spellcheck="false"
    on:focus={onFocus}
    on:blur={onBlur}
    on:input={onInput}
    on:keydown={onKeyDown} />
</hbox>
<Menu bind:isMenuOpen anchor={fieldEl} placement="bottom-start" autoFocus={false}
  onClose={onMenuClosed} bind:this={menu}>
  <MenuLabel label={$t`Actions`} />
  {#each results as result (result)}
    <MenuItem label={result.label} disabled={result.disabled}
      tooltip={result.tooltip}
      onClick={() => run(result)}>
      <svelte:fragment slot="icon">
        {#if result.iconHTML}
          <span class="result-icon">{@html result.iconHTML}</span>
        {/if}
      </svelte:fragment>
      <svelte:fragment slot="label">
        <span class="result-label">{result.label}</span>
        <span class="result-place">{result.tabLabel}{result.groupLabel ? " › " + result.groupLabel : ""}</span>
      </svelte:fragment>
    </MenuItem>
  {:else}
    <MenuItem label={$t`No matching commands`} disabled />
  {/each}
</Menu>

<script lang="ts">
  import { RibbonModel } from "./Ribbon";
  import { RibbonCommands, type RibbonCommandEntry } from "./RibbonCommands";
  import Menu from "../Menu/Menu.svelte";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuLabel from "../Menu/MenuLabel.svelte";
  import TellMeIcon from "lucide-svelte/icons/lightbulb";
  import { getContext, tick } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let ribbonEl: HTMLElement;

  const ribbon = getContext<RibbonModel>(RibbonModel.contextKey);

  let fieldEl: HTMLElement;
  let inputEl: HTMLInputElement;
  let menu: Menu;
  let searchTerm = "";
  let isMenuOpen = false;
  let isActive = false;
  let isSurveying = false;
  let entries: RibbonCommandEntry[] = [];
  let results: RibbonCommandEntry[] = [];

  async function startSurvey() {
    if (!isSurveying) {
      isSurveying = true;
      ribbon.startSurvey();
    }
    await tick();
    entries = RibbonCommands.collect(ribbonEl);
  }

  function endSurvey() {
    if (isSurveying) {
      isSurveying = false;
      ribbon.endSurvey();
    }
  }

  async function onFocus() {
    isActive = true;
    await startSurvey();
    updateResults();
  }

  function onBlur(event: FocusEvent) {
    let target = event.relatedTarget as Node;
    if (target && document.querySelector(".lo-menu")?.contains(target)) {
      return;
    }
    if (!isMenuOpen) {
      close();
    }
  }

  async function onInput() {
    if (!isSurveying) {
      await startSurvey();
    }
    updateResults();
  }

  function updateResults() {
    results = RibbonCommands.search(entries, searchTerm);
    isMenuOpen = !!searchTerm.trim();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Escape") {
      event.preventDefault();
      event.stopPropagation();
      searchTerm = "";
      close();
      inputEl.blur();
    } else if (event.key == "ArrowDown" && isMenuOpen) {
      event.preventDefault();
      menu?.focusFirstItem();
    } else if (event.key == "Enter") {
      event.preventDefault();
      let first = results.find(result => !result.disabled);
      if (first) {
        run(first);
      }
    }
  }

  function onMenuClosed() {
    if (document.activeElement != inputEl) {
      close();
    }
  }

  function close() {
    isMenuOpen = false;
    isActive = false;
    endSurvey();
  }

  async function run(entry: RibbonCommandEntry) {
    isMenuOpen = false;
    searchTerm = "";
    let tabEl = Array.from(ribbonEl.querySelectorAll<HTMLElement>(".tabs [role=tab]"))
      .find(candidate => candidate.textContent.trim() == entry.tabLabel);
    if (tabEl && tabEl.getAttribute("aria-selected") != "true") {
      tabEl.click();
    }
    await tick();
    close();
    await tick();
    let el = entry.el.isConnected ? entry.el : RibbonCommands.collect(ribbonEl)
      .find(candidate => candidate.tabLabel == entry.tabLabel && candidate.groupLabel == entry.groupLabel && candidate.label == entry.label)?.el;
    if (!el) {
      return;
    }
    let input = el.querySelector("input");
    if (el.classList.contains("ribbon-textbox")) {
      input?.focus();
    } else if (el.classList.contains("ribbon-checkbox")) {
      input?.click();
    } else {
      el.click();
    }
  }
</script>

<style>
  .tell-me {
    flex: 0 1 240px;
    align-items: center;
    gap: 6px;
    min-width: 32px;
    height: 28px;
    margin-inline-end: 4px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--lo-radius-small);
    color: var(--lo-fg-secondary);
  }
  .tell-me:hover {
    border-color: var(--lo-border);
  }
  .tell-me.active {
    border-color: var(--lo-border-strong);
    background-color: var(--lo-input-bg);
  }
  .bulb {
    display: flex;
    flex-shrink: 0;
  }
  .tell-me-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: none;
    outline: none;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-size: var(--lo-font-size-small);
  }
  .tell-me-input::placeholder {
    color: var(--lo-fg-secondary);
  }
  .result-icon {
    display: flex;
    width: 16px;
    height: 16px;
  }
  .result-icon :global(svg) {
    width: 16px;
    height: 16px;
  }
  .result-label {
    margin-inline-end: 12px;
  }
  .result-place {
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
  }
</style>
