<hbox flex class="person-autocomplete" bind:this={topEl}>
  <Autocomplete
    onChange={onAddPerson}
    searchFunction={search}
    delay={100}
    minCharactersToSearch={2}
    localFiltering={false}
    localSorting={false}
    closeOnBlur={false}
    hideArrow={true}
    noResultsText="No person found"
    bind:text={typedText}
    create={canCreate(typedText)}
    createText={"Add this person"}
    onCreate={(text) => catchErrors(() => onCreate(text))}
    {placeholder}
    >
    <hbox slot="loading">Loading...</hbox>
    <svelte:fragment slot="item" let:item={person}>
      <PersonAutocompleteResult {person}>
        <slot name="result-bottom-row" slot="bottom-row" {person} />
      </PersonAutocompleteResult>
    </svelte:fragment>
  </Autocomplete>
</hbox>

<script lang="ts">
  import { Person, ContactEntry } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import PersonAutocompleteResult from "./PersonAutocompleteResult.svelte";
  import { ArrayColl, type Collection } from "svelte-collections";
  // <https://github.com/pstanoev/simple-svelte-autocomplete>
  // <http://simple-svelte-autocomplete.surge.sh>
  import Autocomplete from 'simple-svelte-autocomplete';
  import { createEventDispatcher, tick } from 'svelte';
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  const dispatchEvent = createEventDispatcher();

  export let skipPersons: Collection<Person> = new ArrayColl<Person>();
  export let placeholder = "Add person";

  export async function search(inputStr: string): Promise<Person[]> {
    try {
      if (inputStr.length < 2) {
        return [];
      }
      inputStr = inputStr.toLowerCase();
      let results = appGlobal.persons
        .filter(person => person.name.toLowerCase().includes(inputStr) &&
          !skipPersons.contains(person));
      console.log("Got", results.length, "results for", inputStr);
      return results.contents;
    } catch (ex) {
      console.error(ex);
      alert(ex.message);
      //inputE.setCustomValidity(ex.message ?? ex + "");
      //inputE.reportValidity();
    }
  }

  let topEl: HTMLDivElement;
  async function onAddPerson(person: Person) {
    typedText = "";
    dispatchEvent('personSelected', person);

    // Clear, to allow user to enter the next person
    await tick();
    // Hack, because component doesn't allow me to clear the text field value
    if (topEl) {
      topEl.querySelector("input").value = "";
    }
  }

  function onCreate(text: string) {
    // email address is substring, e.g. "Fred <fred@example.com>"
    assert(kEMailAddressRegexp.test(text), "Need email address");

    // Parse typed text into name and email address
    text = text.trim();
    let name = text;
    let emailAddress = text;
    if (text.includes("<") && text.includes(">")) {
      let startBracket = text.indexOf("<");
      name = text.substring(0, startBracket - 1).trimEnd();
      let endBracket = text.indexOf(">");
      emailAddress = text.substring(startBracket + 1, endBracket);
      // email address is entire string
      assert(kEMailAddressRegexp.test(emailAddress), "Need email address");
    }

    let person = new Person(appGlobal.collectedAddressbook);
    person.name = name;
    person.emailAddresses.add(new ContactEntry(emailAddress, "mail"));
    appGlobal.persons.add(person);
    onAddPerson(person);
    return person;
  }

  let typedText: string;
  const kEMailAddressRegexp = /[a-zA-Z0-9]+@[a-zA-Z0-9\-\.]+\.[a-zA-Z0-9\-]+/;
  function canCreate(typedText: string) {
    // email address is substring, e.g. "Fred <fred@example.com>"
    return typedText && kEMailAddressRegexp.test(typedText);
  }
</script>

<style>
.person-autocomplete {
  height: 24px;
  margin-bottom: -1px;
}

.person-autocomplete :global(.autocomplete) {
  height: 100% !important;
}
.person-autocomplete :global(.input-container) {
  height: 100%;
}
.person-autocomplete :global(input) {
  padding: 0px 12px !important;
  background-color: #FCFCFF;
  box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 3%);
  border-radius: 100px;
  align-items: center;
}
.person-autocomplete :global(input::placeholder) {
  color: #7D7886;
}
.person-autocomplete :global(.autocomplete-list) {
  padding: 0px !important;
}

.person-autocomplete :global(.mdc-deprecated-list-item--activated) {
  border: 1px solid red;
  background-color: green;
}
</style>
