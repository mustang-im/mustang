<vbox class="view-selector-popup">
  <hbox flex>
    <Button
      label={$t`Gallery`}
      icon={viewGalleryIcon}
      onClick={() => selectView(View.GalleryAutoView)}
      selected={!showGalleryOptions && selectedGallery}
      iconSize="24px"
      plain={true}
      />
    <Button
      label={$t`Show gallery options`}
      iconOnly={true}
      icon={showGalleryOptions ? CollapseIcon : ExpandIcon}
      onClick={() => showGalleryOptions = !showGalleryOptions}
      iconSize="16px"
      plain={true}
      />
  </hbox>
  {#if showGalleryOptions}
    <vbox class="gallery-options" flex>
      <Button
        label={$t`Automatic`}
        tooltip={$t`Adapt to window size`}
        icon={ViewGalleryAutoIcon}
        onClick={() => selectView(View.GalleryAutoView)}
        selected={selectedView == View.GalleryAutoView}
        iconSize="24px"
        plain={true}
        />
      <Button
        label={$t`2x2 = 4`}
        icon={ViewGallery2x2Icon}
        onClick={() => selectView(View.Gallery2x2View)}
        selected={selectedView == View.Gallery2x2View}
        disabled={videoCount <= 2}
        iconSize="24px"
        plain={true}
        />
      <Button
        label={$t`3x3 = 9`}
        icon={ViewGallery3x3Icon}
        onClick={() => selectView(View.Gallery3x3View)}
        selected={selectedView == View.Gallery3x3View}
        disabled={videoCount <= 4}
        iconSize="24px"
        plain={true}
        />
      <Button
        label={$t`4x4 = 16`}
        icon={ViewGallery3x3Icon}
        onClick={() => selectView(View.Gallery4x4View)}
        selected={selectedView == View.Gallery4x4View}
        disabled={videoCount <= 9}
        iconSize="24px"
        plain={true}
        />
      <Button
        label={$t`5x5 = 25`}
        icon={ViewGallery3x3Icon}
        onClick={() => selectView(View.Gallery5x5View)}
        selected={selectedView == View.Gallery5x5View}
        disabled={videoCount <= 16}
        iconSize="24px"
        plain={true}
        />
    </vbox>
  {/if}
  <Button
    label={$t`Thumbnails`}
    icon={ViewThumbnailsRightIcon}
    onClick={() => selectView(View.Thumbnails)}
    selected={selectedView == View.Thumbnails}
    iconSize="24px"
    plain={true}
    />
  <Button
    label={$t`Speaker only`}
    icon={ViewSpeakerOnlyIcon}
    onClick={() => selectView(View.SpeakerOnly)}
    selected={selectedView == View.SpeakerOnly}
    iconSize="24px"
    plain={true}
    />
  <Button
    label={$t`Show my camera`}
    icon={CameraIcon}
    onClick={toggleShowSelf}
    selected={showSelf}
    iconSize="24px"
    plain={true}
    />
</vbox>

<script lang="ts">
  import { getLocalStorage } from "../../Util/LocalStorage";
  import Button from "../../Shared/Button.svelte";
  import ViewGallery2VerticalIcon from "lucide-svelte/icons/rows-2";
  import ViewGallery2HorizontalIcon from "lucide-svelte/icons/columns-2";
  import ViewGallery2x2Icon from "lucide-svelte/icons/grid-2x2";
  import ViewGallery3x3Icon from "lucide-svelte/icons/grid-3x3";
  import ViewGallery2x3Icon from "lucide-svelte/icons/table";
  import ViewGalleryAutoIcon from "lucide-svelte/icons/grid-2x2-check";
  import ViewThumbnailsTopIcon from "lucide-svelte/icons/panel-top";
  import ViewThumbnailsRightIcon from "lucide-svelte/icons/panel-right";
  import ViewSpeakerOnlyIcon from "lucide-svelte/icons/square-user-round";
  import ViewScreenshareIcon from "lucide-svelte/icons/tv-minimal";
  import CameraIcon from "lucide-svelte/icons/video";
  import ExpandIcon from "lucide-svelte/icons/chevron-down";
  import CollapseIcon from "lucide-svelte/icons/chevron-up";
  import { t } from "../../../l10n/l10n";

  export let show: boolean;
  export let videoCount: number;

  const View = MeetVideoView;
  let viewSetting = getLocalStorage("meet.videoView", View.GalleryAutoView);
  $: selectedView = $viewSetting.value;
  $: viewGalleryIcon =
    selectedView == View.Gallery3x3View ||
    selectedView == View.Gallery4x4View ||
    selectedView == View.Gallery5x5View
    ? ViewGallery3x3Icon
    : ViewGallery2x2Icon;
  $: selectedGallery = meetGalleryViews.includes(selectedView);
  $: showGalleryOptions = selectedGallery;

  function selectView(view: MeetVideoView) {
    viewSetting.value = view;
    show = false;
  }

  $: showSelfSetting = getLocalStorage("meet.showSelf", true);
  $: showSelf = $showSelfSetting.value

  function toggleShowSelf() {
    showSelfSetting.value = !showSelf;
  }
</script>

<script lang="ts" context="module">
  export enum MeetVideoView {
    GalleryAutoView = "gallery-auto",
    Gallery2x2View = "gallery-2x2",
    Gallery3x3View = "gallery-3x3",
    Gallery4x4View = "gallery-4x4",
    Gallery5x5View = "gallery-5x5",
    Thumbnails = "thumbnails",
    SpeakerOnly = "speaker-only",
  }

  export const meetGalleryViews = [
    MeetVideoView.Gallery2x2View,
    MeetVideoView.Gallery3x3View,
    MeetVideoView.Gallery4x4View,
    MeetVideoView.Gallery5x5View,
    MeetVideoView.GalleryAutoView,
  ];
</script>

<style>
  .view-selector-popup {
    align-items: start;
    box-shadow: 2.281px 1.14px 9.123px 0px rgba(var(--shadow-color), 20%);
    padding: 12px;
    padding-inline-start: 16px;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
  }
  .gallery-options {
    margin: 8px;
    margin-inline-start: 28px;
    align-items: start;
  }
  .view-selector-popup :global(button) {
    background-color: inherit;
    color: inherit;
    padding: 4px;
    padding-inline-end: 8px;
  }
  .gallery-options :global(button) {
    padding-block: 2px;
    padding-inline-start: 4px;
  }
</style>
