<hbox>
  {#each addressbooks.each as ab}
    <hbox class="addressbook" title={ab.name}>
      <RoundButton
        label={ab.name}
        selected={ab == selectedAddressbook}
        on:click={() => onSelect(ab)}
        icon={ab == appGlobal.collectedAddressbook
          ? CollectedIcon
          : AddressbookIcon}
      />
    </hbox>
  {/each}
</hbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../logic/app";
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import CollectedIcon from "lucide-svelte/icons/history";

  /** in */
  export let addressbooks: Collection<Addressbook>;
  /** in/out */
  export let selectedAddressbook: Addressbook;

  function onSelect(ab: Addressbook) {
    selectedAddressbook = ab;
  }
</script>

<style>
  .addressbook {
    margin-right: 6px;
  }
</style>
