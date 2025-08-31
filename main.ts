import { parseArgs } from "@std/cli";
import gitlog from "gitlog";
import { parse } from "./lib.ts";

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["help", "quiet"],
    string: ["number"],
    default: { number: "1" },
    alias: {
      number: ["n"],
    },
  });

  const commits = await gitlog({
    repo: ".",
    number: parseInt(args.number),
    fields: ["abbrevHash", "rawBody"],
  });
  for (const commit of commits) {
    try {
      parse(commit.rawBody);
    } catch (error) {
      if (error instanceof Error) {
        console.error(commit.abbrevHash + ": " + error.message);
      }
    }
  }
}

main();
