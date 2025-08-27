import gitlog from "npm:gitlog";
import { parseArgs } from "jsr:@std/cli/parse-args";

async function main() {
  const flags = parseArgs(Deno.args, {
  boolean: ["help"],
  string: ["number"],
  default: { number: "1" },
  });

  const number = parseInt(flags.number);

  try {
    const commits = await gitlog({
      repo: "./",
      number,
      fields: ["subject", "body", "hash"]
    })
    console.log(commits);
  } catch(error) {
    if(/fatal: your current branch '\w+' does not have any commits yet/.test((error as Error).message)) {
      console.error("Error: repository does not have any commits");
    }
  }
}

main();