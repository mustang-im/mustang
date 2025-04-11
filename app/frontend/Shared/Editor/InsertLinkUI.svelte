<Toolbar>
  <hbox flex class="link-dialog">
    <!-- <label for="linktext">Link text</label>
    <input type="text" bind:value={linkText} id="linktext" /> -->
    <!-- <label for="linktargeturl">Link target URL</label> -->
    <input type="url" bind:value={linkTargetURL} id="linktargeturl" />
    <Button
      onClick={onLinkOK}
      label={$t`OK`}
      icon={OKIcon}
      iconOnly
      />
    <Button
      label={$t`Remove link`}
      onClick={() => { editor.chain().focus().unsetLink().toggleLinkUI().run()}}
      disabled={!editor?.can().chain().focus().unsetLink().run()}
      icon={LinkRemoveIcon}
      iconOnly
      />
  </hbox>
</Toolbar>

<!--
@component
UI component for InsertLinks.ts
-->

<script lang="ts">
  import Toolbar from "../Toolbar/Toolbar.svelte";
  import Button from "../Button.svelte";
  import OKIcon from "lucide-svelte/icons/check";
  import LinkRemoveIcon from "lucide-svelte/icons/unlink";
  import type { Editor } from "@tiptap/core";
  import { t } from "../../../l10n/l10n";

  export let editor: Editor;

  /** in: Set URL to the selection */
  export let linkTargetURL: string = null;
  function onLinkOK() {
    editor.chain().focus().setLink({ href: linkTargetURL }).toggleLinkUI().run();
    linkTargetURL = null;
  }
</script>
