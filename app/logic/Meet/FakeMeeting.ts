import { VideoConfMeeting, MeetingState } from "./VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "./Participant";
import { ParticipantVideo } from "./VideoStream";
import { MeetAccount } from "./MeetAccount";
import { LocalMediaDeviceStreams } from "./LocalMediaDeviceStreams";
import { PersonUID } from "../Abstract/PersonUID";
import { assert } from "../util/util";
import { getUILocale } from "../../l10n/l10n";

export class FakeMeeting extends VideoConfMeeting {

  constructor() {
    super();
    this.id = crypto.randomUUID();
    this.account = new MeetAccount();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
  }

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
  }

  async createNewConference() {
    let time = new Date().toLocaleString(getUILocale(), { hour: "numeric", minute: "numeric" });
    this.title = `Meeting ${time}`;
    this.state = MeetingState.Init;
  }

  async start() {
    assert(this.id, "Need to create the conference first");
    await super.start();
    this.myParticipant = new MeetingParticipant();
    this.myParticipant.id = crypto.randomUUID();
    this.myParticipant.name = "Me";
    this.myParticipant.role = ParticipantRole.Moderator;
    this.state = MeetingState.Ongoing;

    for (let i = 0; i < 5; i++) {
      await this.addParticipant();
    }
    this.setSpeakerRandomly();
  }

  async addParticipant(person?: PersonUID) {
    let p = new MeetingParticipant();
    p.id = crypto.randomUUID();
    p.name = person?.name ?? "User " + p.id.substring(0, 3);
    p.role = ParticipantRole.User;
    p.cameraOn = true;
    p.micOn = true;

    /*
    let video = document.createElement('video');
    video.src = "https://www.mustang.im/videos/ocean-birds.mp4"; // captureStream() denied for cross-domain
    video.muted = true; // Required for autoplay in most browsers
    await video.play();
    let stream = video.captureStream();
    */
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    this.participants.add(p);
    this.videos.add(new ParticipantVideo(stream, p));
  }

  async removeParticipant(participant?: MeetingParticipant) {
    participant ??= this.participants.first;
    this.videos.removeAll(this.videos.filter(v => v instanceof ParticipantVideo && v.participant == participant));
    this.participants.remove(participant);
  }

  setSpeakerRandomly() {
    let speaker = this.participants.contents[Math.floor(Math.random() * this.participants.length)];
    speaker.isSpeaking = true;
    let nextTime = Math.random() * 10 * 1000;
    setTimeout(() => this.setSpeakerRandomly(), nextTime);
    setTimeout(() => speaker.isSpeaking = false, nextTime + Math.random() * 2 * 1000 - 1000);
  }

  readonly canHandUp = true;
}
