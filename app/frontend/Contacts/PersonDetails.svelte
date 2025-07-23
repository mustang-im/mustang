<vbox flex class="person-page font-small">
  <NameBox {person} />

  <SplitterBidirectional initialSecondRatio={1} name="contact-history" {horizontal}>
    <Scroll hideHorizontalScrollbar={true} slot="first">
      <ContactBoxes {person} />
    </Scroll>
    <ContactHistory {person} slot="second" />
  </SplitterBidirectional>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import NameBox from "./NameBox.svelte";
  import ContactBoxes from "./ContactBoxes.svelte";
  import ContactHistory from "./History/ContactHistory.svelte";
  import SplitterBidirectional from "../Shared/SplitterBidirectional.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let person: Person;

  export let horizontal = false; // HACK TODO adapt to container size
</script>

<style>
  .person-page {
    padding: 8px;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%) inset;

    /** for media query */
    container-type: inline-size;
    container-name: right-page;
  }
</style>
