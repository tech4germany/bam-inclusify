import { execPiped, runAsyncMain } from "devcmd";
import { YARN_COMMAND } from "./utils/commands";
import { getGitCommitSha } from "./utils/getGitCommitSha";
import { reactUiDir } from "./utils/paths";

async function main() {
  await execPiped({
    command: YARN_COMMAND,
    args: ["start"],
    options: {
      cwd: reactUiDir,
      env: {
        ...process.env,
        REACT_APP_VCS_REVISION: process.env.VCS_REVISION || (await getGitCommitSha()),
      },
    },
  });
}

runAsyncMain(main);
