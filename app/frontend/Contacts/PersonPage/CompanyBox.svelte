<vbox class="box" flex>
  <GroupBox>
      <svelte:fragment slot="header">
        <CompanyIcon size="16px" />
        <h3>{$t`Company`}</h3>
      </svelte:fragment>
    <vbox class="company" slot="content">
      {#if $person.position || isEditing}
        <hbox class="position">
          <EditableSimpleText
            bind:value={person.position}
            on:save={save}
            bind:isEditing={isEditing}
            placeholder={$t`Position`} />
        </hbox>
      {/if}
      {#if $person.department || isEditing}
        <hbox class="department">
          <EditableSimpleText
            bind:value={person.department}
            on:save={save}
            bind:isEditing={isEditing}
            placeholder={$t`Department`} />
        </hbox>
      {/if}
      {#if $person.company || isEditing}
        <hbox class="company">
          <EditableSimpleText
            bind:value={person.company}
            on:save={save}
            bind:isEditing={isEditing}
            placeholder={$t`Company`} />
        </hbox>
      {/if}
    </vbox>
  </GroupBox>
</vbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import EditableSimpleText from "./EditableSimpleText.svelte";
  import GroupBox from "./GroupBox.svelte";
  import CompanyIcon from "lucide-svelte/icons/building-2";
  import { showError } from "../../Util/error";
  import { t } from "../../../l10n/l10n";
  import Icon from "../../Shared/Icon.svelte";

  export let person: Person;
  /** in/out */
  export let isEditing: boolean;

  async function save() {
    try {
      await person.save();
    } catch (ex) {
      showError(ex);
    }
  }
</script>

<style>
  .box :global(.group .header h3) {
    margin-inline-start: 10px;
    margin-block-start: 0px;
    margin-block-end: 0px;
    vertical-align: middle;
    font-size: 14px;
  }
  .company {
    color: grey;
  }
  .company :global(.actions),
  .company :global(.value) {
    margin-block-start: 2px;
  }
  .company :global(input) {
    margin-block-end: 8px;
    color: inherit;
  }
  .company :global(input) {
    width: 20em;
  }
  .company :global(button.save) {
    visibility: hidden;
  }
</style>
