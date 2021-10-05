import { execPiped, runAsyncMain } from "devcmd";
import { YARN_COMMAND } from "./utils/commands";
import { reactUiDir } from "./utils/paths";

async function main() {
  await execPiped({
    command: YARN_COMMAND,
    args: ["build"],
    options: { cwd: reactUiDir },
  });
}

runAsyncMain(main);
