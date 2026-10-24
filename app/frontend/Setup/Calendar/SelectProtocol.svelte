<Header
  title={$t`Set up your calendar`}
  subtitle=""
/>

<ProtocolSelector {protocols} bind:selectedProtocol={selectedProtocol} />

{#if addonAccount}
  <AddonAccountSetup account={addonAccount} bind:this={addonSetup} />
{/if}

<ErrorMessageInline bind:this={errorUI} />

<ButtonsBottom
  onContinue={() => catchErrors(onContinue, errorUI.showError)}
  canContinue={!!selectedProtocol}
  canCancel={true}
  onCancel={onCancel}
  />

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { newCalendarForProtocol } from "../../../logic/Calendar/AccountsList/Calendars";
  import type { AddonCalendar } from "../../../logic/Calendar/Addon/AddonCalendar";
  import { addonProtocols } from "../../../logic/Addons/AddonProtocols";
  import { appGlobal } from "../../../logic/app";
  import AddonAccountSetup from "../Addon/AddonAccountSetup.svelte";
  import LocalCalendarSetup from "./LocalCalendarSetup.svelte";
  import CalDAVSetup from "./CalDAVSetup.svelte";
  import ProtocolSelector, { ProtocolDescription } from "../Shared/ProtocolSelector.svelte";
  import ButtonsBottom from "../Shared/ButtonsBottom.svelte";
  import Header from "../Shared/Header.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { NotReached } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  /** out */
  export let config: Calendar = null;
  /** out */
  export let showPage: ConstructorOfATypedSvelteComponent;
  export let onCancel = (event: Event) => undefined;

  let selectedProtocol: string;
  let addonSetup: AddonAccountSetup;
  let errorUI: ErrorMessageInline;

  const appProtocols: ProtocolDescription[] = [
    { label: $t`New local calendar`, protocolID: "calendar-local" },
    { label: $t`New CalDAV calendar`, protocolID: "caldav" },
  ];
  $: protocols = appProtocols.concat($addonProtocols.contents.filter(protocol => protocol.type == "calendar").map(protocol => ({ label: protocol.label, protocolID: protocol.protocol })));
  $: addonAccount = $addonProtocols.some(protocol => protocol.protocol == selectedProtocol) ? newCalendarForProtocol(selectedProtocol) as AddonCalendar : null;

  async function onContinue() {
    if (addonAccount) {
      await addonSetup.onContinue();
      await addonAccount.login(true);
      await addonAccount.listEvents(); // check whether it works
      appGlobal.calendars.add(addonAccount);
      await addonAccount.save();
      showPage = null;
      return;
    }
    config = newCalendarForProtocol(selectedProtocol);
    if (selectedProtocol == "calendar-local") {
      showPage = LocalCalendarSetup;
    } else if (selectedProtocol == "caldav") {
      showPage = CalDAVSetup;
    } else {
      throw new NotReached();
    }
  }
</script>

<style>
</style>
