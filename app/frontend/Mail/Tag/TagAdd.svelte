<hbox class="tag"
  style="--color: {$tag.color}">
  <input type="text" bind:value={tag.name} bind:this={inputTextE} required autofocus />
  <input type="color" bind:value={tag.color} required />

  <RoundButton
    label={$t`Add`}
    onClick={onAdd}
    icon={SaveIcon}
    filled
    classes="small plain"
    iconSize="12px"
    padding="4px"
    />
  <RoundButton
    label={$t`Cancel`}
    onClick={onCancel}
    icon={CancelIcon}
    classes="small plain"
    iconSize="12px"
    padding="4px"
    />
</hbox>

<script lang="ts">
  import { Tag } from "../../../logic/Mail/Tag";
  import SaveIcon from "lucide-svelte/icons/check";
  import CancelIcon from "lucide-svelte/icons/x";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";
  import RoundButton from "../../Shared/RoundButton.svelte";
  const dispatch = createEventDispatcher<{ add: Tag, cancel: void }>();

  export let tag = new Tag();
  tag.color = "#108310";

  let inputTextE: HTMLInputElement;
  function onAdd() {
    let isValid = inputTextE.reportValidity();
    if (isValid) {
      dispatch("add", tag);
    }
  }
  function onCancel() {
    dispatch("cancel");
  }
</script>

<style>
  .tag {
    min-height: 16px;
    font-size: 12px;
    margin: 2px;
  }
  input[type="text"] {
    background-color: var(--color);
    color: white;
    border-radius: 8px;
    padding: 0 8px;
    max-width: 5em;
  }
  input[type="color"] {
    margin-inline-start: 6px;
    height: 24px;
  }
  .tag :global(.button) {
    margin-inline-start: 4px;
  }
</style>
