import { runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan } from "kleur";
import path from "path";
import { reactUiDir, repoRoot } from "./utils/paths";

async function main(...args: string[]) {
  if (args.length !== 1) {
    const scriptFileName = path.basename(__filename);
    const scriptName = scriptFileName.substring(0, scriptFileName.length - path.extname(scriptFileName).length);
    console.error(`Usage:`);
    console.error(`  devcmd ${scriptName} <HOST>`);
    console.error();
    console.error(
      `  where <HOST> is the host where the Office Addins gets its assets, e.g. https://inclusify.my.domain`
    );
    process.exit(1);
  }

  const [host] = args;
  if (!host.match(/^https:\/\/[\w\d]/)) {
    console.error(`Error: Given host '${host}' is not a supported URL.`);
    console.error(`Addin host URLs must start with 'https://' and contain a hostname.`);
    process.exit(1);
  }

  const oldHostname = "https://localhost:3000/";
  const newHostname = host.endsWith("/") ? host : `${host}/`;

  const manifestContents = await fs.readFile(path.join(reactUiDir, "manifest.xml"), "utf-8");
  const newManifestContents = manifestContents.replaceAll(oldHostname, newHostname);
  const newManifestFilepath = path.join(
    repoRoot,
    `manifest_${newHostname.substring(8, newHostname.length - 1).replaceAll(/[\/\:]/g, "-")}.xml`
  );

  await fs.writeFile(newManifestFilepath, newManifestContents, { encoding: "utf-8" });

  console.log();
  console.log("Your customized addin manifest was written to:");
  console.log("  " + cyan(newManifestFilepath));
}

runAsyncMain(main);
