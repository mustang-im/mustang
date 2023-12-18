<vbox class="avatar" style="width: {size}px; height: {size}px;">
  {#if person?.picture}
    <img
      src={person.picture}
      width={size} height={size}
      title="Picture of {person.name}"
      alt=""
      />
  {/if}
</vbox>

<script lang="ts">
  import type { PersonOrGroup } from "./PersonOrGroup";

  export let person: PersonOrGroup;
  export let size = 48;
</script>

<style>
  .avatar {
    margin: 7px 12px;
    clip-path: circle();
  }
</style>
