<vbox class="book" flex>
  {#if state == TSMLBookMeState.Select}
    <BookSelect bind:bookMe bind:myReaction bind:selectedTime={time} {isOrganizer} />
  {:else if state == TSMLBookMeState.UserConfirm}
    <BookConfirm {time} bind:bookMe bind:myReaction />
  {:else if state == TSMLBookMeState.UserConfirmed}
    <BookConfirmed both={false} {time} bind:bookMe bind:myReaction />
  {:else if state == TSMLBookMeState.BothConfirmed}
    <BookConfirmed both={true} {time} bind:bookMe bind:myReaction />
  {:else}
    Unknown state for "Book me" usecase
  {/if}
</vbox>

<script lang="ts">
  import { SMLData } from "../../../../logic/Mail/SML/SMLData";
  import { type TSMLBookMe, type TSMLAction, TSMLBookMeState } from "../../../../logic/Mail/SML/TSML";
  import BookSelect from "./BookSelect.svelte";
  import BookConfirm from "./BookConfirm.svelte";
  import BookConfirmed from "./BookConfirmed.svelte";

  export let sml: SMLData;
  export let myReaction: TSMLAction;

  $: time = myReaction.object as any as Date; // TODO

  $: bookMe = $sml.sml as any as TSMLBookMe;
  $: state = myReaction.state ?? bookMe.state;
  $: isOrganizer = myReaction?.agent?.email == bookMe.organizer?.email;
</script>

<style>
  .book {
    margin: 16px;
  }
</style>
