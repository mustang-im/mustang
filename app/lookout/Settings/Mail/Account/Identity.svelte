<OptionsPage icon={IdentityIcon} description={$t`This is how you appear to others when you send mail from ${$account.name}.`}>
  {#each draft.identities as identity, i (identity)}
    <OptionsSection title={identity.emailAddress || $t`New identity`}>
      <OptionsRow icon={i == 0 ? DefaultIdentityIcon : AliasIcon}>
        <grid class="fields">
          <label for="identity-realname-{i}">{$t`Your Name:`}</label>
          <input id="identity-realname-{i}" class="lo-text-field" type="text" bind:value={identity.realname} />
          <label for="identity-email-{i}">{$t`Email Address:`}</label>
          <input id="identity-email-{i}" class="lo-text-field" type="email" bind:value={identity.emailAddress} required
            class:invalid={!!identity.emailAddress && !identity.isEMailAddressValid} />
          {#if identity.isCatchAll}
            <span />
            <span class="note">{$t`This is a catch-all email address.`}</span>
          {/if}
          <label for="identity-replyto-{i}">{$t`Reply-To Address:`}</label>
          <input id="identity-replyto-{i}" class="lo-text-field" type="email" bind:value={identity.replyTo} />
          <label for="identity-organisation-{i}">{$t`Organization:`}</label>
          <input id="identity-organisation-{i}" class="lo-text-field" type="text" bind:value={identity.organisation} />
        </grid>
        {#if draft.canRemove(identity)}
          <hbox>
            <DialogButton label={$t`Remove Identity`} icon={RemoveIcon}
              onClick={() => { draft.remove(identity); draft = draft; }} />
          </hbox>
        {/if}
      </OptionsRow>
    </OptionsSection>
  {/each}
  <hbox class="add">
    <DialogButton label={$t`Add Identity`} icon={AddIcon} onClick={() => { draft.add(); draft = draft; }} />
  </hbox>
</OptionsPage>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import type { IdentitiesDraft } from "./IdentitiesDraft";
  import OptionsPage from "../../Shared/OptionsPage.svelte";
  import OptionsSection from "../../Shared/OptionsSection.svelte";
  import OptionsRow from "../../Shared/OptionsRow.svelte";
  import DialogButton from "../../../Shared/Dialog/DialogButton.svelte";
  import IdentityIcon from "lucide-svelte/icons/contact-round";
  import DefaultIdentityIcon from "lucide-svelte/icons/user-round-check";
  import AliasIcon from "lucide-svelte/icons/user-round";
  import RemoveIcon from "lucide-svelte/icons/x";
  import AddIcon from "lucide-svelte/icons/plus";
  import { t } from "../../../../l10n/l10n";

  export let account: MailAccount;
  export let draft: IdentitiesDraft;
</script>

<style>
  .fields {
    grid-template-columns: 160px minmax(200px, 360px);
    align-items: center;
    gap: 8px 12px;
  }
  .note {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  input.invalid {
    border-color: var(--lo-danger);
  }
  .add {
    margin-block-start: 8px;
  }
</style>
