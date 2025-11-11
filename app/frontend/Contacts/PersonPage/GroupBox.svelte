<vbox class="group {classes}">
  <hbox class="header">
    <slot name="icon" />
    <h3>{headerName}</h3>
    <hbox flex class="actions">
      {#if addFunc && !appGlobal.isMobile}
        <Button
          on:click={addFunc}
          label={addLabel}
          icon={AddIcon}
          iconOnly plain classes="add top" />
      {/if}
    </hbox>
  </hbox>
  <vbox class="content" flex>
    <slot name="content" />

    {#if addFunc && appGlobal.isMobile && isEditing}
      <hbox class="add-row">
        <Button
          on:click={addFunc}
          label={addLabel}
          plain classes="add text" />
        <RoundButton
          on:click={addFunc}
          label={addLabel}
          icon={AddCircleIcon}
          border={false}
          iconSize="24px" classes="plain add bottom" />
      </hbox>
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import Button from "../../Shared/Button.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import AddCircleIcon from "lucide-svelte/icons/circle-plus";
  import { t } from "../../../l10n/l10n";

  export let classes = "";
  export let headerName: string;

  export let isEditing = false;
  export let addFunc: () => void = null;
  export let addLabel: string = $t`Add`;
</script>

<style>
  .group {
    margin: 5px;
    border: 1px solid var(--border);
    border-radius: 2px;
  }
  .header {
    align-items: center;
    padding: 8px 16px 8px 20px;
    background-color: rgba(32, 174, 158, 5%); /* #20AE9E0C */
  }
  @media (prefers-color-scheme: dark) {
    .header {
      background-color: #20202270;
    }
  }
  h3 {
    margin-inline-start: 10px;
    margin-block-start: 0px;
    margin-block-end: 0px;
    vertical-align: middle;
    font-size: 14px;
  }
  :global(.mobile) h3 {
    font-size: 16px;
    font-weight: 500;
  }
  .actions {
    justify-content: end;
  }
  :global(.group:not(:hover)) .actions {
    visibility: hidden;
  }
  .content {
    background-color: var(--main-bg);
    color: var(--main-fg);
    padding: 8px 16px 10px 20px;
  }
  :global(.mobile) .group {
    border: none;
  }
  :global(.mobile) .header {
    background-color: transparent;
  }
  :global(.mobile) .content {
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .group :global(button.add.top) {
    color: grey;
  }
  .group :global(button.add.text) {
    color: grey;
    font-size: 16px;
    flex: 1 0 0;
  }
  .group :global(button.add.bottom svg) {
    fill: var(--selected-bg);
    color: var(--selected-fg);
  }
  :global(.ios) .group :global(button.add.bottom svg) {
    fill: green;
    color: white;
  }
</style>
