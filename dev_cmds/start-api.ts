import { execPiped, runAsyncMain } from "devcmd";
import path from "path";
import { dataDir, languageToolDir } from "./utils/paths";

async function main() {
  await execPiped({
    command: "python3",
    args: ["copy_files.py"],
    options: { cwd: dataDir },
  });

  await execPiped({
    command: "java",
    args: [
      ...["-cp", "languagetool-server.jar"],
      "org.languagetool.server.HTTPServer",
      ...["--port", "8081"],
      ...["--allow-origin", "*"],
    ],
    options: { cwd: path.join(languageToolDir, "LanguageTool-5.4") },
  });
}

runAsyncMain(main);
