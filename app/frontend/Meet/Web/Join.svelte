<hbox class="join" flex>
  <vbox class="device-setup box" flex>
    <DeviceSetup>
      <hbox class="actions left" flex slot="buttons-left">
        <RoundButton classes="cancel"
          label={$t`Cancel`}
          icon={XIcon}
          iconSize="24px"
          onClick={hangup}
          />
      </hbox>
      <hbox class="actions right" flex slot="buttons-right">
        <RoundButton classes="accept"
          label={$t`Start conference`}
          icon={OpenIcon}
          iconSize="24px"
          onClick={accept}
          disabled={!name && $t`Please enter your name`}
          border={false} />
      </hbox>
    </DeviceSetup>
  </vbox>
  <vbox class="right box" flex>
    <vbox class="name">
      <label for="name-field" class="label font-small">{$t`Your name`}</label>
      <input type="text" id="name-field" bind:value={name} autofocus={!name} />
    </vbox>
  </vbox>
</hbox>

<svelte:window on:keydown={ev => catchErrors(() => onKeyEnter(ev, accept))} />

<script lang="ts">
  import type { VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import DeviceSetup from "../Setup/DeviceSetup.svelte";
  import XIcon from "lucide-svelte/icons/x";
  import OpenIcon from "lucide-svelte/icons/door-open";
  import { appGlobal } from "../../../logic/app";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { onKeyEnter } from "../../Util/util";
  import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  /** This is an adapted Calling.svelte page for joining the meeting on the web.
   * It doesn't have the 1:1 calling, avatar display, incoming call etc. UI.
   * OTOH, it allows the user to enter his name. */

  export let meeting: VideoConfMeeting;

  async function accept() {
    nameSetting.value = name;
    appGlobal.me.name = name;
    await meeting.start();
  }

  async function hangup() {
    await meeting.hangup();
  }

  let nameSetting = getLocalStorage("name", "");
  let name = nameSetting.value;
  if (!name) {
    let anchor = new URLSearchParams(new URL(window.location.href).hash?.substring(1));
    name = sanitize.label(anchor.get("name"), "");
  }
</script>

<style>
  .join {
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6vw;
    background-color: #494558;
    color: white;
  }
  .box {
    background-color: #494558;
    color: white;
    aspect-ratio: 8/10;
    border-radius: 4px;
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
    min-width: 400px;
    max-width: 400px;
    max-height: 440px;
    padding: 20px 0px;
  }
  .actions {
    margin-block-start: 12px;
  }
  .actions :global(button.action) {
    padding: 16px;
  }
  .actions :global(button.accept svg),
  .actions :global(button.hangup svg) {
    stroke: white;
  }
  .actions :global(.call-person .avatar) {
    margin: -4px 0px;
  }
  .actions :global(button.accept) {
    background-color: #20AF9E;
  }
  .actions :global(button.hangup) {
    background-color: #F34949 !important;
  }
  .actions :global(button.hangup svg) {
    transform: rotate(135deg);
  }
  .device-setup .actions {
    justify-content: center;
    margin-top: 0px;
  }
  .device-setup .actions :global(button) {
    padding: 9px;
  }

  .device-setup :global(button.button),
  .device-setup :global(button.button:hover:not(.disabled)) {
    border: 2px solid var(--inverted-bg) !important;
  }
  .device-setup :global(button.border svg path) {
    stroke-width: 1.5px;
  }
  .device-setup :global(.self-video video) {
    width: 100%;
  }

  .actions :global(button.hangup:hover),
  .actions :global(button.accept:hover) {
    animation-name: color;
      animation-duration: 0.5s;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease;
  }
  @keyframes color {
    to {
      opacity: 70%;
    }
  }

  .right.box {
    justify-content: end;
  }
  .name {
    margin-inline: 40px;
    margin-block: 8px;
  }
  .name .label {
    margin-block-end: 4px;
    padding-inline-start: 12px;
  }
  .name input {
    font-size: 16px;
    padding: 8px 12px;
    width: auto;
  }
</style>
