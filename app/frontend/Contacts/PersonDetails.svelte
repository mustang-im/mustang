<vbox flex class="person-page font-small">
  <NameBox {person} />

  <Splitter initialRightRatio={1} name="contact-history">
    <Scroll hideHorizontalScrollbar={true} slot="left">
      <ContactBoxes {person} />
    </Scroll>
    <ContactHistory {person} slot="right" />
  </Splitter>
</vbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import NameBox from "./NameBox.svelte";
  import ContactBoxes from "./ContactBoxes.svelte";
  import ContactHistory from "./History/ContactHistory.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let person: Person;
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
