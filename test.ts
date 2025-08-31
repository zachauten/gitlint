import { assertEquals } from "@std/assert";
import { footerRegex, headerRegex, types } from "./lib.ts";

interface Component {
  str: string;
  expected: boolean;
}

type TestCase = PositiveCase | NegativeCase;

interface PositiveCase {
  str: string;
  expected: true;
}

interface NegativeCase {
  str: string;
  expected: false;
  cause: string;
}

interface FooterData {
  tokens: Component[];
  separators: Component[];
  values: Component[];
}

const footerData: FooterData = {
  tokens: [
    { str: "BREAKING-CHANGE", expected: true },
    { str: "BREAKING CHANGE", expected: true },
    { str: "Reviewed-by", expected: true },
    { str: "Token", expected: true },
    { str: "Bad Token", expected: false },
  ],
  separators: [
    { str: ": ", expected: true },
    { str: "", expected: false },
    { str: ":", expected: false },
    { str: " ", expected: false },
  ],
  values: [
    { str: "#123", expected: true },
    { str: "Zach", expected: true },
    { str: "Z", expected: true },
    { str: "", expected: false },
  ],
};

Deno.test("footer", async (t) => {
  for (let i = 0; i < 10; i++) {
    for (const token of footerData.tokens) {
      for (const separator of footerData.separators) {
        for (const value of footerData.values) {
          const footer = token.str + separator.str + value.str;
          const expected = token.expected && separator.expected
            && value.expected;

          const actual = footerRegex.test(footer);
          await t.step(
            `"${footer}" should ${expected ? "" : "not"} be valid`,
            () => {
              assertEquals(expected, actual);
            },
          );
        }
      }
    }
  }
});

interface HeaderData {
  types: Component[];
  scopes: Component[];
  breakings: Component[];
  separators: Component[];
  descriptions: Component[];
}

const headerData: HeaderData = {
  types: [
    ...types.map(type => ({ str: type, expected: true })),
    { str: "blah", expected: false },
  ],
  scopes: [
    { str: "(scope)", expected: true },
    { str: "()", expected: false },
    { str: "(asdf", expected: false },
  ],
  breakings: [
    { str: "!", expected: true },
    { str: "", expected: true },
    { str: " ", expected: false },
    { str: "asdf", expected: false },
  ],
  separators: footerData.separators,
  descriptions: [
    { str: "multi word description", expected: true },
    { str: "", expected: false },
  ],
};

Deno.test("header", async (t) => {
  for (let i = 0; i < 10; i++) {
    for (const type of headerData.types) {
      for (const scope of headerData.scopes) {
        for (const breaking of headerData.breakings) {
          for (const separator of headerData.separators) {
            for (const description of headerData.descriptions) {
              const header = type.str + scope.str + breaking.str
                + separator.str + description.str;
              const expected = type.expected && scope.expected
                && breaking.expected && separator.expected && description.expected;

              const actual = headerRegex.test(header);
              await t.step(
                `"${header}" should ${expected ? "" : "not"} be valid`,
                () => {
                  assertEquals(expected, actual);
                },
              );
            }
          }
        }
      }
    }
  }
});
