import { execPiped, runAsyncMain } from "devcmd";
import fs from "fs-extra";
import { cyan, red } from "kleur";
import path from "path";
import { DEVCMD_COMMAND } from "./utils/commands";
import { languageToolDir, reactUiDir } from "./utils/paths";

async function main() {
  await execPiped({ command: DEVCMD_COMMAND, args: ["build-react-app"] });
  await execPiped({ command: DEVCMD_COMMAND, args: ["prepare-languagetool"] });

  const warPackageProjectDir = path.join(languageToolDir, "war-package");
  const warPackageReactAppDir = path.join(warPackageProjectDir, "src/main/react-app");
  const warPackageGrammarFileDir = path.join(warPackageProjectDir, "src/main/resources/org/languagetool/rules/de");

  await fs.remove(warPackageReactAppDir);
  await fs.mkdirp(warPackageReactAppDir);
  await fs.copy(path.join(reactUiDir, "build"), warPackageReactAppDir);

  await fs.remove(warPackageGrammarFileDir);
  await fs.mkdirp(warPackageGrammarFileDir);
  const grammarXmlContents = await fs.readFile(
    path.join(languageToolDir, "LanguageTool-5.4/org/languagetool/rules/de/grammar.xml"),
    "utf-8"
  );
  const updatedGrammarXmlContents = grammarXmlContents.replace(
    '<!ENTITY UserRules SYSTEM "file:./',
    '<!ENTITY UserRules SYSTEM "classpath:'
  );
  await fs.writeFile(path.join(warPackageGrammarFileDir, "grammar.xml"), updatedGrammarXmlContents, {
    encoding: "utf-8",
  });
  // await fs.copy(
  //   path.join(languageToolDir, "LanguageTool-5.4/org/languagetool/rules/de/grammar.xml"),
  //   path.join(warPackageGrammarFileDir, "grammar.xml")
  // );
  await fs.copy(
    path.join(languageToolDir, "LanguageTool-5.4/org/languagetool/rules/de/grammar-diversity.xml"),
    path.join(warPackageGrammarFileDir, "grammar-diversity.xml")
  );

  await execPiped({
    command: "mvn",
    args: ["clean", "package"],
    options: { cwd: warPackageProjectDir },
  });

  const warPackageOutputDir = path.join(warPackageProjectDir, "target");
  const warFiles = (await fs.readdir(warPackageOutputDir, { encoding: "utf-8" })).filter((filename) =>
    filename.toLowerCase().endsWith(".war")
  );
  if (warFiles.length === 1) {
    console.log();
    console.log("Your WAR file was built and is available here:");
    console.log("  " + cyan(path.join(warPackageOutputDir, warFiles[0])));
  } else {
    console.error(
      red(`Error: Expected 1 WAR file in output dir '${warPackageOutputDir}' but found ${warFiles.length}`)
    );
  }
}

runAsyncMain(main);
