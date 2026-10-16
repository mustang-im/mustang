<RibbonTextBox label={$t`Search People`} placeholder={$t`Search People`} icon={PersonIcon}
  bind:value bind:isListOpen width="180px"
  onInput={onTyped} onEnter={onEnter}>
  <svelte:fragment slot="list">
    {#each matches as contact (contact.id)}
      <MenuItem label={contact.name} tooltip={ContactColumns.value(ContactColumn.EMail, contact)}
        icon={contact instanceof Group ? GroupIcon : PersonIcon}
        onClick={() => choose(contact)} />
    {:else}
      <MenuItem label={value.trim() ? $t`No matches` : $t`Type a name`} disabled />
    {/each}
  </svelte:fragment>
</RibbonTextBox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Group } from "../../logic/Abstract/Group";
  import { appGlobal } from "../../logic/app";
  import { ContactSearch } from "./ContactSearch";
  import { ContactColumn, ContactColumns } from "./Views/ContactColumns";
  import { LetterIndex } from "./LetterIndex";
  import RibbonTextBox from "../Shared/Ribbon/RibbonTextBox.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import PersonIcon from "lucide-svelte/icons/user-round";
  import GroupIcon from "lucide-svelte/icons/users-round";
  import { t } from "../../l10n/l10n";

  export let onChoose: (contact: Contact) => void;

  let value = "";
  let isListOpen = false;
  let matches: Contact[] = [];

  function onTyped(typed: string) {
    const kMaxMatches = 12;
    let term = typed.trim();
    matches = term.length >= 2
      ? ContactSearch.search(appGlobal.addressbooks.contents, term).contents
        .sort(LetterIndex.compareByName)
        .slice(0, kMaxMatches)
      : [];
    isListOpen = matches.length > 0;
  }

  function onEnter() {
    if (matches.length) {
      choose(matches[0]);
    }
  }

  function choose(contact: Contact) {
    isListOpen = false;
    value = "";
    matches = [];
    onChoose(contact);
  }
</script>
