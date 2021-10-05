import { execPiped, runAsyncMain } from "devcmd";
import { cyan, green } from "kleur";
import path from "path";
import { DOCKER_COMMAND } from "./utils/commands";
import { API_IMAGE_NAME } from "./utils/docker";
import { dataDir, repoRoot } from "./utils/paths";

async function main() {
  await execPiped({
    command: "python3",
    args: ["copy_files.py"],
    options: { cwd: dataDir },
  });

  await execPiped({
    command: DOCKER_COMMAND,
    args: ["build", ...["-t", API_IMAGE_NAME], ...["-f", path.join(repoRoot, "build/docker-api/Dockerfile")], "."],
    options: { cwd: repoRoot },
  });

  console.log();
  console.log();
  console.log(green("Success!"));
  console.log();
  console.log(
    `Your Docker images were built and are available in your Docker host with the names ${cyan(API_IMAGE_NAME)}`
  );
  console.log();
  console.log("You can export them to .tgz files with the following command: (TODO)");
}

runAsyncMain(main);
