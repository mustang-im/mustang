import { EmojiCatalog, type EmojiCategory } from "../../../Shared/Editor/EmojiCatalog";
import { expect, test } from "vitest";

const categories: EmojiCategory[] = [
  { id: "smileys", title: "Smileys", icon: "😀", emojis: [
    { emoji: "😀", name: "grinning face", keywords: ["happy", "smile"] },
    { emoji: "😢", name: "crying face", keywords: ["sad", "tear"] },
  ] },
  { id: "food", title: "Food", icon: "🍏", emojis: [
    { emoji: "🍏", name: "green apple", keywords: ["fruit", "Apple"] },
    { emoji: "🎂", name: "birthday cake", keywords: ["party", "celebration"] },
  ] },
];

test("The catalog has the emoji categories of the frontend data", () => {
  expect(EmojiCatalog.categories.length).toBeGreaterThan(5);
  expect(EmojiCatalog.categories[0].emojis.length).toBeGreaterThan(10);
});

test("An empty search term finds nothing", () => {
  expect(EmojiCatalog.search("", categories)).toEqual([]);
  expect(EmojiCatalog.search("   ", categories)).toEqual([]);
  expect(EmojiCatalog.search(null, categories)).toEqual([]);
});

test("Search matches names and keywords across categories, ignoring case", () => {
  expect(EmojiCatalog.search("face", categories).map(entry => entry.emoji)).toEqual(["😀", "😢"]);
  expect(EmojiCatalog.search("APPLE", categories).map(entry => entry.emoji)).toEqual(["🍏"]);
  expect(EmojiCatalog.search("part", categories).map(entry => entry.emoji)).toEqual(["🎂"]);
});

test("Every word of the search term must match", () => {
  expect(EmojiCatalog.search("face sad", categories).map(entry => entry.emoji)).toEqual(["😢"]);
  expect(EmojiCatalog.search("face fruit", categories)).toEqual([]);
});
