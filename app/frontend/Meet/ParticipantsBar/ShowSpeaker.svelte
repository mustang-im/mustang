{#if selected && isSpeakerView}
  <hbox class="buttons">
    <RoundButton
      label={$t`Show speaker`}
      icon={SpeakerIcon}
      onClick={showSpeaker}
      padding="3px"
      />
  </hbox>
{/if}

<script lang="ts">
  import { MeetingParticipant } from "../../../logic/Meet/Participant";
  import { MeetVideoView } from "../View/ViewSelectorPopup.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SpeakerIcon from "lucide-svelte/icons/user-search";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { t } from "../../../l10n/l10n";

  export let selected: MeetingParticipant;

  let viewSetting = getLocalStorage("meet.videoView", MeetVideoView.GalleryAutoView);
  $: selectedView = $viewSetting.value;
  $: isSpeakerView = selectedView == MeetVideoView.SpeakerOnly || selectedView == MeetVideoView.Thumbnails;
  $: isSpeakerView && showSpeaker();

  function showSpeaker() {
    selected = null;
  }
</script>

<style>
  .buttons {
    justify-content: center;
  }
</style>
