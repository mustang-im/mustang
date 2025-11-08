<GroupBox classes="person">
  <hbox flex class="main-left" slot="content" language={getUILocale()}>
    <hbox flex>
      {#if person.picture}
        <PersonPicture {person} size={64} placeholder="empty" />
      {:else}
        <hbox class="no-avatar" />
      {/if}
      <vbox class="main-info">
        <hbox class="name">
          <EditableSimpleText bind:value={person.name}
            on:save={save}
            bind:isEditing={isEditing}
            isName={true}
            placeholder={$t`First name Last name`} />
        </hbox>
        {#if isEditing}
          <hbox class="names firstname">
            <EditableSimpleText
              bind:value={person.firstName}
              on:save={save}
              bind:isEditing={isEditing}
              placeholder={$t`First name`} />
          </hbox>
          <hbox class="names lastname">
            <EditableSimpleText
              bind:value={person.lastName}
              on:save={save}
              bind:isEditing={isEditing}
              placeholder={$t`Last name`} />
          </hbox>
        {/if}
        <vbox class="job-company">
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
      </vbox>
    </hbox>
    <hbox flex class="main-right">
      <hbox class="call-buttons">
        <CallButtons {person} />
      </hbox>
      <hbox flex />
      <hbox class="main-right-top">
        <AddressbookChanger {person} />
        <PersonMenu {person} />
      </hbox>
    </hbox>
  </hbox>
</GroupBox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import CallButtons from "./CallButtons.svelte";
  import EditableSimpleText from "./EditableSimpleText.svelte";
  import GroupBox from "./GroupBox.svelte";
  import PersonMenu from "./PersonMenu.svelte";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import AddressbookChanger from "../AddressbookChanger.svelte";
  import { showError } from "../../Util/error";
  import { getUILocale, t } from "../../../l10n/l10n";

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
  .main-left {
    margin-inline-start: -16px;
    margin-inline-end: -8px;
    margin-block-end: -8px;
  }
  .main-info {
    margin-inline-start: 12px;
    margin-block-start: 16px;
    margin-block-end: 16px;
  }
  .no-avatar {
    width: 6px;
  }
  .name,
  .name :global(input) {
    font-size: 18px;
    font-weight: bold;
    margin-block-end: 8px;
    color: inherit;
  }
  .name :global(input) {
    width: 20em;
  }
  .names :global(button.save),
  .job-company :global(button.save) {
    visibility: hidden;
  }
  .main-left[language="fr"] .names.lastname {
    text-transform: uppercase;
  }
  .job-company {
    color: grey;
  }
  .job-company :global(.actions),
  .job-company :global(.value) {
    margin-block-start: 2px;
  }
  .main-right {
    margin: 8px;
    flex-wrap: wrap;
  }
  .main-right-top {
    justify-content: end;
    align-items: start;
    margin-block-start: px;
  }
  .main-right-top :global(.account-selector .icon) {
    width: 20px;
    height: 20px;
  }
  .call-buttons {
    align-items: center;
  }
</style>
