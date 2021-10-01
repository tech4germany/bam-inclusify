import { resolve } from "path";

const repoRoot = resolve(__dirname, "..", "..");

const dataDir = resolve(repoRoot, "data");
const languageToolDir = resolve(repoRoot, "languagetool");
const reactUiDir = resolve(repoRoot, "react-ui");

export { repoRoot, dataDir, languageToolDir, reactUiDir };
