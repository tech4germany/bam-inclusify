import { execInTty, runAsyncMain } from "devcmd";
import path from "path";
import { DOCKER_COMMAND } from "./utils/commands";
import { FRONTEND_IMAGE_NAME } from "./utils/docker";
import { languageToolDir } from "./utils/paths";

async function main() {
  await execInTty({
    command: DOCKER_COMMAND,
    args: ["run", "-ti", "--rm", ...["-p", "8080:80"], FRONTEND_IMAGE_NAME],
    options: { cwd: path.join(languageToolDir, "LanguageTool-5.4") },
  });
}

runAsyncMain(main);
