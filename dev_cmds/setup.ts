import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import path from "path";
import { DEVCMD_COMMAND, YARN_COMMAND } from "./utils/commands";
import { dataDir, languageToolDir, reactUiDir, repoRoot } from "./utils/paths";

async function main() {
  await execPiped({
    command: YARN_COMMAND,
    args: ["install"],
    options: { cwd: reactUiDir },
  });

  await fs.remove(path.join(languageToolDir, "LanguageTool-5.5"));

  await execPiped({
    command: "unzip",
    args: ["LanguageTool-5.5.zip"],
    options: { cwd: languageToolDir },
  });

  await execPiped({ command: DEVCMD_COMMAND, args: ["prepare-languagetool"] });
}

runAsyncMain(main);
