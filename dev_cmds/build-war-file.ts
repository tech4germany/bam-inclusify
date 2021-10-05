import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan, red } from "kleur";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { languageToolDir, reactUiDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });

  const warPackageProjectDir = path.join(languageToolDir, "war-package");
  const warPackageReactAppDir = path.join(warPackageProjectDir, "src/main/react-app");

  await fs.remove(warPackageReactAppDir);
  await fs.mkdirp(warPackageReactAppDir);
  await fs.copy(path.join(reactUiDir, "build"), warPackageReactAppDir);

  await execPiped({
    command: "mvn",
    args: ["clean", "package"],
    options: { cwd: warPackageProjectDir },
  });

  const warPackageOutputDir = path.join(warPackageProjectDir, "target");
  const warFiles = (await fs.readdir(warPackageOutputDir, { encoding: "utf-8" })).filter((filename) =>
    filename.toLowerCase().endsWith(".war")
  );
  if (warFiles.length === 1) {
    console.log();
    console.log("Your WAR file was built and is available here:");
    console.log("  " + cyan(path.join(warPackageOutputDir, warFiles[0])));
  } else {
    console.error(
      red(`Error: Expected 1 WAR file in output dir '${warPackageOutputDir}' but found ${warFiles.length}`)
    );
  }
}

runAsyncMain(main);
