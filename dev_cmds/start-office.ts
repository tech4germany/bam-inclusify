import { execPiped, runAsyncMain } from "devcmd";
import path from "path";
import { YARN_COMMAND } from "./utils/commands";
import { reactUiDir } from "./utils/paths";

async function main(...args: string[]) {
  if (args.length !== 1) {
    const scriptFileName = path.basename(__filename);
    const scriptName = scriptFileName.substring(0, scriptFileName.length - path.extname(scriptFileName).length);
    console.error(`Usage:`);
    console.error(`  devcmd ${scriptName} <DOCUMENT_URL>`);
    console.error();
    console.error(`  where <DOCUMENT_URL> is an Office 365 Word document URL`);
    process.exit(1);
  }

  const [documentUrl] = args;

  await execPiped({
    command: YARN_COMMAND,
    args: ["office-addin-debugging", "start", "manifest.xml", "web", ...["--document", documentUrl]],
    options: { cwd: reactUiDir },
  });
}

runAsyncMain(main);
