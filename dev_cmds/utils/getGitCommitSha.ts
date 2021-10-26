import { execToString } from "devcmd";

export async function getGitCommitSha(): Promise<string> {
  const { stdout: gitSha } = await execToString({ command: "git", args: ["rev-parse", "HEAD"] });
  return gitSha.trim();
}
