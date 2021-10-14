import { execInTty, runAsyncMain } from "devcmd";
import path from "path";
import { DOCKER_COMMAND } from "./utils/commands";
import { repoRoot } from "./utils/paths";

async function main() {
  const tomcatDir = path.join(repoRoot, "build/tomcat");

  await execInTty({
    command: DOCKER_COMMAND,
    args: [
      "run",
      "--rm",
      "-it",
      ...["--name", "tomcat-tester"],
      ...["-p", "8080:8080"],
      ...["-v", `${path.join(tomcatDir, "context.xml")}:/tmp/context.xml`],
      ...["-v", `${path.join(tomcatDir, "tomcat-users.xml")}:/usr/local/tomcat/conf/tomcat-users.xml`],
      "tomcat:8.5",
      "/bin/bash",
      "-c",
      [
        "mv /usr/local/tomcat/webapps /usr/local/tomcat/webapps2",
        "mv /usr/local/tomcat/webapps.dist /usr/local/tomcat/webapps",
        "cp /tmp/context.xml /usr/local/tomcat/webapps/manager/META-INF/context.xml",
        "catalina.sh run",
      ].join(" && "),
    ],
    options: { cwd: repoRoot },
  });
}

runAsyncMain(main);
