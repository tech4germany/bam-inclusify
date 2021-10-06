import { execPiped, runAsyncMain } from "devcmd";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { languageToolDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["prepare-languagetool"] });

  await execPiped({
    command: "java",
    args: [
      ...["-cp", "languagetool-server.jar"],
      "org.languagetool.server.HTTPServer",
      ...["--port", "8081"],
      ...["--allow-origin", "*"],
    ],
    options: {
      cwd: path.join(
        languageToolDir,
        "languagetool",
        "languagetool-standalone",
        "target",
        "LanguageTool-5.6-SNAPSHOT",
        "LanguageTool-5.6-SNAPSHOT"
      ),
    },
  });
}

runAsyncMain(main);
