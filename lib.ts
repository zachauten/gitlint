/**
 * 8. One or more footers MAY be provided one blank line after the body. Each footer MUST consist of a word token, followed by either a :<space> or <space># separator, followed by a string value (this is inspired by the git trailer convention).
 *
 * Forcing footer keys to end with ":", and values must not end with whitespace.
 */

export const footerRegex = /^(?<key>[\w-]+|BREAKING CHANGE|BREAKING-CHANGE):\s(?<value>.+)$/;

export const headerRegex =
  /^(?<type>build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\((?<scope>[\w-]+)\))?(?<breaking>!)?: (?<description>.+)/;

export const types = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

export function parse(commit: string): ConventionalCommit {
  const split = commit.split("\n");
  const [header, ...body] = split;

  const match = headerRegex.exec(header);

  if (match === null) {
    throw new Error(`invalid header line: ${header}`);
  }

  if (header.length > 72) {
    throw new Error(`header must be less than 72 characters: ${header}`);
  }

  const type = match.groups!.type;

  if (!types.includes(type)) {
    throw new Error(
      `type "${type}" is not valid, must be one of: ${types.join(", ")}`,
    );
  }

  const breaking = match.groups!.breaking === "!";

  if (body.length === 0 && breaking) {
    throw new Error("breaking changes must be described in body or footers");
  } else if (body.length === 0) {
    return {
      type,
      scope: match.groups!.scope ?? null,
      description: match.groups!.description,
      body: null,
      footers: {},
      breaking,
    };
  }

  const footers: Record<string, string> = {};

  let wasFooter = false;
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    const prev = body[i - 1];
    const match = footerRegex.exec(line);
    if (wasFooter && !match) {
      throw new Error(`encountered invalid footer: ${line}`);
    } else if (match && prev !== "") {
      throw new Error(`footer not preceded by blank line: ${prev}`);
    } else if (match) {
      footers[match.groups!.key] = match.groups!.value;
    }
    wasFooter = !!match;
  }
  return {
    type,
    scope: match.groups!.scope ?? null,
    description: match.groups!.description,
    body: body.join("\n"), // TOOD: exclude footers
    footers,
    breaking,
  };
}

export interface ConventionalCommit {
  type: string;
  scope: string | null;
  description: string;
  body: string | null;
  footers: Record<string, string>;
  breaking: boolean;
}
