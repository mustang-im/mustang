<Dialog title={$t`Trust Center`}
  okLabel={$t`OK`}
  onOK={onOK}
  width="560px"
  on:close>
  <vbox class="trust-center">
    <OptionsSection title={$t`Read as Plain Text`}>
      <OptionsRow icon={PlainTextIcon}>
        <label>
          <input type="checkbox" bind:checked={readAsPlainText} />
          {$t`Read all standard mail in plain text`}
        </label>
      </OptionsRow>
    </OptionsSection>
  </vbox>
</Dialog>

<script lang="ts">
  import type { OptionsModel } from "./OptionsModel";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import PlainTextIcon from "lucide-svelte/icons/file-text";
  import { t } from "../../../l10n/l10n";

  export let options: OptionsModel;

  let readAsPlainText = options.readAsPlainText.value;

  function onOK() {
    options.readAsPlainText.value = readAsPlainText;
  }
</script>
