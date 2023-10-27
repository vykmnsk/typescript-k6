import { type StdioOptions, spawnSync } from "child_process";

export interface Output {
  error?: Error;
  output?: string;
  status?: string;
  stderr: string;
  stdout: string;
}

/**
 * Executes commands using the spawnSync child process.
 * Returns results once the child process has fully closed.
 * @param command
 * @param args
 * @returns
 */
export function executeSpawnSync(
  command: string,
  args: string[] = [],
  log: boolean = true,
  stdioOptions: StdioOptions = ["inherit", "inherit", "inherit"]
): Output {
  if (log) {
    let message = command;
    if (args.length > 0) {
      message += ` ${JSON.stringify(args)}`;
    }
    console.log(`--- Executing ${message}...`);
  }

  const execProcess = spawnSync(command, args, {
    stdio: stdioOptions,
  });
  return {
    error: execProcess.error,
    output: execProcess.output?.toString(),
    status: execProcess.status?.toString(),
    stderr: execProcess.stderr?.toString(),
    stdout: execProcess.stdout?.toString(),
  };
}
