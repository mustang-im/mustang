import { assert } from "../../util/util";

function unescaped(value: string): string {
  return value.replace(/\\n|\\(.)/gi, (_, c) => c || "\n");
}

export class ICalEntry {
  properties: Record<string, string> = Object.create(null);
  name: string;
  value: string;
  values: string[];
  line: string;
  constructor(line: string) {
    this.line = line;
    let pos = line.search(/[;:]/);
    this.name = line.slice(0, pos).replace(/.+\./, "").toLowerCase();
    line = line.slice(pos);
    while (/^;([-\w]+)=("?)((\\?.)*?)\2(?=[;:])/.test(line)) {
      let value = this.properties[RegExp.$1.toLowerCase()];
      this.properties[RegExp.$1.toLowerCase()] = (value ? value + "," : "") + unescaped(RegExp.$3);
      line = RegExp.rightContext;
    }
    this.value = unescaped(line.slice(1));
    this.values = line.match(/(^:|;)(\\?.)*?(?=;|$)/g).map(value => unescaped(value.slice(1)));
  }
}

class ICalContainer {
  entries: Record<string, ICalEntry[]> = Object.create(null);
  parent: ICalContainer | ICalParser;
  constructor(parent: ICalContainer | ICalParser) {
    this.parent = parent;
  }
}

export default class ICalParser {
  containers: Record<string, ICalContainer[]> = Object.create(null);
  constructor(calendar: string) {
    let current: ICalContainer | ICalParser = this;
    for (let line of calendar.replace(/[\r\n]+/g, "\n").replace(/\n\s|\n$/g, "").split("\n")) {
      if (/^BEGIN:([-\w]+)$/.test(line)) {
        let name = RegExp.$1.toLowerCase();
        current = new ICalContainer(current);
        this.containers[name] = append(this.containers[name], current);
      } else if (/^END:([-\w]+)$/.test(line)) {
        let name = RegExp.$1.toLowerCase();
        assert(this.containers[name] && this.containers[name].at(-1) == current, "END without matching BEGIN");
        assert(current instanceof ICalContainer, "END without BEGIN");
        current = current.parent;
      } else {
        assert(current instanceof ICalContainer, "item outside container");
        let item = new ICalEntry(line);
        current.entries[item.name] = append(current.entries[item.name], item);
      }
    }
  }
}

function append<T>(values: T[] | undefined, value: T): T[] {
  values ||= [];
  values.push(value);
  return values;
}
