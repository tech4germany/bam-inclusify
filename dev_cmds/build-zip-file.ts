import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan } from "kleur";
import path from "path";
import archiver from "archiver";
import { DEVCMD_COMMAND } from "./utils/commands";
import { repoRoot, serverDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["prepare-server"] });

  const serverDirName = path.relative(repoRoot, serverDir);
  const zipFileName = `${serverDirName}.zip`;
  const zipFilePath = path.join(repoRoot, zipFileName);

  await fs.remove(zipFilePath);

  console.log();
  console.log("Creating ZIP file...");
  await createServerZip(serverDir, zipFilePath);

  console.log();
  console.log("Your ZIP file was built and is available here:");
  console.log("  " + cyan(zipFilePath));
}

function createServerZip(serverDir: string, zipFilePath: string) {
  const output = fs.createWriteStream(zipFilePath);
  const outputCompletionPromise = new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("finish", () => resolve());
    output.on("error", (e) => reject(e));
  });

  const archive = archiver("zip");
  archive.pipe(output);

  const serverDirName = path.relative(repoRoot, serverDir);
  archive.directory(serverDir, serverDirName);

  const archiveFinalizePromise = archive.finalize();
  return Promise.all([outputCompletionPromise, archiveFinalizePromise]);
}

runAsyncMain(main);
