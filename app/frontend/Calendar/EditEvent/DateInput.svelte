<input type="date"
  required
  min={toHTMLString(min)} max={toHTMLString(max)}
  bind:value
  on:change={onChangeEvent}
  on:blur={onChange}
  on:keydown={() => isUsingKeyboard = true}
  on:mousedown={() => isUsingKeyboard = false}
  on:pointerdown={() => isUsingKeyboard = false}
  {disabled}
  />

<script lang="ts">
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ change: Date }>();

  export let date: Date;
  export let min: Date | null = null;
  export let max: Date | null = null;
  export let disabled = false;
  /** true (default): automatically set `time` to the user-entered value
   * false: let caller handle updates by listen to the `change` event */
  export let changeTime = true;
  /** Show the date this many days later (positive) or earlier (negative)
   * than the `date` given. Works in both directions.
   * This is used for `allDay` events, which in iCal and on 0:00 the next day,
   * but we want to show the last day to the user, not the next day. */
  export let deltaInDays: number | null = null;

  let value: string;

  $: updateValue(date);
  function updateValue(date: Date) {
    let adjusted = new Date(date);
    adjusted.setDate(date.getDate() + deltaInDays);
    value = toHTMLString(adjusted);
  }

  function toHTMLString(date: Date | null) {
    if (!date) {
      return "";
    }
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  // <copied to="TimeInput.svelte">
  const onChangeDebounced = debounce(() => onChange(), 1000);
  let isUsingKeyboard = false;
  function onChangeEvent() {
    if (isUsingKeyboard) {
      onChangeDebounced();
    } else {
      onChange();
    }
  }
  // </copied>

  function onChange() {
    if (!value) {
      return;
    }
    let [ fullYearStr, monthStr, dayStr ] = value.split("-");
    let year = parseInt(fullYearStr);
    let month = parseInt(monthStr) - 1;
    let day = parseInt(dayStr) - deltaInDays;

    if (changeTime) {
      date.setFullYear(year, month, day);
      date = new Date(date);
      dispatchEvent("change", date);
    } else {
      let newDate = new Date(date);
      newDate.setFullYear(year, month, day);
      dispatchEvent("change", newDate);
    }
  }
</script>

<style>
</style>
