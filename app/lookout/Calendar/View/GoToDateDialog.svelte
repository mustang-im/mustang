<dialog class="go-to-date lo-card" bind:this={dialogEl} on:close={() => isOpen = false}>
  <form method="dialog" on:submit|preventDefault={onOK}>
    <h2>{$t`Go To Date`}</h2>
    <label class="field">
      <span class="label">{$t`Date`}</span>
      <input type="date" required bind:value={dateValue} />
    </label>
    <label class="field">
      <span class="label">{$t`Show in`}</span>
      <select bind:value={view}>
        <option value="day">{$t`Day Calendar`}</option>
        <option value="workweek">{$t`Work Week Calendar`}</option>
        <option value="week">{$t`Week Calendar`}</option>
        <option value="month">{$t`Month Calendar`}</option>
      </select>
    </label>
    <hbox class="buttons">
      <button type="submit" class="primary">{$t`OK`}</button>
      <button type="button" on:click={() => dialogEl.close()}>{$t`Cancel`}</button>
    </hbox>
  </form>
</dialog>

<script lang="ts">
  import type { CalendarViewType } from "../CalendarSettings";
  import { t } from "../../../l10n/l10n";

  export let onGoTo: (date: Date, view: CalendarViewType) => void;

  let dialogEl: HTMLDialogElement;
  let isOpen = false;
  let dateValue = "";
  let view: CalendarViewType = "day";

  export function open(currentDate: Date, currentView: CalendarViewType) {
    if (isOpen) {
      return;
    }
    dateValue = [
      currentDate.getFullYear(),
      String(currentDate.getMonth() + 1).padStart(2, "0"),
      String(currentDate.getDate()).padStart(2, "0"),
    ].join("-");
    view = currentView;
    isOpen = true;
    dialogEl.showModal();
  }

  function onOK() {
    let [ year, month, day ] = dateValue.split("-").map(part => parseInt(part));
    if (!year || !month || !day) {
      return;
    }
    dialogEl.close();
    onGoTo(new Date(year, month - 1, day), view);
  }
</script>

<style>
  .go-to-date {
    width: 320px;
    padding: 20px 24px;
    border: none;
    box-shadow: var(--lo-shadow-popup);
    color: var(--lo-fg);
  }
  .go-to-date::backdrop {
    background-color: rgba(0, 0, 0, 0.25);
  }
  h2 {
    margin: 0 0 16px 0;
    font-size: var(--lo-font-size-large);
    font-weight: 600;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-block-end: 12px;
  }
  .label {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  input,
  select {
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
  .buttons {
    justify-content: flex-end;
    gap: 8px;
    margin-block-start: 20px;
  }
  .buttons button {
    min-width: 80px;
    height: 32px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .buttons button:hover {
    background-color: var(--lo-hover-bg);
  }
  .buttons button.primary {
    border-color: var(--lo-accent);
    background-color: var(--lo-accent);
    color: var(--lo-accent-fg);
  }
  .buttons button.primary:hover {
    background-color: var(--lo-accent-hover);
  }
</style>
