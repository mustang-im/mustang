<Menu opened={true}>
  <hbox class="button" slot="cosntrol" />
  <Menu.Item
    on:click={() => catchErrors(() => onRemove())}
    title="Remove this person from the list of recipients"
    icon={RemoveIcon}>
    Remove
  </Menu.Item>
</Menu>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { Menu } from "@svelteuidev/core";
  import RemoveIcon from "lucide-svelte/icons/x";
  import { catchErrors } from "../../Util/error";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let person: Person;

  function onRemove() {
    dispatch("remove", person);
  }
</script>

<style>
  .button {
    display: none;
  }
</style>
