import { execInTty, runAsyncMain } from "devcmd";
import path from "path";
import { DOCKER_COMMAND } from "./utils/commands";
import { API_IMAGE_NAME } from "./utils/docker";
import { languageToolDir } from "./utils/paths";

async function main() {
  await execInTty({
    command: DOCKER_COMMAND,
    args: ["run", "-ti", "--rm", ...["-p", "8081:8081"], API_IMAGE_NAME],
    options: { cwd: path.join(languageToolDir, "LanguageTool-5.4") },
  });
}

runAsyncMain(main);
