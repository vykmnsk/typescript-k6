import * as yargs from "yargs";

export interface Arguments {
  file: string;
  environment: string;
}


/**
 * Argument parser with the following options; file, environment
 * @returns accepted arguments
 */
export function Parser() {
  return yargs
    .option("file", {
      description: "Path to to test file to execute",
      demand: true,
      type: "string",
    })
    .option("environment", {
      description: "Environment to execute test on (local || cloud)",
      demand: true,
      choices: ["local", "cloud"],
      default: "local",
    }).argv;    
}
