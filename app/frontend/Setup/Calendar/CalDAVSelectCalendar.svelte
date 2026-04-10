<Header
  title={$t`Select calendars`}
  subtitle={$t`Select the calendars that you want to use`}
/>
{#await load()}
  <hbox class="loading">
    <Spinner size="24px" />
    <hbox class="label">{$t`Checking for your calendars…`}</hbox>
  </hbox>
{:then}
  <grid flex>
    {#each available.each as calendar, i}
      <label>
        <input type="checkbox"
          checked={$selected.contains(calendar)}
          on:change={() => onChange(calendar)}
          value={calendar}>
        {sanitize.nonemptylabel(calendar.displayName, i)}
      </label>
      <label>
        {#if primary}
          <input type="radio" bind:group={primary} value={calendar}>
          {#if primary == calendar}
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
  import { CalDAVCalendar } from "../../../logic/Calendar/CalDAV/CalDAVCalendar";
  import { newCalendarForProtocol } from "../../../logic/Calendar/AccountsList/Calendars";
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
  import type { DAVCalendar } from "tsdav";

  /** in/out */
  export let config: CalDAVCalendar;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let available: Collection<DAVCalendar>;
  let primary: DAVCalendar;
  let errorUI: ErrorMessageInline;

  let selected = new SetColl<DAVCalendar>();
  function onChange(account: DAVCalendar) {
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
    available = await config.listCalendars();
    assert(available.hasItems, gt`No calendars found in this account`);
    if (available.length == 1) {
      selected.add(available.first);
      primary = available.first;
      await onContinue();
    }
  }

  async function onContinue() {
    errorUI.clearError();
    assert(primary, "Need selection");
    config.calendarURL = sanitize.url(primary.url);
    await config.login(true);
    await config.listEvents(); // check whether it works
    appGlobal.calendars.add(config);
    await config.save();
    let i = 0;
    for (let additional of selected) {
      if (additional == primary) {
        continue;
      }
      let sub = newCalendarForProtocol(config.protocol) as CalDAVCalendar;
      sub.initFromMainAccount(config);
      sub.name = config.name + " " + sanitize.nonemptylabel(additional.displayName as string, "" + ++i);
      sub.calendarURL = sanitize.url(additional.url);
      appGlobal.calendars.add(sub);
      await sub.save();
      sub.listEvents()
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
