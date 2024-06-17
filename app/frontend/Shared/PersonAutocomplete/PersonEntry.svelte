<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="person"
  class:selected={popupOpen}
  class:no-pic={!$person.person?.picture}
  use:popupRef
  on:click={onClick}>
  {#if $person.person?.picture}
    <PersonPicture person={$person.person} size={24} />
  {/if}
  <vbox flex class="right">
    <hbox flex class="name">{$person.name || $person.emailAddress}</hbox>
  </vbox>
</hbox>
{#if popupOpen}
  <vbox class="popup"
    use:popupContent={popupOptions}>
    <PersonPopup personUID={person}
      on:removePerson
      on:close={onClose}
      >
      <slot name="person-popup-buttons" slot="buttons" personUID={person} />
    </PersonPopup>
  </vbox>
{/if}
<vbox class="context-menu" class:open>
  <slot name="context-menu" {person} />
</vbox>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import PersonPopup from "./PersonPopup.svelte";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import { createPopperActions } from 'svelte-popperjs';
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ focusNext: void }>();

  export let person: PersonUID;

  let popupOpen = false;
  const [popupRef, popupContent] = createPopperActions({
    placement: 'bottom-start',
    strategy: 'fixed',
  });
  const popupOptions = {
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, 4] },
        preventOverflow: true,
        allow: true,
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
          boundary: document.querySelector('.mail-composer-window'),
        },
      },
      {
        name: 'hide',
      },
    ],
  };

  if ((person as any).openPopup) {
    popupOpen = true;
  }

  function onClick(event: MouseEvent) {
    popupOpen = !popupOpen;
    event.stopPropagation();
  }

  function onClose() {
    popupOpen = false;
    dispatchEvent("focusNext");
  }
</script>

<style>
  .person {
    background-color: var(--main-bg);
    color: var(--main-fg);
    border-radius: 100px;
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 7%);
    align-items: center;
    padding-right: 12px;
    height: 24px;
  }
  .person:not(.selected):hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .person.selected {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  .person :global(.avatar) {
    margin: 0px;
    margin-right: 6px;
  }
  .no-pic {
    padding-left: 14px;
  }
  .name {
    align-items: center;
    white-space: nowrap;
  }

  .popup {
    z-index: 100;
  }
  .context-menu:not(.open) {
    display: none;
  }
</style>
