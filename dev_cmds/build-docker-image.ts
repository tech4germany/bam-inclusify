import { execPiped, execToString, runAsyncMain } from "devcmd";
import { bold, cyan, green } from "kleur";
import path from "path";
import { DOCKER_COMMAND } from "./utils/commands";
import { APP_IMAGE_NAME } from "./utils/docker";
import { repoRoot } from "./utils/paths";

async function main() {
  const { stdout: gitSha } = await execToString({ command: "git", args: ["rev-parse", "HEAD"] });

  await execPiped({
    command: DOCKER_COMMAND,
    args: ["build", ...["-t", APP_IMAGE_NAME], ...["-f", path.join(repoRoot, "build/docker-release/Dockerfile")], "."],
    options: { cwd: repoRoot, env: { ...process.env, BUILD_DATE: new Date().toISOString(), VCS_REVISION: gitSha } },
  });

  console.log();
  console.log();
  console.log(green(bold("Success!")));
  console.log();
  console.log(`Your Docker image was built and is available in your Docker host with the name ${cyan(APP_IMAGE_NAME)}`);
  console.log();
  console.log("You can export it to .tgz files with the following command:");
  console.log(cyan(`  docker save ${APP_IMAGE_NAME} | gzip > ${APP_IMAGE_NAME}.docker-image.tgz`));
  console.log();
}

runAsyncMain(main);
