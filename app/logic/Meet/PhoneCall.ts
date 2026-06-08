import { VideoConfMeeting } from "./VideoConfMeeting";
import { AbstractFunction } from "../util/util";

export class PhoneCall extends VideoConfMeeting {
  /** Send numbers to other end */
  async sendDTMF(digit: string) {
    throw new AbstractFunction();
  }
}
