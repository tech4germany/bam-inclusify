import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan } from "kleur";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { dataDir, reactUiDir, repoRoot, serverDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });

  const staticFileDir = path.join(serverDir, "static");
  const serverDataDir = path.join(serverDir, "data");

  await fs.remove(staticFileDir);
  await fs.mkdirp(staticFileDir);
  await fs.copy(path.join(reactUiDir, "build"), staticFileDir);

  await fs.copy(path.join(dataDir, "unified.csv"), path.join(serverDataDir, "unified.csv"));

  const serverDirName = path.relative(repoRoot, serverDir);
  const zipFileName = `${serverDirName}.zip`;
  const zipFilePath = path.join(repoRoot, zipFileName);

  await fs.remove(zipFilePath);
  await execPiped({
    command: "zip",
    args: ["-r", zipFileName, serverDirName],
    options: { cwd: repoRoot },
  });

  console.log();
  console.log("Your ZIP file was built and is available here:");
  console.log("  " + cyan(zipFilePath));
}

runAsyncMain(main);
