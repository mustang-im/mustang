<Menu position="bottom" placement="end">
  <hbox class="button" slot="control">
    <DotsIcon size={16} />
  </hbox>
  <Menu.Item
    on:click={() => catchErrors(() => save())}
    title="Save"
    icon={SaveIcon}>
    Save
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => deleteIt())}
    title="Delete"
    icon={DeleteIcon}>
    Delete this contact
  </Menu.Item>
</Menu>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { Menu } from "@svelteuidev/core";
  import DotsIcon from "lucide-svelte/icons/ellipsis";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { catchErrors } from "../Util/error";
  import { appGlobal } from "../../logic/app";

  export let person: Person;

  async function save() {
    if (!person.addressbook) {
      person.addressbook = appGlobal.personalAddressbook;
      person.addressbook.persons.add(person);
    }
    await person.save();
  }
  async function deleteIt() {
    await person.deleteIt();
  }
</script>
