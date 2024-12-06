<FinalizeConfig config={account} />

<ButtonsBottom
  canContinue={true}
  onContinue={onOK}
  >
  <Button label="Back" classes="secondary"
    onClick={onBack}
    />
  <Button label="Skip" classes="secondary"
    onClick={onSkip}
    />
</ButtonsBottom>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import FinalizeConfig from "../Mail/FinalizeConfig.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Button from "../../Shared/Button.svelte";

  export let account: MailAccount;
  export let onContinue = () => undefined;
  export let onSkip = () => undefined;
  export let onBack = () => undefined;

  async function onOK() {
    await account.save();
    onContinue();
  }
</script>
