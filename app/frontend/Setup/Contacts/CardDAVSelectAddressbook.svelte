<Header
  title={$t`Select the addressbook you want to use`}
  subtitle=""
/>
{#await load()}
  <hbox class="loading">
    <Spinner size="24px" />
    <hbox class="label">{$t`Checking for your addressbooks…`}</hbox>
  </hbox>
{:then}
  <vbox flex class="calendar">
    {#each addressbooks.each as addressbook}
      <label>
        <input type="radio" bind:group={selectedAddressbook} value={addressbook}>
        {addressbook.displayName}
      </label>
    {/each}
  </vbox>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}

<ButtonsBottom
  onContinue={onContinue}
  canContinue={!!config.name}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { CardDAVAddressbook } from "../../../logic/Contacts/CardDAV/CardDAVAddressbook";
  import { appGlobal } from "../../../logic/app";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import Spinner from "../../Shared/Spinner.svelte";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";
  import { Collection } from "svelte-collections";
  import type { DAVAddressBook } from "tsdav";

  /** in/out */
  export let config: CardDAVAddressbook;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let addressbooks: Collection<DAVAddressBook>;
  let selectedAddressbook: DAVAddressBook;

  async function load() {
    addressbooks = await config.listAddressbooks();
    assert(addressbooks.hasItems, gt`No addressbooks found in this account`);
    if (addressbooks.length == 1) {
      selectedAddressbook = addressbooks.first;
      await onContinue();
    }
  }

  async function onContinue() {
    config.addressbookURL = selectedAddressbook.url;
    await config.listContacts();
    appGlobal.addressbooks.add(config);
    await config.save();
    showPage = null;
  }
</script>

<style>
  .loading .label {
    margin-inline-start: 32px;
  }
</style>
