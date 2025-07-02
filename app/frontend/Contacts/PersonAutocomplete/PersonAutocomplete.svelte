<hbox flex class="person-autocomplete" bind:this={topEl}>
  <Autocomplete
    onChange={person => catchErrors(() => onAddPerson(person))}
    searchFunction={search}
    delay={100}
    minCharactersToSearch={2}
    localFiltering={false}
    localSorting={false}
    closeOnBlur={false}
    hideArrow={true}
    noResultsText={$t`No person found`}
    bind:text={typedText}
    create={() => catchErrors(() => canCreate(typedText))}
    createText={sanitize.emailAddress(typedText, "")
      ? $t`Add this person (Press ENTER)`
      : $t`Enter a person from your address book, or an email address`}
    onCreate={(text) => catchErrors(() => onCreate(text))}
    {placeholder}
    {autofocus}
    tabIndex={tabindex}
    >
    <hbox slot="loading">{$t`Loading...`}</hbox>
    <svelte:fragment slot="item" let:item={person}>
      <PersonAutocompleteResult {person}>
        <slot name="result-bottom-row" slot="bottom-row" {person} />
      </PersonAutocompleteResult>
    </svelte:fragment>
  </Autocomplete>
</hbox>

<script lang="ts">
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import PersonAutocompleteResult from "./PersonAutocompleteResult.svelte";
  import { ArrayColl, type Collection } from "svelte-collections";
  // <https://github.com/pstanoev/simple-svelte-autocomplete>
  // <http://simple-svelte-autocomplete.surge.sh>
  import Autocomplete from 'simple-svelte-autocomplete';
  import { createEventDispatcher, tick } from 'svelte';
  import { catchErrors, showError } from "../../Util/error";
  import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  const dispatch = createEventDispatcher<{ addPerson: PersonUID }>();

  export let skipPersons: Collection<PersonUID> = new ArrayColl<PersonUID>();
  export let placeholder = $t`Add person`;
  export let tabindex = null;
  export let autofocus = false;
  export let typedText: string = ""; /* in/out */

  export async function search(inputStr: string): Promise<PersonUID[]> {
    if (!inputStr || inputStr.length < 2) {
      return [];
    }
    try {
      inputStr = inputStr.toLowerCase();
      let persons: Person[] = [];
      for (let ab of appGlobal.addressbooks) {
        persons.push(...ab.persons.filter(person => person.name?.toLowerCase().includes(inputStr)));
      }
      let emailAddresses: PersonUID[] = [];
      for (let person of persons) {
        for (let c of person.emailAddresses.sortBy(c => c.preference)) {
          if (skipPersons.find(p => p.emailAddress == c.value)) {
            continue;
          }
          let uid = new PersonUID(c.value, person.name);
          uid.person = person;
          emailAddresses.push(uid);
        }
      }
      console.log("Got", persons.length, "persons with ", emailAddresses.length, "email addresses for", inputStr);
      return emailAddresses;
    } catch (ex) {
      showError(ex);
    }
  }

  let topEl: HTMLDivElement;
  $: inputEl = topEl?.querySelector("input");
  async function onAddPerson(person: PersonUID) {
    if (!person) {
      return;
    }
    typedText = "";
    (person as any).openPopup = person.name == person.emailAddress;
    dispatch('addPerson', person);

    // Clear, to allow user to enter the next person
    await tick();
    // Hack, because component doesn't allow me to clear the text field value
    if (inputEl) {
      inputEl.value = "";
    }
  }

  function onCreate(text: string): PersonUID {
    // email address is substring, e.g. "Fred <fred@example.com>"
    assert(text.includes("@"), $t`Need email address`);

    // Parse typed text into name and email address
    text = text.trim();
    let name = text;
    let emailAddress = text;
    if (text.includes("<") && text.includes(">")) {
      let startBracket = text.indexOf("<");
      name = text.substring(0, startBracket - 1).trimEnd();
      let endBracket = text.indexOf(">");
      emailAddress = text.substring(startBracket + 1, endBracket);
    }
    sanitize.emailAddress(emailAddress);

    let personUID = new PersonUID(emailAddress, name);
    onAddPerson(personUID);
    return personUID;
  }

  function canCreate(typedText: string) {
    // email address is substring, e.g. "Fred <fred@example.com>"
    return typedText && sanitize.emailAddress(typedText, "");
  }

  export function focus() {
    inputEl?.focus();
  }
</script>

<style>
.person-autocomplete {
  height: 24px;
  margin-block-end: -1px;
}

.person-autocomplete :global(.autocomplete) {
  height: 100% !important;
}
.person-autocomplete :global(.input-container) {
  height: 100%;
}
.person-autocomplete :global(input) {
  background-color: var(--main-bg);
  color: var(--main-fg);
  padding: 0px 12px !important;
  box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 3%);
  border-radius: 100px;
  align-items: center;
}
.person-autocomplete :global(input::placeholder) {
  color: #7D7886;
}
.person-autocomplete :global(.autocomplete-list) {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
.person-autocomplete :global(.autocomplete-list-item-create) {
  opacity: 50%;
  font-size: 14px;
}
.person-autocomplete :global(.mdc-deprecated-list-item--activated) {
  border: 1px solid red;
  background-color: green;
}
</style>
