import gitlog from "npm:gitlog";
import { parseArgs } from "jsr:@std/cli/parse-args";

type LogLevel = "debug" | "info" | "warn" | "error" | "quiet";

type CommitError = { messages: string[]; body: string };
3;
const types = [
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

export async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: ["help", "quiet"],
    string: ["level", "number"],
    default: { level: "info", number: "1" },
    alias: {
      number: ["n"],
      level: ["l"],
    },
  });

  if (flags.quiet) {
    setLogLevel("quiet");
  } else {
    setLogLevel(flags.level as LogLevel);
  }

  const number = parseInt(flags.number);

  try {
    const commits = await gitlog({
      repo: "./",
      number,
      fields: ["subject", "body", "hash", "rawBody"],
    });
    console.debug("%cDebug: found commits ", "color:blue", commits);

    const errors: Record<string, CommitError> = {};
    for (const commit of commits) {
      const messages = parseCommit(commit);
      if (messages.length > 0) {
        errors[commit.hash] = { messages, body: commit.rawBody };
      }
    }

    logErrors(errors);

    if (Object.keys(errors).length > 0) {
      Deno.exit(1);
    }
  } catch (error) {
    if (
      /fatal: your current branch '\w+' does not have any commits yet/.test(
        (error as Error).message,
      )
    ) {
      console.error(
        "%cError: repository does not have any commits",
        "color:red",
      );
    }
  }
}

// deno-lint-ignore no-explicit-any
function parseCommit(commit: any): string[] {
  console.debug("%cDebug: parsing commit " + commit.hash, "color:blue");

  const errors: string[] = [];

  const message = parseSubject(commit.subject);
  if (message) {
    errors.push(message);
  }

  const [emtpy, body] = commit.rawBody.split(commit.subject);
  if (emtpy !== "" || !body.startsWith("\n\n")) {
    errors.push("commit body does not start with an empty line");
  } else {
    parseBody(commit.body);
  }

  return errors;
}

function logErrors(errors: Record<string, CommitError>) {
  for (const [hash, error] of Object.entries(errors)) {
    console.error(`${hash}`);
    console.group();
    console.error(`%c${error.body}`, "color:blue");
    for (const message of error.messages) {
      console.error(`%c- ${message}`, "color:red");
    }
    console.groupEnd();
    console.error();
  }
}

function setLogLevel(level: LogLevel) {
  switch (level) {
    /* falls through */
    case "quiet":
      console.error = () => {};
    /* falls through */
    case "error":
      console.warn = () => {};
    /* falls through */
    case "warn":
      console.info = () => {};
      console.log = () => {};
    /* falls through */
    case "info":
      console.debug = () => {};
  }
}

export function parseSubject(subject: string): string | null {
  for (const type of types) {
    if (subject.startsWith(type)) {
      console.debug("%cDebug: found type " + type, "color:blue");
      const rest = subject.substring(subject.indexOf(type) + type.length);
      console.debug(`%cDebug: parsing "${rest}"`, "color:blue");
      return parseScope(rest);
    }
  }
  return "subject missing valid type";
}

function parseScope(subject: string): string | null {
  console.debug("%cDebug: parsing scope from " + subject, "color:blue");
  const match = subject.match(/^(\(\w+\))(.+)$/);
  if (!match) {
    console.debug("%cDebug: no scope found", "color:blue");
    return parseExclaimation(subject);
  } else {
    console.debug("%cDebug: found scope " + match[1], "color:blue");
    return parseExclaimation(match[2]);
  }
}

function parseExclaimation(subject: string): string | null {
  console.debug("%cDebug: parsing '!' from " + subject, "color:blue");
  if (subject.startsWith("!")) {
    console.debug("%cDebug: found '!'", "color:blue");
    return parseColonAndSpace(subject.substring(1));
  } else {
    console.debug("%cDebug: no '!' found", "color:blue");
    return parseColonAndSpace(subject);
  }
}

function parseColonAndSpace(subject: string): string | null {
  console.debug("%cDebug: parsing ':' from " + subject, "color:blue");
  if (subject.startsWith(": ")) {
    console.debug("%cDebug: found ': '", "color:blue");
    return null;
  } else {
    return "no ': ' found";
  }
}

function parseBody(_body: string) {
}

function _parseFooters() {
}