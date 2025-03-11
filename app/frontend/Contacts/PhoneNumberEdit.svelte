<input type="tel" bind:value={value} size={20} maxlength={20} autofocus={!value} />

<script lang="ts">
  export let value: string; /* in/out */
</script>

<style>
</style>
