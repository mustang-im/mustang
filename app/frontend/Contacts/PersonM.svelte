<vbox flex class="pane">
  {#if person && person instanceof Person}
    <Scroll>
      <PersonDetails {person} />
    </Scroll>
  {/if}
</vbox>
<PersonBarM selectedAddressbook={person?.addressbook} />

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import PersonDetails from "./PersonDetails.svelte";
  import PersonBarM from "./PersonBarM.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let person: Person;
</script>

<style>
  .pane {
    background: url(../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    background-blend-mode: soft-light;
    color: var(--main-pattern-fg);
  }
</style>
