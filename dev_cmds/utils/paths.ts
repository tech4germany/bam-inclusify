import { resolve } from "path";

const repoRoot = resolve(__dirname, "..", "..");

const dataDir = resolve(repoRoot, "data");
const reactUiDir = resolve(repoRoot, "react-ui");
const serverDir = resolve(repoRoot, "inclusify_server");

export { repoRoot, dataDir, reactUiDir, serverDir };
