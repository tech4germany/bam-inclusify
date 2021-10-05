import { execPiped, runAsyncMain } from "devcmd";
import { dataDir } from "./utils/paths";

async function main() {
  await execPiped({
    command: "python3",
    args: ["copy_files.py"],
    options: { cwd: dataDir },
  });
}

runAsyncMain(main);
