import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan, red } from "kleur";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { languageToolDir, reactUiDir, repoRoot } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });

  const staticFileDir = path.join(repoRoot, "server/static");

  await fs.remove(staticFileDir);
  await fs.mkdirp(staticFileDir);
  await fs.copy(path.join(reactUiDir, "build"), staticFileDir);


  // const warPackageOutputDir = path.join(warPackageProjectDir, "target");
  // const warFiles = (await fs.readdir(warPackageOutputDir, { encoding: "utf-8" })).filter((filename) =>
  //   filename.toLowerCase().endsWith(".war")
  // );
  // if (warFiles.length === 1) {
  //   console.log();
  //   console.log("Your WAR file was built and is available here:");
  //   console.log("  " + cyan(path.join(warPackageOutputDir, warFiles[0])));
  // } else {
  //   console.error(
  //     red(`Error: Expected 1 WAR file in output dir '${warPackageOutputDir}' but found ${warFiles.length}`)
  //   );
  // }
}

runAsyncMain(main);
