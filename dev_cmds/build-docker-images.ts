import { execPiped, runAsyncMain } from "devcmd";
import { cyan, green } from "kleur";
import path from "path";
import { DEVCMD_COMMAND, DOCKER_COMMAND } from "./utils/commands";
import { API_IMAGE_NAME, FRONTEND_IMAGE_NAME } from "./utils/docker";
import { repoRoot } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });
  await execPiped({ command: DEVCMD_COMMAND, args: ["prepare-languagetool"] });

  await execPiped({
    command: DOCKER_COMMAND,
    args: ["build", ...["-t", API_IMAGE_NAME], ...["-f", path.join(repoRoot, "build/docker-api/Dockerfile")], "."],
    options: { cwd: repoRoot },
  });

  await execPiped({
    command: DOCKER_COMMAND,
    args: [
      "build",
      ...["-t", FRONTEND_IMAGE_NAME],
      ...["-f", path.join(repoRoot, "build/docker-react-ui/Dockerfile")],
      ".",
    ],
    options: { cwd: repoRoot },
  });

  console.log();
  console.log();
  console.log(green("Success!"));
  console.log();
  console.log(
    `Your Docker images were built and are available in your Docker host with the names ${cyan(
      API_IMAGE_NAME
    )} and ${cyan(FRONTEND_IMAGE_NAME)}`
  );
  console.log();
  console.log("You can export them to .tgz files with the following command: (TODO)");
}

runAsyncMain(main);
