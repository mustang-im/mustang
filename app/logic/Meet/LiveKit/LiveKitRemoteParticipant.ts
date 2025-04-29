import { catchErrors } from "../../../frontend/Util/error";
import { gt } from "../../../l10n/l10n";
import { assert } from "../../util/util";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import { ParticipantVideo, ScreenShare } from "../VideoStream";
import { LiveKitConf } from "./LiveKitConf";
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
    this.updateName();
    this.updateAttributes();
    rp.on(ParticipantEvent.ParticipantNameChanged, () => catchErrors(() => this.updateName(), this.conf.errorCallback));
    rp.on(ParticipantEvent.AttributesChanged, () => catchErrors(() => this.updateAttributes(), this.conf.errorCallback));
    rp.on(ParticipantEvent.ParticipantMetadataChanged, () => catchErrors(() => this.updateAttributes(), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackSubscribed, track => catchErrors(() => this.addTrack(track), this.conf.errorCallback));
    rp.on(ParticipantEvent.TrackUnsubscribed, track => catchErrors(() => this.removeTrack(track), this.conf.errorCallback));
    rp.on(ParticipantEvent.IsSpeakingChanged, track => catchErrors(() => this.speakingChanged(), this.conf.errorCallback));
  }
  protected updateName() {
    let rp = this.rp;
    this.name = rp.name ?? gt`Participant` + " " + rp.identity.substring(rp.identity.length - 2);
  }
  protected updateAttributes() {
    let rp = this.rp;
    this.cameraOn = rp.isCameraEnabled;
    this.micOn = rp.isMicrophoneEnabled;
    this.screenSharing = rp.isScreenShareEnabled;
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
    assert(track.mediaStream, "Need mediaStream for Track");
    let isScreen = track.source == Track.Source.ScreenShare || track.source == Track.Source.ScreenShareAudio;
    let video = isScreen
      ? new ScreenShare(track.mediaStream, this)
      : new ParticipantVideo(track.mediaStream, this);
    this.conf.videos.add(video);
  }
  async removeTrack(track: Track) {
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
