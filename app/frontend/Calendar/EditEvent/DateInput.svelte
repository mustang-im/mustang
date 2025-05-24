<input type="date"
  required
  min={toHTMLString(min)} max={toHTMLString(max)}
  bind:value
  on:change={onChange}
  on:change
  {disabled}
  />

<script lang="ts">
  export let date: Date;
  export let min: Date | null = null;
  export let max: Date | null = null;
  export let disabled = false;
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

  function onChange() {
    let [fullYear, month, day] = value.split("-");
    date.setFullYear(parseInt(fullYear), parseInt(month) - 1, parseInt(day) - deltaInDays);
    date = new Date(date);
  }
</script>

<style>
</style>
