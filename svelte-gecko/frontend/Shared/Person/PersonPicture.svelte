{#if person?.picture}
  <vbox class="image">
    <img
    src={person.picture}
    width={size} height={size}
    title="Picture of {person.name}"
    alt="" />
  </vbox>
{/if}

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";

  export let person: PersonOrGroup;
  export let size = 56;
</script>

<style>
  .image {
    margin: 7px 12px;
    clip-path: circle();
  }
</style>
