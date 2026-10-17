import { OptionValue, type StoredSetting } from "../../../Settings/Window/OptionValue";
import { expect, test } from "vitest";

class CountingSetting<S> implements StoredSetting<S> {
  writes = 0;
  protected stored: S;
  constructor(value: S) {
    this.stored = value;
  }
  get value(): S {
    return this.stored;
  }
  set value(value: S) {
    this.writes++;
    this.stored = value;
  }
}

test("A plain option writes only when the value changed", () => {
  let setting = new CountingSetting("html");
  let option = OptionValue.plain(setting);
  expect(option.value).toBe("html");
  option.save();
  expect(setting.writes).toBe(0);
  option.value = "plaintext";
  expect(option.isChanged).toBe(true);
  option.save();
  expect(setting.value).toBe("plaintext");
  expect(setting.writes).toBe(1);
});

test("Changing a value back to the original counts as unchanged", () => {
  let setting = new CountingSetting(30);
  let option = OptionValue.plain(setting);
  option.value = 60;
  option.value = 30;
  expect(option.isChanged).toBe(false);
  option.save();
  expect(setting.writes).toBe(0);
});

test("List member options on the same list keep each other's changes", () => {
  let setting = new CountingSetting<string[]>(["popup"]);
  let sound = OptionValue.listMember(setting, "sound");
  let popup = OptionValue.listMember(setting, "popup");
  expect(sound.value).toBe(false);
  expect(popup.value).toBe(true);
  sound.value = true;
  popup.value = false;
  sound.save();
  popup.save();
  expect(setting.value).toEqual(["sound"]);
});

test("A list member option keeps unknown list entries", () => {
  let setting = new CountingSetting<string[]>(["taskbar", "popup"]);
  let sound = OptionValue.listMember(setting, "sound");
  sound.value = true;
  sound.save();
  expect(setting.value).toEqual(["taskbar", "popup", "sound"]);
});

test("A list member option handles a missing list", () => {
  let setting = new CountingSetting<string[]>(null);
  let sound = OptionValue.listMember(setting, "sound");
  expect(sound.value).toBe(false);
  sound.value = true;
  sound.save();
  expect(setting.value).toEqual(["sound"]);
});

test("An equals option leaves other stored values alone unless changed", () => {
  let setting = new CountingSetting("source");
  let plainText = OptionValue.equals(setting, "plaintext", "html");
  expect(plainText.value).toBe(false);
  plainText.save();
  expect(setting.value).toBe("source");
  plainText.value = true;
  plainText.save();
  expect(setting.value).toBe("plaintext");
});

test("Turning an equals option off writes the off value", () => {
  let setting = new CountingSetting("plaintext");
  let plainText = OptionValue.equals(setting, "plaintext", "html");
  expect(plainText.value).toBe(true);
  plainText.value = false;
  plainText.save();
  expect(setting.value).toBe("html");
});
