<!-- Svelte's bind:group only works for literal <input type=radio>
 https://github.com/sveltejs/svelte/issues/2308 -->
<radiogroup class:vertical>
  {#each items as item, i}
    <hbox>
      <input type="radio"
        value={item.value}
        checked={item.value === group}
        on:change={() => group = item.value}
        on:change
        {disabled}
        id={"radio" + i}
        />
      <label for={"radio" + i}>{item.label}</label>
    </hbox>
  {/each}
</radiogroup>

<script lang="ts">
  export let items: RadioOption[] = [];
  export let group: any;
  export let disabled = false;
  export let vertical = false;
</script>
<script lang="ts" context="module">
  export type RadioOption = {label: string, value: any, disabled?: boolean};
</script>

<style>
  radiogroup {
    display: flex;
    flex-direction: row;
  }
  radiogroup.vertical {
    flex-direction: column;
  }
</style>
