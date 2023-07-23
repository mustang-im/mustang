import type { Person } from "../Abstract/Person";
import { SetColl } from 'svelte-collections';

export class VideoConfMeeting {
  ongoing = false;
  started: Date;
  ended: Date;
  participants = new SetColl<Person>();
}
