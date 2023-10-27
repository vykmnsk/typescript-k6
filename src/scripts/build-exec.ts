import { Arguments, Parser } from "../build/parseArgs";
import { executeSpawnSync } from "../build/execProcess";

async function buildExec(args: Arguments) {
  // Convert the TS to JS for the k6 engine:
  const webpackSpawn = executeSpawnSync("webpack");
  if (webpackSpawn.status !== "0") {
    throw Error("ERROR building JS files");
  }

  // Check if k6 is installed
  const k6Version = executeSpawnSync("k6", ["version"]);
  if (k6Version.status !== "0") {
    throw Error("k6 not found in PATH");
  }

  // Retrieve k6 API token (from AWS)
  const k6CloudLoginArgs = "-t ${k6ApiToken!}";
  const k6CloudLogin = executeSpawnSync(
    "k6 login cloud",
    k6CloudLoginArgs.split(" "),
    false
  );
  if (k6CloudLogin.status !== "0") {
    throw Error("ERROR logging into k6 cloud");
  }

  // Run k6
  if (args.environment === "cloud") {
    const k6ExecArgs = [
      `${args.file}`,
      "--exit-on-running",
      "--include-system-env-vars",
    ];
    const k6Exec = executeSpawnSync("k6 cloud", k6ExecArgs, false, [
      "inherit",
      "pipe",
      "inherit",
    ]);
    if (k6Exec.status !== "0") {
      throw Error("ERROR executing test on K6 Cloud");
    }
  } else {
    let k6ExecArgs = [
      `${args.file}`,
      "--rps 5",
      `-e ENVIRONMENT=${args.environment}`,
    ];

    if (args.environment === "dev") {
      k6ExecArgs = k6ExecArgs.concat(["-u 1", "-i 1", "--http-debug=full"]);
    }
    const k6Exec = executeSpawnSync("k6 run", k6ExecArgs);
    if (k6Exec.status !== "0") {
      throw Error("ERROR executing local K6 test");
    }
  }
}

(async function () {
  // parse the passed in arguments
  const argv = await Parser();
  await buildExec(argv);
})().catch((err) => {
  // throw Error to display error message and to return non zero exit code
  throw Error(`${JSON.stringify(err)}`);
});
