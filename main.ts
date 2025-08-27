import gitlog from "npm:gitlog";
import { parseArgs } from "jsr:@std/cli/parse-args";

type LogLevel = "debug" | "info" | "warn" | "error" | "quiet";

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

async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: ["help", "quiet"],
    string: ["level", "number"],
    default: { level: "info", number: "1" },
    alias: {
      number: ["n"],
      level: ["l"]
    }
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
    for (const commit of commits) {
      console.debug("%cDebug: parsing commit " + commit.hash, "color:blue");

      parseSubject(commit.subject);

      const [emtpy, body] = commit.rawBody.split(commits[0].subject);
      if (emtpy !== "" || !body.startsWith("\n\n")) {
        console.error("%cError: commit body does not start with an empty line", "color:red")
        console.group()
        console.error(`${commit.rawBody}`, "color:red")
        console.groupEnd();
      } else {
        parseBody(commit.body);
      }
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

export function parseSubject(subject: string): number {
  for (const type of types) {
    if (subject.startsWith(type)) {
      console.debug("%cDebug: found type " + type, "color:blue");
      const rest = subject.substring(subject.indexOf(type) + type.length);
      console.debug(`%cDebug: parsing "${rest}"`, "color:blue");
      return parseScope(rest);
    }
  }
  console.error(`%cError: subject missing valid type`, "color:red");
  console.group();
  console.error(subject);
  console.groupEnd();
  return 1;
}

function parseScope(subject: string): number {
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

function parseExclaimation(subject: string): number {
  console.debug("%cDebug: parsing '!' from " + subject, "color:blue");
  if (subject.startsWith("!")) {
    console.debug("%cDebug: found '!'", "color:blue");
    return parseColonAndSpace(subject.substring(1));
  } else {
    console.debug("%cDebug: no '!' found", "color:blue");
    return parseColonAndSpace(subject);
  }
}

function parseColonAndSpace(subject: string): number {
  console.debug("%cDebug: parsing ':' from " + subject, "color:blue");
  if (subject.startsWith(": ")) {
    console.debug("%cDebug: found ': '", "color:blue");
    return 0;
  } else {
    console.error("%cError: no ': ' found", "color:red");
    return 1;
  }
}

function parseBody(body: string) {
}

function _parseFooters() {
}

main();
