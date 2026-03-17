<Header
  title={$t`Select addressbooks`}
  subtitle={$t`Select the addressbooks that you want to use`}
/>
{#await load()}
  <hbox class="loading">
    <Spinner size="24px" />
    <hbox class="label">{$t`Checking for your addressbooks…`}</hbox>
  </hbox>
{:then}
  <grid flex>
    {#each available.each as addressbook, i}
      <label>
        <input type="checkbox"
          checked={$selected.contains(addressbook)}
          on:change={() => onChange(addressbook)}
          value={addressbook}>
        {sanitize.nonemptylabel(addressbook.displayName, i)}
      </label>
      <label>
        {#if primary}
          <input type="radio" bind:group={primary} value={addressbook}>
          {#if primary == addressbook}
            {$t`Primary`}
          {/if}
        {/if}
      </label>
    {/each}
  </grid>
{:catch ex}
  {ex?.message ?? ex + ""}
{/await}

<ErrorMessageInline bind:this={errorUI} />

<ButtonsBottom
  onContinue={() => catchErrors(onContinue, errorUI.showError)}
  canContinue={!!primary}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import { CardDAVAddressbook } from "../../../logic/Contacts/CardDAV/CardDAVAddressbook";
  import { newAddressbookForProtocol } from "../../../logic/Contacts/AccountsList/Addressbooks";
  import { appGlobal } from "../../../logic/app";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import Spinner from "../../Shared/Spinner.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";
  import { Collection, SetColl } from "svelte-collections";
  import type { DAVAddressBook } from "tsdav";

  /** in/out */
  export let config: CardDAVAddressbook;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let available: Collection<DAVAddressBook>;
  let primary: DAVAddressBook;
  let errorUI: ErrorMessageInline;

  let selected = new SetColl<DAVAddressBook>();
  function onChange(account: DAVAddressBook) {
    // Toggle
    if (selected.contains(account)) {
      selected.remove(account);
    } else {
      selected.add(account);
    }
    // Set primary
    if (!selected.contains(primary)) {
      primary = selected.first;
    }
  }

  async function load() {
    available = await config.listAddressbooks();
    assert(available.hasItems, gt`No addressbooks found in this account`);
    if (available.length == 1) {
      selected.add(available.first);
      primary = available.first;
      await onContinue();
    }
  }

  async function onContinue() {
    errorUI.clearError();
    assert(primary, "Need selection");
    config.addressbookURL = sanitize.url(primary.url);
    await config.login(true);
    await config.listContacts(); // check whether it works
    appGlobal.addressbooks.add(config);
    await config.save();
    let i = 0;
    for (let additional of selected) {
      if (additional == primary) {
        continue;
      }
      let sub = newAddressbookForProtocol(config.protocol) as CardDAVAddressbook;
      sub.initFromMainAccount(config);
      sub.name = config.name + " " + sanitize.nonemptylabel(additional.displayName as string, "" + ++i);
      sub.addressbookURL = sanitize.url(additional.url);
      appGlobal.addressbooks.add(sub);
      await sub.save();
      sub.listContacts()
        .catch(errorUI.showError);
    }
    showPage = null;
  }
</script>

<style>
  .loading .label {
    margin-inline-start: 32px;
  }
  grid {
    grid-template-columns: 1fr auto;
  }
</style>
