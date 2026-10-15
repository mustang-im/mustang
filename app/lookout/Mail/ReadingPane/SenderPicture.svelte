<vbox class="sender-picture" style:width="{size}px" style:height="{size}px" title={name}>
  {#if picture && !isBroken}
    <img src={picture} width={size} height={size} alt="" on:error={() => isBroken = true} />
  {:else}
    <hbox class="initials" style:background-color={color} style:font-size="{Math.round(size * 0.4)}px">
      {#if initials}
        {initials}
      {:else}
        <PersonIcon size={Math.round(size * 0.5)} />
      {/if}
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { consistentColor } from "../../../logic/Abstract/personColor";
  import { personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { Initials } from "../../Contacts/Initials";
  import PersonIcon from "lucide-svelte/icons/user-round";

  export let person: PersonUID;
  export let size = 40;

  let isBroken = false;
  $: contact = person?.findPerson();
  $: picture = contact?.picture;
  $: picture, isBroken = false;
  $: name = personDisplayName(person);
  $: initials = Initials.of(name);
  $: color = consistentColor(person?.emailAddress || name || "");
</script>

<style>
  .sender-picture {
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
