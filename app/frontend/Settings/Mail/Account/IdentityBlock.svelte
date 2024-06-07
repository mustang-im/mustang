<HeaderGroupBox>
  <hbox slot="header">{identity.emailAddress || "New"}</hbox>
  <svelte:fragment slot="buttons-top-right">
    {#if canRemove}
      <RoundButton
        label="Delete this identity"
        onClick={onDelete}
        icon={DeleteIcon}
        />
    {/if}
  </svelte:fragment>
  <vbox class="content">
    <grid>
      <label for="realname">Your name</label>
      <input type="text" bind:value={identity.userRealname} name="realname" />

      <label for="emailaddress">Your email address</label>
      <!-- svelte-ignore a11y-autofocus -->
      <input type="email" bind:value={identity.emailAddress} required
        autofocus={!identity.emailAddress}
        name="emailaddress" class="emailaddress" />

      {#if identity?.emailAddress?.includes("*")}
        <hbox />
        <hbox>
          <hbox class="catch-all">This is a catch-all email address.</hbox>
          <a href="https://ww.mustang.im/link/catch-all" target="_blank">More info</a>
        </hbox>
      {/if}

      <!--
      <label for="picture">Profile picture</label>
      <img on:click={} name="picture" />
      -->

      {#if showReplyTo}
        <label for="replyto" class="reply-to">Reply-to address</label>
        <input type="email" bind:value={identity.replyTo} name="replyto" class="reply-to" />
      {/if}

      {#if showOrganisation}
        <label for="organisation">Company</label>
        <input type="text" bind:value={identity.organisation} name="organisation" />
      {/if}
    </grid>

    {#if showSignature}
      <vbox class="signature">
        Signature
        <vbox class="signature-editor-box">
          <HTMLEditorToolbar {editor} />
          <HTMLEditor bind:html={identity.signatureHTML} bind:editor />
          {#if showSentBy}
            <hbox class="sentBy">
              <div>
                <!--<Icon data={logo} size="20px" />-->
                Sent by <a href="https://mustang.im" target="_blank" style="color: #20AE9E"><strong><em>Mustang</em></strong></a>
              </div>
              {#if !showSentByExplainer}
                <RoundButton
                  label="Remove 'Sent by'"
                  icon={RemoveIcon}
                  border={false}
                  padding="4px"
                  iconSize="12px"
                  onClick={() => showSentByExplainer = true}
                  />
              {/if}
            </hbox>
          {/if}
        </vbox>

        {#if showSentByExplainer}
          <SentByExplainer />
        {/if}
      </vbox>
    {/if}

    <ExpanderButtons>
      <ExpanderButton bind:expanded={showReplyTo} label="Reply-To" />
      <ExpanderButton bind:expanded={showOrganisation} label="Organisation" />
      <ExpanderButton bind:expanded={showSignature} label="Signature" />
    </ExpanderButtons>
  </vbox>
</HeaderGroupBox>

<script lang="ts">
  import type { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import SentByExplainer from "./SentByExplainer.svelte";
  import HTMLEditor from "../../../Shared/Editor/HTMLEditor.svelte";
  import HTMLEditorToolbar from "../../../Shared/Editor/HTMLEditorToolbar.svelte";
  import ExpanderButton from "../../../Shared/ExpanderButton.svelte";
  import ExpanderButtons from "../../../Shared/ExpanderButtons.svelte";
  import HeaderGroupBox from "../../../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import RemoveIcon from "lucide-svelte/icons/circle-x";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../../../asset/icon/general/logo.svg?raw';
  import type { Editor } from "@tiptap/core";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher();

  export let identity: MailIdentity;
  export let canRemove = true;

  let showReplyTo = !!identity.replyTo;
  let showOrganisation = !!identity.organisation;
  let showSignature = !!identity.signatureHTML;
  let showSentBy = true;
  let showSentByExplainer = false;
  let editor: Editor;

  function onDelete() {
    dispatchEvent("delete", identity);
  }
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
    max-width: 30em;
  }
  .emailaddress:invalid {
    background-color: #FFF160;
  }
  .catch-all {
    font-style: italic;
    margin-right: 1em;
  }
  .reply-to {
    margin-top: 32px;
  }
  .signature {
    margin-top: 32px;
  }
  .signature-editor-box {
    border: 1px solid var(--border);
    border-radius: 5px;
    margin-top: 4px;
  }
  .signature :global(.html-editor) {
    min-height: 5em;
    padding: 8px;
  }
  .sentBy {
    padding: 8px 16px;
  }
  .sentBy :global(button) {
    margin-left: 12px;
  }
  .content :global(.expander-buttons) {
    margin-top: 38px;
  }
</style>
