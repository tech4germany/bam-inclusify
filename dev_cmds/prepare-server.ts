import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { dataDir, reactUiDir, serverDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });

  const staticFileDir = path.join(serverDir, "static");

  await fs.remove(staticFileDir);
  await fs.mkdirp(staticFileDir);
  await fs.copy(path.join(reactUiDir, "build"), staticFileDir);
}

runAsyncMain(main);
