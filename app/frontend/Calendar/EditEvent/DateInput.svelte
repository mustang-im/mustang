<input type="date" required min={toHTMLString(min)} nax={toHTMLString(max)} bind:value on:change={onChange} on:change />

<script lang="ts">
  export let date: Date = new Date();
  export let min: Date | null = null;
  export let max: Date | null = null;
  let value, minstr, maxstr;

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
    date.setFullYear(fullYear, month - 1, day);
    date = date;
  }
</script>

<style>
  input {
    border-top: none;
    border-left: none;
    border-right: none;
  }
</style>
