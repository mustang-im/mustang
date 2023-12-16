{#if person?.picture}
  <vbox class="avatar image">
    <img
      src={person.picture}
      width={size} height={size}
      title="Picture of {person.name}"
      alt=""
      />
  </vbox>
{:else}
  <vbox class="avatar dummy" style="width: {size}px; height: {size}px;" />
{/if}

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";

  export let person: PersonOrGroup;
  export let size = 56;
</script>

<style>
  .avatar {
    margin: 7px 12px;
  }
  .image {
    clip-path: circle();
  }
</style>
