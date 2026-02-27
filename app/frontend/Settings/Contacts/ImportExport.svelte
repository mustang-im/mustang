<vbox class="settings" flex>
  <HeaderGroupBox>
    <hbox slot="header">{$t`Import / Export`}</hbox>
    <hbox class="buttons">
      <Button
        label={$t`Import from vCard file…`}
        onClick={importVCard}
        />
      <Button
        label={$t`Export to vCard file…`}
        onClick={exportVCard}
        />
    </hbox>
  </HeaderGroupBox>
</vbox>

<FileSelector bind:this={importFileSelector} acceptFileTypes={["text/vcard"]} />

<script lang="ts">
  import { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { convertVCardsToPersons, personsToVCardFile, personToVCard } from "../../../logic/Contacts/VCard/VCard";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";
  import FileSelector from "../../Mail/Composer/Attachments/FileSelector.svelte";
  import { saveBlobAsFile } from "../../Util/util";

  export let account: Addressbook;

  let importFileSelector: FileSelector;
  async function importVCard() {
    let file = await importFileSelector.selectFile();
    if (!file) {
      return;
    }
    let fileContents = await file.text();
    let persons = convertVCardsToPersons(fileContents, () => account.newPerson());
    account.persons.addAll(persons);
    for (let person of persons) {
      await person.save();
    }
    await account.save();
  }

  function exportVCard() {
    let file = personsToVCardFile(account.persons, account.name);
    saveBlobAsFile(file);
  }
</script>

<style>
  .settings {
    align-items: start;
    justify-content: start;
  }
  .settings > :global(.group) {
    width: 100%;
  }
  .buttons {
    align-items: center;
    gap: 12px;
  }
</style>
