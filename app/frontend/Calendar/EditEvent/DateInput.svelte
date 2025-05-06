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
  let value: string;

  $: updateValue(date);
  function updateValue(date: Date) {
    value = toHTMLString(date);
  }

  function toHTMLString(date: Date | null) {
    if (!date) {
      return "";
    }
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function onChange() {
    let [fullYear, month, day] = value.split("-");
    date.setFullYear(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
    date = new Date(date);
  }
</script>

<style>
</style>
