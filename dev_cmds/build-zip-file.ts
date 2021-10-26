import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan } from "kleur";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { repoRoot, serverDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["prepare-server"] });

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
