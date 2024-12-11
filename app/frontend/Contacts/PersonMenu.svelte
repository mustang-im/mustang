<Menu position="bottom" placement="end">
  <hbox class="button" slot="control">
    <DotsIcon size={16} />
  </hbox>
  <Menu.Item
    on:click={() => catchErrors(() => save())}
    title={$t`Save`}
    icon={SaveIcon}>
    {$t`Save`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => deleteIt())}
    title={$t`Delete`}
    icon={DeleteIcon}>
    {$t`Delete this contact`}
  </Menu.Item>
</Menu>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "../Shared/Person/Selected";
  import { appGlobal } from "../../logic/app";
  import DotsIcon from "lucide-svelte/icons/ellipsis";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { Menu } from "@svelteuidev/core";
  import { catchErrors } from "../Util/error";
  import { t } from "../../l10n/l10n";

  export let person: Person;

  async function save() {
    if (!person.addressbook) {
      person.addressbook = appGlobal.personalAddressbook;
      person.addressbook.persons.add(person);
    }
    await person.saveToServer();
    await person.save();
  }
  async function deleteIt() {
    await person.deleteFromServer();
    await person.deleteIt();

    if (person == $selectedPerson) {
      let addressbook = person.addressbook;
      let posInAddressbook = addressbook.persons.indexOf(person);
      let next = addressbook.persons.getIndex(posInAddressbook)
        ?? addressbook.persons.first;
      $selectedPerson = next;
    }
  }
</script>
