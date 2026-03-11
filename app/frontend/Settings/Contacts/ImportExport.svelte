<vbox flex />
<vbox class="settings">
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
  import { convertVCardsToPersons, personsToVCardFile } from "../../../logic/Contacts/VCard/VCard";
  import FileSelector from "../../Mail/Composer/Attachments/FileSelector.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import Button from "../../Shared/Button.svelte";
  import { saveBlobAsFile } from "../../Util/util";
  import { t } from "../../../l10n/l10n";

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

  async function exportVCard() {
    let file = personsToVCardFile(account.persons, account.name);
    await saveBlobAsFile(file);
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
