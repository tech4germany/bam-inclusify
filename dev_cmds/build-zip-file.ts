import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan, red } from "kleur";
import path from "path";
import { cwd } from "process";
import { DEVCMD_COMMAND } from "./utils/commands";
import { dataDir, languageToolDir, reactUiDir, repoRoot } from "./utils/paths";

async function main() {
  // await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });

  const staticFileDir = path.join(repoRoot, "inclusify_server/static");
  const serverDataDir = path.join(repoRoot, "inclusify_server/data");

  await fs.remove(staticFileDir);
  await fs.mkdirp(staticFileDir);
  await fs.copy(path.join(reactUiDir, "build"), staticFileDir);

  await fs.copy(path.join(dataDir, "unified.csv"), path.join(serverDataDir, "unified.csv"));

  await execPiped({ command: "zip", args: ["-r", "inclusify_server.zip", "inclusify_server"], options: { cwd: repoRoot } });


  const zipFiles = (await fs.readdir(repoRoot, { encoding: "utf-8" })).filter((filename) =>
    filename.toLowerCase().endsWith(".zip")
  );
  if (zipFiles.length === 1) {
    console.log();
    console.log("Your ZIP file was built and is available here:");
    console.log("  " + cyan(path.join(repoRoot, zipFiles[0])));
  } else {
    console.error(
      red(`Error: Expected 1 ZIP file in output dir '${repoRoot}' but found ${zipFiles.length}`)
    );
  }
}

runAsyncMain(main);
