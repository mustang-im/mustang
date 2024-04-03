<hbox class="persons-toolbar">
  <AccountDropDown bind:selectedAccount accounts={appGlobal.chatAccounts} />
  <hbox flex />
  <hbox class="buttons">
    <RoundButton label="New contact" icon={NewContactIcon} iconSize="22px" padding="9px" classes="large create" on:click={addPerson} />
  </hbox>
</hbox>

<script lang="ts">
  import { ChatPerson } from "../../logic/Chat/Person";
  import type { Person } from "../../logic/Abstract/Person";
  import type { ChatAccount } from "../../logic/Chat/ChatAccount";
  import { selectedPerson } from "../Shared/Person/PersonOrGroup";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import NewContactIcon from "lucide-svelte/icons/plus";
  import type { Collection } from "svelte-collections";

  export let persons: Collection<Person>;

  let selectedAccount: ChatAccount; // TODO contacts account, and email and chat accounts, or all

  function addPerson() {
    let person = new ChatPerson();
    person.name = "New person";
    persons.add(person);
    $selectedPerson = person;
  }
</script>

<style>
  .persons-toolbar {
    margin: 10px 12px 10px 16px;
    align-items: center;
  }
</style>
