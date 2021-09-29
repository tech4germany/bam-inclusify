import { execPiped, runAsyncMain } from "devcmd";

async function main() {
  await execPiped({
    command: "yarn",
    args: ["start"],
    options: { cwd: "../react-ui" },
  });
}

runAsyncMain(main);
