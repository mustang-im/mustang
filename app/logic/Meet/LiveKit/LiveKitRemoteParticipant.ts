import { MeetingParticipant, ParticipantRole } from "../Participant";
import { ParticipantVideo, ScreenShare } from "../VideoStream";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { catchErrors } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import type { LiveKitConf } from "./LiveKitConf";
import { ParticipantEvent, RemoteParticipant, Track, TrackPublication } from "livekit-client";

export class LiveKitRemoteParticipant extends MeetingParticipant {
  rp: RemoteParticipant;
  conf: LiveKitConf;

  constructor(rp: RemoteParticipant, conf: LiveKitConf) {
    super();
    this.rp = rp;
    this.conf = conf;
    this.id = rp.identity;
    this.role = rp.isAgent ? ParticipantRole.Agent : ParticipantRole.User;
    this.updateProps();
    rp.on(ParticipantEvent.ParticipantNameChanged, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.AttributesChanged, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.ParticipantMetadataChanged, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackPublished, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnpublished, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackMuted, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnmuted, () => catchErrors(() => this.updateProps(), this.conf.errorCallback));
    rp.on(ParticipantEvent.IsSpeakingChanged, () => catchErrors(() => this.speakingChanged(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackSubscribed, track => catchErrors(() => this.addTrack(track), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnsubscribed, track => catchErrors(() => this.removeTrack(track), this.conf.errorCallback));

    for (let trackPub of rp.trackPublications.values()) {
      if (!trackPub.isSubscribed || !trackPub.track) {
        continue;
      }
      this.addTrack(trackPub.track);
    }
  }
  protected updateProps() {
    let rp = this.rp;
    console.log("Participant", rp.identity, rp);
    this.name = rp.name || rp.identity;
    this.cameraOn = rp.isCameraEnabled;
    this.micOn = rp.isMicrophoneEnabled;
    this.screenSharing = rp.isScreenShareEnabled;
    this.handUp = sanitize.boolean(rp.attributes.handUp);
  }
  protected speakingChanged() {
    this.isSpeaking = this.rp.isSpeaking;
    if (this.rp.isSpeaking) {
      this.conf.speaker = this;
    } else if (this.conf.speaker == this) {
      this.conf.speaker = null;
    }
  }

  async addTrack(track: Track) {
    console.log("Participant", this.rp.identity, "added a track", track.mediaStream);
    assert(track.mediaStream, "Need mediaStream for Track");
    let isScreen = track.source == Track.Source.ScreenShare || track.source == Track.Source.ScreenShareAudio;
    let video = isScreen
      ? new ScreenShare(track.mediaStream, this)
      : new ParticipantVideo(track.mediaStream, this);
    this.conf.videos.add(video);
  }
  async removeTrack(track: Track) {
    console.log("Participant", this.rp.identity, "removed a track");
    let isScreen = track.source == Track.Source.ScreenShare || track.source == Track.Source.ScreenShareAudio;
    let video = this.conf.videos.find(v =>
      (!isScreen && v instanceof ParticipantVideo ||
        isScreen && v instanceof ScreenShare) &&
      v.participant == this);
    if (!video) {
      return;
    }
    this.conf.videos.remove(video);
  }
}
