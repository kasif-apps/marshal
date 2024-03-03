import * as mod from "https://deno.land/std@0.218.2/cli/parse_args.ts";
import * as path from "https://deno.land/std@0.201.0/path/mod.ts";
import Marshal from "./mod.ts";

const args = mod.parseArgs(Deno.args);

if (!args._[0] || typeof args._[0] !== "string") {
  console.error("No command provided");
  Deno.exit(1);
}

const baseDir = Deno.cwd();

switch (args._[0]) {
  case "encode":
    await encode();
    break;
  case "decode":
    decode();
    break;
  default:
    console.error("Invalid command: ", args[0]);
    Deno.exit(1);
}

async function encode() {
  if (typeof args._[1] !== "string") {
    console.error("No input file provided");
    Deno.exit(1);
  }

  const input = path.join(baseDir, args._[1]);
  const output = args.out
    ? path.join(baseDir, args.out)
    : path.parse(input).name + ".bin";

  try {
    const content = await Deno.readTextFile(input);
    const encoded = Marshal.encode(JSON.parse(content));

    await Deno.writeFile(output, encoded);
  } catch (error) {
    console.error(`Failed to marhal file: ${error}`);
    Deno.exit(1);
  }
}

async function decode() {
  if (typeof args._[1] !== "string") {
    console.error("No input file provided");
    Deno.exit(1);
  }

  const input = path.join(baseDir, args._[1]);
  const output = args.out
    ? path.join(baseDir, args.out)
    : path.parse(input).name + ".json";

  try {
    const content = await Deno.readFile(input);
    const decoded = Marshal.decode(content);

    await Deno.writeTextFile(output, JSON.stringify(decoded));
  } catch (error) {
    console.error(`Failed to unmarshal file: ${error}`);
    Deno.exit(1);
  }
}
