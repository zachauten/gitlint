import { assertEquals } from "@std/assert";
import { parseSubject } from "./main.ts";

// TODO: Add tests for each type

Deno.test("feat(scope)!: a type, scope, !, :, and description", () => {
  const res = parseSubject(
    "feat(scope)!: a type, scope, !, :, and description",
  );
  assertEquals(res, 0);
});

Deno.test("feat!: a type, !, :, and description", () => {
  const res = parseSubject("feat!: a type, !, :, and description");
  assertEquals(res, 0);
});

Deno.test("feat: a subject description", () => {
  const res = parseSubject("feat: a subject description");
  assertEquals(res, 0);
});

Deno.test("feat(scope): a type, scope, :, and description", () => {
  const res = parseSubject("feat(scope): a type, scope, :, and description");
  assertEquals(res, 0);
});

Deno.test("empty string", () => {
  const res = parseSubject("");
  assertEquals(res, 1);
});

Deno.test(": no type", () => {
  const res = parseSubject(": no type");
  assertEquals(res, 1);
});

Deno.test("no semicolon", () => {
  const res = parseSubject("no semicolon");
  assertEquals(res, 1);
});

Deno.test("invalid feature: ", () => {
  const res = parseSubject("invalid feature: ");
  assertEquals(res, 1);
});

Deno.test("feat:missing space", () => {
  const res = parseSubject("feat:missing space");
  assertEquals(res, 1);
});
