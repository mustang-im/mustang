import { getLocalStorage } from "../../Util/LocalStorage";

export const cameraOnSetting = getLocalStorage("meet.device.cameraOn", false);
export const micOnSetting = getLocalStorage("meet.device.micOn", false);
export const selectedCameraSetting = getLocalStorage("meet.device.cameraID", null as string);
export const selectedMicSetting = getLocalStorage("meet.device.micID", null as string);
export const selectedLoudspeakerSetting = getLocalStorage("meet.device.loudspeakerID", null as string);
