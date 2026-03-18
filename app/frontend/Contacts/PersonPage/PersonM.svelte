<vbox flex class="person-page">
  {#if person && person instanceof Person}
    <Scroll>
      <NameBoxM {person} bind:isEditing={isEditing} />
      <ContactBoxes {person} bind:isEditing={isEditing} showExpanders={isEditing} />
    </Scroll>
  {/if}
</vbox>
{#if $appGlobal.isMobile}
  <PersonBarM {person} bind:isEditing />
{/if}

<script lang="ts">
  import { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import NameBoxM from "./NameBoxM.svelte";
  import ContactBoxes from "./ContactBoxes.svelte";
  import PersonBarM from "./PersonBarM.svelte";
  import Scroll from "../../Shared/Scroll.svelte";

  export let person: Person;

  let isEditing = false;
</script>

<style>
  .person-page {
    background: url(../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    background-blend-mode: soft-light;
    color: var(--main-pattern-fg);
    padding: 8px;
  }
  .person-page :global(input),
  .person-page :global(textarea) {
    font-size: 18px;
  }
</style>
