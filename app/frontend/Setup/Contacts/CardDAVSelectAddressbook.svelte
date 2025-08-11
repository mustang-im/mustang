<Header
  title={$t`Select the addressbooks you want to use`}
  subtitle=""
/>
{#await load()}
  <hbox class="loading">
    <Spinner size="24px" />
    <hbox class="label">{$t`Checking for your addressbooks…`}</hbox>
  </hbox>
{:then}
  <vbox flex class="calendar">
    {#each $addressbooks.each as addressbook}
      <label>
        <input type="checkbox" bind:checked={addressbook.enabled}>
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
  import { ArrayColl, Collection } from "svelte-collections";
  import type { DAVAddressBook } from "tsdav";

  /** in/out */
  export let config: CardDAVAddressbook;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;


  let addressbooks: ArrayColl<Card>;

  async function load() {
    addressbooks = await config.listAddressbooks(true);
    if (addressbooks.length == 1) {
      await onContinue();
    }
  }

  async function onContinue() {
    appGlobal.calendars.addAll(addressbooks.filterOnce(cal =>
      cal.enabled &&
      !confurlome(existing => existing.url == cal.url)));
    for (let calendar of addressbooks) {
      if (calendar.enabled) {
        calendar.listEvents()
          .catch(config.errorCallback);
      }
    }
    await config.save();
    showPage = null;
  }
</script>

<style>
  .loading .label {
    margin-inline-start: 32px;
  }
</style>
