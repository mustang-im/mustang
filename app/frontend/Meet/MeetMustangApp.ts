import { MustangApp } from "../AppsBar/MustangApp";
import MeetApp from "./MeetApp.svelte";
import MeetSidebar from "./MeetSidebar.svelte";
import meetIcon from '../asset/icon/appBar/meet.svg?raw';

export class MeetMustangApp extends MustangApp {
  id = "meet";
  name = "Meet";
  icon = meetIcon;
  mainWindow = MeetApp;
  sidebar = MeetSidebar;
}

export const meetMustangApp = new MeetMustangApp();
