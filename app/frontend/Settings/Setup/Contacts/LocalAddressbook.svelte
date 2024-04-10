<Header
  title="Create your new local addressbook"
  subtitle=""
/>
<vbox flex class="account">
  <grid>
    <label for="name">Name of the addressbook</label>
    <input type="text" bind:value={config.name} name="name"
      placeholder="Private" />
  </grid>
</vbox>

<ButtonsBottom
  on:continue={() => catchErrors(onContinue)}
  canContinue={!!config.name}
  canCancel={true}
  on:cancel
  />

<script lang="ts">
  import type { Addressbook } from "../../../../logic/Contacts/Addressbook";
  import { SQLAddressbook } from "../../../../logic/Contacts/SQL/SQLAddressbook";
  import { appGlobal } from "../../../../logic/app";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Header from "../Header.svelte";
  import { catchErrors } from "../../../Util/error";

  /** in/out */
  export let config: Addressbook;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;

  async function onContinue() {
    await SQLAddressbook.save(config);
    appGlobal.addressbooks.add(config);
    showPage = null;
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    align-items: center;
    margin: 32px;
    gap: 8px 24px;
  }
</style>
