import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import path from "path";
import { YARN_COMMAND } from "./utils/commands";
import { languageToolDir, reactUiDir, repoRoot } from "./utils/paths";

async function main() {
  await execPiped({
    command: YARN_COMMAND,
    args: ["install"],
    options: { cwd: reactUiDir },
  });

  await fs.remove(path.join(languageToolDir, "LanguageTool-5.4"));

  await execPiped({
    command: "unzip",
    args: ["LanguageTool-5.4.zip"],
    options: { cwd: languageToolDir },
  });
}

runAsyncMain(main);
