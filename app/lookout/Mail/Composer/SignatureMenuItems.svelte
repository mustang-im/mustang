{#each withSignature as signatureIdentity (signatureIdentity.id)}
  <MenuItem label={signatureIdentity.emailAddress}
    selected={!!mail && signatureIdentity == identity}
    tooltip={mail ? $t`Use this signature in this message` : null}
    disabled={!editor}
    onClick={() => onInsert(signatureIdentity)} />
{/each}
{#if withSignature.length}
  <MenuDivider />
{/if}
<MenuItem label={$t`Signatures… *=> Edit the email signatures`} onClick={() => dispatch("editSignatures")} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { findAllIdentities, type MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { SignatureEdits } from "./SignatureEdits";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import type { Editor } from "@tiptap/core";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let identity: MailIdentity;
  export let editor: Editor;
  export let mail: EMail | null = null;
  const dispatch = createEventDispatcher<{ editSignatures: void }>();

  let identities = findAllIdentities();
  $: withSignature = $identities.contents.filter(candidate => SignatureEdits.hasText(candidate.signatureHTML));

  function onInsert(signatureIdentity: MailIdentity) {
    if (mail) {
      editor.commands.editSignature(body => body.putOwnSignature(signatureIdentity.signatureHTML));
    } else {
      editor.chain().focus().insertContent(signatureIdentity.signatureHTML).run();
    }
  }
</script>
