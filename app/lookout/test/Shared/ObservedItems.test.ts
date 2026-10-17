import { Tag } from "../../../logic/Abstract/Tag";
import { ObservedItems } from "../../Shared/ObservedItems";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

function newTag(name: string): Tag {
  let tag = new Tag();
  tag.name = name;
  return tag;
}

test("Emits the items when the collection or one of its items changes", () => {
  let red = newTag("Red");
  let tags = new ArrayColl<Tag>([red]);
  let emitted: string[][] = [];
  let unsubscribe = ObservedItems.of(tags).subscribe(items => emitted.push(items.map(tag => tag.name)));
  expect(emitted.at(-1)).toEqual(["Red"]);

  red.name = "Crimson";
  expect(emitted.at(-1)).toEqual(["Crimson"]);

  let blue = newTag("Blue");
  tags.add(blue);
  expect(emitted.at(-1)).toEqual(["Crimson", "Blue"]);
  blue.color = "#0000FF";
  expect(emitted.length).toBe(4);

  tags.remove(red);
  expect(emitted.at(-1)).toEqual(["Blue"]);
  let count = emitted.length;
  red.name = "Removed";
  expect(emitted.length).toBe(count);

  unsubscribe();
  blue.name = "Unobserved";
  expect(emitted.length).toBe(count);
});

test("An empty collection emits an empty list", () => {
  let emitted: Tag[][] = [];
  ObservedItems.of(new ArrayColl<Tag>()).subscribe(items => emitted.push(items))();
  expect(emitted).toEqual([[]]);
});
