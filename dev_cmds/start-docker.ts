import { execInTty, runAsyncMain } from "devcmd";
import { DOCKER_COMMAND } from "./utils/commands";
import { APP_IMAGE_NAME } from "./utils/docker";

async function main() {
  await execInTty({
    command: DOCKER_COMMAND,
    args: ["run", "-ti", "--rm", ...["-p", "80:8081"], APP_IMAGE_NAME],
  });
}

runAsyncMain(main);
