import { execPiped, runAsyncMain } from "devcmd";

async function main() {
  await execPiped({
    command: "unzip",
    args: ["LanguageTool-5.4.zip"],
    options: { cwd: "../languagetool" },
  });

  await execPiped({
    command: "python3",
    args: ["copy_files.py"],
    options: { cwd: "../data" },
  });

  await execPiped({
    command: "java",
    args: [
      ...["-cp", "languagetool-server.jar"],
      "org.languagetool.server.HTTPServer",
      ...["--port", "8081"],
      ...["--allow-origin", "*"],
    ],
    options: { cwd: "../languagetool/LanguageTool-5.4" },
  });
}

runAsyncMain(main);
