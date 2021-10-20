import { resolve } from "path";

const repoRoot = resolve(__dirname, "..", "..");

const dataDir = resolve(repoRoot, "data");
const languageToolDir = resolve(repoRoot, "languagetool");
const reactUiDir = resolve(repoRoot, "react-ui");
const serverDir = resolve(repoRoot, "inclusify_server");

export { repoRoot, dataDir, languageToolDir, reactUiDir, serverDir };
