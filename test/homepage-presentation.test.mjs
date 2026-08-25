import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the homepage opens as a definition-first learning surface", async () => {
  const home = await read("src/pages/index.astro");

  assert.match(home, /LearnArrival/);
  assert.match(home, /LearnFirstLesson/);
  assert.match(home, /LearnPaths/);
  assert.match(home, /LearnCommunity/);
  assert.match(home, /LearnStart/);
  assert.match(home, /class="learn-home"/);
  assert.doesNotMatch(home, /independent publication|transmission bands|Release algebra|learn-feature/);
});

test("the homepage exposes learning paths, community records, and a daily koan", async () => {
  const [home, community, site] = await Promise.all([
    read("src/pages/index.astro"),
    read("src/components/learn-home/LearnCommunity.astro"),
    read("src/lib/site.ts")
  ]);

  assert.match(home, /await getArticles\(\)/);
  assert.match(home, /getCollection\("profiles"/);
  assert.match(home, /const dailyLesson = KOANS\[buildDay % KOANS\.length\]/);
  assert.match(home, /lessonBySlug\("first-value"\)/);
  assert.match(home, /lessonBySlug\("double-it"\)/);
  assert.match(home, /lessonBySlug\("threaded-data"\)/);
  assert.match(home, /LearnCommunity/);
  assert.match(home, /LearnFirstLesson/);
  assert.match(community, /\/feed\.xml/);
  assert.match(community, /\/feed\.json/);
  assert.match(community, /\/sources\.opml/);
  assert.match(site, /post: "\/post"/);
  assert.match(site, /profile: "\/me"/);
  assert.match(site, /sources: "\/submit"/);
  assert.match(site, /agents: "\/agents"/);
  assert.match(site, /registerAgent: "\/agents\/register"/);
  assert.doesNotMatch(site, /issues\/new\?template/);
});

test("the shared navigation uses community language", async () => {
  const layout = await read("src/layouts/SiteLayout.astro");

  assert.match(layout, /import ContextNav from "@hara-lang\/ui-astro\/astro\/v2\/ContextNav\.astro"/);
  assert.match(layout, /const learnNav = \[/);
  assert.match(layout, /\{ href: "\/articles", label: "Feed" \}[\s\S]*?\{ href: "\/people", label: "People" \}[\s\S]*?\{ href: "\/agents", label: "Agents" \}[\s\S]*?\{ href: "\/learn\/koans\/", label: "Koans" \}[\s\S]*?\{ href: "\/sources", label: "Sources" \}/);
  assert.match(layout, /<ContextNav[\s\S]*?items=\{learnNav\}[\s\S]*?label="Hara Learn navigation"/);
  assert.match(layout, /<a href="\/submit">Add a feed<\/a>[\s\S]*?<a class="learn-post-action"/);
  assert.match(layout, /Lessons, posts, people, agents, and feeds from the Hara community\./);
  assert.match(layout, /Register an agent/);
});
