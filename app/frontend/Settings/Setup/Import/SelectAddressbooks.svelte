<Header
  title={$t`Import address books`}
  subtitle={$t`Import your contacts from Thunderbird`} />

{#await startImport()}
  <StatusMessage status="processing"
    message={$t`Importing address books...`} />
{:then}
  <hbox class="found">{$t`Found ${addressbooks.length} imported addressbooks`}</hbox>
  <vbox class="list">
    <Scroll>
      <grid class="protocol-grid">
        {#each $addressbooks.each as addressbook}
          <Checkbox label={addressbook.name} bind:checked={addressbook.import} />
          <hbox class="protocol">Thunderbird</hbox>
        {/each}
      </grid>
    </Scroll>
  </vbox>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}
<ButtonsBottom
  canContinue={!!addressbooks.length}
  onContinue={onOK}
  >
  <Button label={$t`Skip`} classes="secondary"
    onClick={onSkip}
    />
  <Button label={$t`Uncheck all`} classes="secondary"
    onClick={onUncheckAll}
    />
</ButtonsBottom>

<script lang="ts">
  import { ThunderbirdProfile } from "../../../../logic/Mail/Import/Thunderbird/TBProfile";
  import type { Addressbook } from "../../../../logic/Contacts/Addressbook";
  import StatusMessage from "../Shared/StatusMessage.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Checkbox from "../../../Shared/Checkbox.svelte";
  import Button from "../../../Shared/Button.svelte";
  import Header from "../Shared/Header.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import { t } from "../../../../l10n/l10n";
  import { ThunderbirdAddressbook } from "../../../../logic/Mail/Import/Thunderbird/TBAddressbook";
  import { ArrayColl } from "svelte-collections";
  import { appGlobal } from "../../../../logic/app";
  import { SQLAddressbook } from "../../../../logic/Contacts/SQL/SQLAddressbook";

  export let addressbooks = new ArrayColl<Addressbook>();
  export let onContinue = () => undefined;

  async function startImport() {
    let profiles = await ThunderbirdProfile.findProfiles();
    if (profiles.length) {
      for (let profile of profiles.filter(p => p.name && !p.name.toLowerCase().includes("test"))) {
        try {
          let abs = await ThunderbirdAddressbook.readAll(profile);
          addressbooks.addAll(abs);
        } catch (ex) {
          console.log(ex?.message);
        }
      }
    }

    for (let account of addressbooks) {
      (account as any).import = true;
    }

    //console.log("Found Thunderbird addressbooks", addressbooks.contents.map(ab => ab.name));
    if (!addressbooks.length) {
      onContinue();
      return;
    }
  }

  function onUncheckAll() {
    for (let addressbook of addressbooks) {
      (addressbook as any).import = false;
    }
    addressbooks = addressbooks;
  }

  function onSkip() {
    onUncheckAll();
    onContinue();
  }

  async function onOK() {
    for (let addressbook of addressbooks) {
      if (!(addressbook as any).import) {
        continue;
      }
      await SQLAddressbook.save(addressbook);
      appGlobal.addressbooks.add(addressbook);
    }
    onContinue();
  }
</script>

<style>
  .found {
    justify-content: center;
    margin-block-end: 24px;
  }
  .list {
    min-height: 30vh;
  }
  grid.protocol-grid {
    grid-template-columns: auto max-content;
    margin: 4px 12px;
  }
  .protocol {
    margin-inline-start: 16px;
  }
</style>
