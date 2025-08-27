import { assert, assertEquals } from "@std/assert";
import { parseSubject } from "./lib.ts";

// TODO: Add tests for each type

Deno.test("feat(scope)!: a type, scope, !, :, and description", () => {
  const res = parseSubject(
    "feat(scope)!: a type, scope, !, :, and description",
  );
  assertEquals(res, null);
});

Deno.test("feat!: a type, !, :, and description", () => {
  const res = parseSubject("feat!: a type, !, :, and description");
  assertEquals(res, null);
});

Deno.test("feat: a subject description", () => {
  const res = parseSubject("feat: a subject description");
  assertEquals(res, null);
});

Deno.test("feat(scope): a type, scope, :, and description", () => {
  const res = parseSubject("feat(scope): a type, scope, :, and description");
  assertEquals(res, null);
});

Deno.test("empty string", () => {
  const res = parseSubject("");
  assert(res != null);
});

Deno.test(": no type", () => {
  const res = parseSubject(": no type");
  assert(res != null);
});

Deno.test("no semicolon", () => {
  const res = parseSubject("no semicolon");
  assert(res != null);
});

Deno.test("invalid feature: ", () => {
  const res = parseSubject("invalid feature: ");
  assert(res != null);
});

Deno.test("feat:missing space", () => {
  const res = parseSubject("feat:missing space");
  assert(res != null);
});
