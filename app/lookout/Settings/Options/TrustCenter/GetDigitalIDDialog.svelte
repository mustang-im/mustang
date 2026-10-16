<Dialog title={$t`Get a Digital ID`} okLabel={$t`Create`} onOK={onOK} width="540px" on:close>
  <vbox class="get-digital-id">
    <span>{$t`A Digital ID lets you add a digital signature to your messages, and lets others send you encrypted messages.`}</span>
    <FormGrid columns="150px minmax(0, 1fr)">
      <span>{$t`E-mail address:`}</span>
      <ComboBox options={identityOptions} bind:value={identity} label={$t`E-mail address`} />
      <span>{$t`Type:`}</span>
      <span>{$t`OpenPGP key, created on this computer`}</span>
    </FormGrid>
    <span class="hint">{$t`For an S/MIME certificate, ask a certificate authority, e.g. your organization, for a .p12 or .pfx file, and import it with the Import/Export button.`}</span>
  </vbox>
</Dialog>

<script lang="ts">
  import type { MailIdentity } from "../../../../logic/Mail/MailIdentity";
  import { DigitalIDs } from "./DigitalIDs";
  import Dialog from "../../../Shared/Dialog/Dialog.svelte";
  import FormGrid from "../../../Shared/Form/FormGrid.svelte";
  import ComboBox from "../../../Shared/Form/ComboBox.svelte";
  import { t } from "../../../../l10n/l10n";

  export let identity: MailIdentity;
  export let identities: MailIdentity[];
  export let onChanged: (identity: MailIdentity) => void;

  $: identityOptions = identities.map(listed => ({ value: listed, label: DigitalIDs.identityLabel(listed) }));

  async function onOK() {
    await DigitalIDs.createOpenPGP(identity);
    onChanged(identity);
  }
</script>

<style>
  .get-digital-id {
    gap: 12px;
  }
  .hint {
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
  }
</style>
