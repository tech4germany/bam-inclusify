import { execPiped, runAsyncMain } from "devcmd";
import { repoRoot } from "./utils/paths";

async function main() {
  await execPiped({
    command: "bash",
    args: [
      "-c",
      [
        "source $(conda info --base)/etc/profile.d/conda.sh",
        "conda activate inclusify",
        "pip install -r inclusify_server/requirements.in",
        "gunicorn inclusify_server.app:app --bind localhost:8081 --timeout 90",
      ].join(" && "),
    ],
    options: {
      cwd: repoRoot,
    },
  });
}

runAsyncMain(main);
