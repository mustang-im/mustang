<vbox class="contact-picture" style:width="{size}px" style:height="{size}px">
  {#if picture && !isBroken}
    <img
      src={picture}
      width={size} height={size}
      alt=""
      on:error={() => isBroken = true}
      />
  {:else}
    <hbox class="initials"
      style:background-color={color}
      style:font-size="{Math.round(size * 0.4)}px">
      {#if isGroup}
        <GroupIcon size={Math.round(size * 0.5)} />
      {:else if initials}
        {initials}
      {:else}
        <PersonIcon size={Math.round(size * 0.5)} />
      {/if}
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { PersonOrGroup } from "../../frontend/Contacts/Person/PersonOrGroup";
  import { Group } from "../../logic/Abstract/Group";
  import { consistentColor } from "../../logic/Abstract/personColor";
  import { Initials } from "./Initials";
  import GroupIcon from "lucide-svelte/icons/users-round";
  import PersonIcon from "lucide-svelte/icons/user-round";

  export let contact: PersonOrGroup;
  export let size = 40;

  let isBroken = false;
  $: picture = $contact?.picture;
  $: picture, isBroken = false;
  $: name = $contact?.name;
  $: isGroup = contact instanceof Group;
  $: initials = Initials.of(name);
  $: color = name ? consistentColor(name) : null;
</script>

<style>
  .contact-picture {
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
  }
  img {
    object-fit: cover;
  }
  .initials {
    flex: 1;
    align-items: center;
    justify-content: center;
    background-color: var(--lo-fg-secondary);
    color: #FFFFFF;
    font-weight: 600;
    line-height: 1;
    user-select: none;
  }
</style>
