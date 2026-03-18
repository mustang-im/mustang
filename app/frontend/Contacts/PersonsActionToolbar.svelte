{#if $selectedPersons?.length > 1}
  <hbox class="selection-toolbar buttons">
    <RoundButton
      label={$t`Move`}
      icon={MoveIcon}
      iconSize="12px" padding="4px" classes="small" border={false}
      onClick={onMove}
      />
    <RoundButton
      label={$t`Copy`}
      icon={CopyIcon}
      iconSize="12px" padding="4px" classes="small" border={false}
      onClick={onCopy}
      />
    <hbox class="target">
      <hbox class="label">{$t`to *=> move or copy to addressbook`}</hbox>
      <AccountDropDown
        bind:selectedAccount={targetAddressbook}
        accounts={appGlobal.addressbooks.filterObservable(ab => ab != selectedAddressbook)}
        showAllOption={false}
        filterByWorkspace={true}
        />
    </hbox>
    <RoundButton
      label={$t`Delete`}
      icon={DeleteIcon}
      iconSize="12px" padding="4px" classes="small" border={false}
      onClick={onDelete}
      />
  </hbox>
{/if}

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import type { PersonOrGroup } from "./Person/PersonOrGroup";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../logic/app";
  import AccountDropDown from "../Shared/AccountDropDown.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyIcon from "lucide-svelte/icons/copy";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { assert } from "../../logic/util/util";
  import { ArrayColl } from "svelte-collections";
  import { gt, t } from "../../l10n/l10n";

   /** in/out */
  export let selectedAddressbook: Addressbook;
  /** in */
  export let selectedPersons: ArrayColl<PersonOrGroup>;

  let targetAddressbook: Addressbook;

  async function onMove() {
    let promises = new ArrayColl<Promise<void>>();
    for (let person of selectedPersons) {
      if (person instanceof Person) {
        promises.add(
          person.moveToAddressbook(targetAddressbook));
      }
    }
    await Promise.all(promises);
  }

  async function onCopy() {
    let promises = new ArrayColl<Promise<void>>();
    for (let person of selectedPersons) {
      if (person instanceof Person) {
        if (person.addressbook == targetAddressbook) {
          continue;
        }
        promises.add(
          person.copyToAddressbook(targetAddressbook));
      }
    }
    await Promise.all(promises);
  }

  async function onDelete() {
    assert(selectedPersons.hasItems, "Need contacts");
    if (!confirm(gt`WARNING:\nAre you sure that you want to delete ${selectedPersons.length} contacts?`)) {
      return;
    }
    let promises = new ArrayColl<Promise<void>>();
    for (let person of selectedPersons) {
      if (person instanceof Person) {
        promises.add(
          person.deleteIt());
      }
    }
    await Promise.all(promises);
  }
</script>

<style>
  .selection-toolbar {
    margin: -10px 12px 10px 16px;
  }
  .buttons {
    align-items: end;
  }
  .buttons :global(.button) {
    margin-left: 6px;
  }
  .buttons :global(.button.disabled) {
    opacity: 10%;
  }
  .target {
    margin-inline: 12px;
  }
  .target .label {
    margin-inline-end: 4px;
  }
</style>
