import { execPiped, runAsyncMain } from "devcmd";
import { dataDir } from "./utils/paths";

async function main() {
  await execPiped({
    command: "python3",
    args: ["prepare_languagetool.py"],
    options: { cwd: dataDir },
  });
}

runAsyncMain(main);
