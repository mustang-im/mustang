<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<hbox class="address-field" class:chips class:disabled bind:this={fieldEl}
  on:click={onFieldClick}>
  {#each $addresses.each as recipient (recipient)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <hbox class="recipient" class:selected={recipient == selected}
      title={recipient.emailAddress}
      on:click|stopPropagation={() => onSelect(recipient)}
      on:contextmenu|preventDefault|stopPropagation={event => onRecipientMenu(event, recipient)}>
      {#if chips}
        <PersonCircle name={displayName(recipient)}
          picture={recipient.person?.picture} colorKey={recipient.emailAddress} size={20} />
        <span class="name">{displayName(recipient)}</span>
        {#if !disabled}
          <button type="button" class="remove" tabindex={-1} title={$t`Remove`} aria-label={$t`Remove`}
            on:click|stopPropagation={() => remove(recipient)}>
            <RemoveIcon size={12} />
          </button>
        {/if}
      {:else}
        <span class="name">{displayName(recipient)}</span><span class="separator">;</span>
      {/if}
    </hbox>
  {/each}
  {#if !disabled}
    <input type="text" class="typed" bind:this={inputEl} bind:value={typed}
      role="combobox" aria-label={label} aria-autocomplete="list"
      aria-expanded={isListOpen} aria-controls={listID}
      aria-activedescendant={isListOpen ? `${listID}-${highlighted}` : null}
      autocomplete="off" spellcheck="false"
      placeholder={$addresses.isEmpty ? placeholder : null}
      {tabindex} {autofocus}
      on:input={onInput}
      on:keydown={onKeyDown}
      on:paste={onPaste}
      on:blur={onBlur} />
  {/if}
</hbox>
{#if isListOpen}
  <AutocompleteList {suggestions} bind:highlighted anchor={fieldEl} id={listID} onChoose={choose} />
{/if}
<ContextMenu bind:this={contextMenu}>
  <MenuItem label={$t`Copy`} icon={CopyIcon} onClick={() => onCopy(menuRecipient)} />
  <MenuItem label={$t`Cut`} icon={CutIcon} disabled={disabled} onClick={() => onCut(menuRecipient)} />
  <MenuItem label={$t`Remove`} icon={RemoveIcon} disabled={disabled} onClick={() => remove(menuRecipient)} />
  <MenuDivider />
  <MenuItem label={menuRecipient?.findPerson() ? $t`Open Contact Card` : $t`Add to Contacts`}
    icon={ContactIcon} onClick={() => openPersonFromOtherApp(menuRecipient.createPerson(appGlobal.personalAddressbook))} />
</ContextMenu>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { searchContacts } from "../../../logic/Contacts/Search";
  import { UserError } from "../../../logic/util/util";
  import { showError, backgroundError } from "../../../frontend/Util/error";
  import { RecipientText } from "./RecipientText";
  import AutocompleteList from "./AutocompleteList.svelte";
  import PersonCircle from "../../Contacts/Person/PersonCircle.svelte";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import RemoveIcon from "lucide-svelte/icons/x";
  import CopyIcon from "lucide-svelte/icons/copy";
  import CutIcon from "lucide-svelte/icons/scissors";
  import ContactIcon from "lucide-svelte/icons/contact-round";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { appGlobal } from "../../../logic/app";
  import { openPersonFromOtherApp } from "../../../frontend/Contacts/open";

  export let addresses: ArrayColl<PersonUID> = null;
  export let recipients: ArrayColl<PersonUID> = null;
  $: addresses = recipients ?? addresses;
  export let label: string;
  export let chips = false;
  export let disabled = false;
  export let autofocus = false;
  export let tabindex: number = null;
  export let onAdd: (recipient: PersonUID) => void = null;
  export let placeholder: string = null;

  const listID = "address-suggestions-" + Math.random().toString(36).slice(2);
  let fieldEl: HTMLElement;
  let inputEl: HTMLInputElement;
  let contextMenu: ContextMenu;
  let typed = "";
  let selected: PersonUID | null = null;
  let menuRecipient: PersonUID | null = null;
  let suggestions: PersonUID[] = [];
  let highlighted = 0;
  let searchCounter = 0;
  $: isListOpen = suggestions.length > 0 && !!typed.trim();

  export function focus() {
    inputEl?.focus();
  }

  export async function checkNames(): Promise<boolean> {
    let text = typed.trim();
    if (!text) {
      return true;
    }
    let { recipients: parsed, unresolved } = RecipientText.parseList(text);
    parsed.forEach(add);
    let stillUnresolved: string[] = [];
    for (let name of unresolved) {
      let found = await searchContacts(name, isAdded);
      if (found.length == 1) {
        add(found[0]);
      } else {
        stillUnresolved.push(name);
      }
    }
    typed = stillUnresolved.join("; ");
    if (stillUnresolved.length) {
      await updateSuggestions();
      if (!suggestions.length) {
        throw new UserError($t`No contact matches ${stillUnresolved.join("; ")}`);
      }
      return false;
    }
    return true;
  }

  function isAdded(recipient: PersonUID): boolean {
    return addresses.some(existing => existing.emailAddress == recipient.emailAddress);
  }

  function add(recipient: PersonUID) {
    if (!recipient || isAdded(recipient)) {
      return;
    }
    addresses.add(recipient);
    onAdd?.(recipient);
  }

  function remove(recipient: PersonUID) {
    if (!recipient) {
      return;
    }
    addresses.remove(recipient);
    if (selected == recipient) {
      selected = null;
    }
  }

  function choose(recipient: PersonUID) {
    add(recipient);
    typed = "";
    suggestions = [];
    inputEl?.focus();
  }

  function acceptTyped(): boolean {
    if (isListOpen && suggestions[highlighted]) {
      choose(suggestions[highlighted]);
      return true;
    }
    let { recipients: parsed, unresolved } = RecipientText.parseList(typed);
    if (!parsed.length) {
      return false;
    }
    parsed.forEach(add);
    typed = unresolved.join("; ");
    suggestions = [];
    return true;
  }

  async function updateSuggestions() {
    let thisSearch = ++searchCounter;
    let text = typed.trim();
    if (text.length < 2) {
      suggestions = [];
      return;
    }
    let found = await searchContacts(text, isAdded);
    if (thisSearch != searchCounter) {
      return;
    }
    suggestions = found.slice(0, 12);
    highlighted = 0;
  }

  function onInput() {
    selected = null;
    updateSuggestions().catch(backgroundError);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) {
      return;
    }
    let atStart = inputEl.selectionStart == 0 && inputEl.selectionEnd == 0;
    if (event.key == "ArrowDown" && isListOpen) {
      event.preventDefault();
      highlighted = (highlighted + 1) % suggestions.length;
    } else if (event.key == "ArrowUp" && isListOpen) {
      event.preventDefault();
      highlighted = (highlighted - 1 + suggestions.length) % suggestions.length;
    } else if (event.key == "Escape" && isListOpen) {
      event.preventDefault();
      event.stopPropagation();
      suggestions = [];
    } else if ((event.key == "Enter" && !event.ctrlKey && !event.metaKey) || event.key == ";" || event.key == ",") {
      if (typed.trim() && acceptTyped()) {
        event.preventDefault();
      } else if (event.key == "Enter" && typed.trim()) {
        event.preventDefault();
        checkNames().catch(showError);
      }
    } else if (event.key == "Tab" && !event.shiftKey && typed.trim()) {
      acceptTyped();
    } else if ((event.key == "Backspace" || event.key == "Delete") && selected) {
      event.preventDefault();
      remove(selected);
    } else if ((event.key == "Backspace" || event.key == "ArrowLeft") && atStart && addresses.hasItems) {
      event.preventDefault();
      selected = addresses.getIndex(addresses.length - 1);
    } else if (event.key != "Shift" && event.key != "Control") {
      selected = null;
    }
  }

  function onPaste(event: ClipboardEvent) {
    let text = event.clipboardData?.getData("text/plain") ?? "";
    let { recipients: parsed, unresolved } = RecipientText.parseList(text);
    if (!parsed.length) {
      return;
    }
    event.preventDefault();
    parsed.forEach(add);
    typed = (typed + " " + unresolved.join("; ")).trim();
  }

  function onBlur() {
    selected = null;
    if (typed.trim()) {
      let { recipients: parsed, unresolved } = RecipientText.parseList(typed);
      parsed.forEach(add);
      typed = unresolved.join("; ");
    }
    suggestions = [];
  }

  function onFieldClick() {
    selected = null;
    inputEl?.focus();
  }

  function onSelect(recipient: PersonUID) {
    selected = recipient;
    inputEl?.focus();
  }

  function onRecipientMenu(event: MouseEvent, recipient: PersonUID) {
    selected = recipient;
    menuRecipient = recipient;
    contextMenu.onContextMenu(event);
  }

  async function onCopy(recipient: PersonUID) {
    await navigator.clipboard.writeText(clipboardText(recipient));
  }

  async function onCut(recipient: PersonUID) {
    await onCopy(recipient);
    remove(recipient);
  }

  /* <copied from="../Message/RecipientsList.svelte"> */
  function displayName(recipient: PersonUID): string {
    return (!recipient.nameIsUnknown && recipient.name) || recipient.emailAddress;
  }

  function clipboardText(recipient: PersonUID): string {
    return recipient.name && recipient.name != recipient.emailAddress
      ? `${recipient.name} <${recipient.emailAddress}>`
      : recipient.emailAddress;
  }
  /* </copied> */
</script>

<style>
  .address-field {
    flex: 1 1 0;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 4px;
    row-gap: 2px;
    min-height: 30px;
    padding: 1px 0;
    cursor: text;
  }
  .recipient {
    align-items: center;
    max-width: 100%;
    cursor: default;
    border-radius: 2px;
  }
  .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .address-field:not(.chips) .name {
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: var(--lo-fg-secondary);
  }
  .address-field:not(.chips) .recipient.selected .name {
    background-color: var(--lo-selected-bg);
  }
  .chips .recipient {
    gap: 6px;
    height: 24px;
    padding: 0 2px 0 2px;
    border-radius: 12px;
    background-color: var(--lo-pane-alt-bg);
    border: 1px solid var(--lo-border);
  }
  .chips .recipient:hover {
    background-color: var(--lo-hover-bg);
  }
  .chips .recipient.selected {
    background-color: var(--lo-selected-bg);
    border-color: var(--lo-accent);
  }
  .remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--lo-fg-secondary);
  }
  .remove:hover {
    background-color: var(--lo-pressed-bg);
    color: var(--lo-fg);
  }
  .typed {
    flex: 1 1 80px;
    min-width: 80px;
    height: 26px;
    padding: 0 2px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--lo-fg);
    font: inherit;
  }
</style>
