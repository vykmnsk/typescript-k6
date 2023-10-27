import { writeFile } from "fs";
import { exit } from "node:process";

import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import * as yargs from "yargs";

import { executeSpawnSync } from "../build/execProcess";

interface Arguments {
  bucketName: string;
  destinationPath: string;
  key: string;
  ci: boolean;
}

/**
 * Argument parser with the following options; filePath, bucketName, key
 * @returns accepted arguments
 */
function Parser() {
  return yargs
    .option("destinationPath", {
      description: "Path to file to be downloaded to",
      type: "string",
      default: "",
    })
    .option("bucketName", {
      description: "S3 bucket that file resides in",
      type: "string",
      default: "",
    })
    .option("key", {
      description: "file path in S3 bucket",
      type: "string",
      default: "",
    })
    .option("ci", {
      description: "is part of CI pipeline",
      type: "boolean",
      default: false,
    }).argv;
}

async function s3LatestFileDownload(args: Arguments): Promise<number> {
  let latestFile = "";
  const s3 = new S3({ region: "ap-southeast-2" });

  const params = {
    Bucket: args.bucketName,
    Key: args.key,
  };

  const listObjectsResponse = await s3.listObjectsV2(params);

  if (
    listObjectsResponse &&
    listObjectsResponse.Contents &&
    listObjectsResponse.Contents.length > 0
  ) {
    const latestObject = listObjectsResponse.Contents.reduce((prev, current) =>
      prev.LastModified! > current.LastModified! ? prev : current
    );

    if (latestObject.Key) {
      latestFile = latestObject.Key;
    } else {
      throw Error(
        `File ${params.Key} was not found in ${params.Bucket} bucket.`
      );
    }
  }

  const getObject = new GetObjectCommand({
    Bucket: params.Bucket,
    Key: latestFile,
  });

  const response = await s3.send(getObject);

  if (response.Body) {
    const byteArray = await response.Body.transformToByteArray();
    const filePath = args.destinationPath + latestFile;

    await saveByteArrayToFile(byteArray, filePath);

    if (args.ci) {
      console.log("--- Trace file path:", filePath);

      const buildkiteAgentArgs = `meta-data set BASE_TRACE_FILE_PATH ${filePath}`;
      executeSpawnSync("buildkite-agent", buildkiteAgentArgs.split(" "), false);
    }
  }

  return response.$metadata.httpStatusCode as number;
}

async function saveByteArrayToFile(
  byteArray: Uint8Array,
  filePath: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    writeFile(filePath, byteArray, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function executeDownloadLatestFile(args: Arguments) {
  console.log("--- Download file to S3 bucket");
  console.log("    --- S3 bucket:", args.bucketName);
  console.log("    --- S3 key:", args.key);
  console.log("    --- Destination path:", args.destinationPath);
  console.log("    --- Is CI:", args.ci);

  const httpStatusCode = await s3LatestFileDownload(args);

  if (httpStatusCode === 200) {
    console.log("--- File was successfully downloaded");
    return;
  }

  throw Error(
    `File download encountered an error and returned httpStatusCode ${httpStatusCode}`
  );
}

(async function () {
  // parse the passed in arguments
  const argv = await Parser();

  await executeDownloadLatestFile(argv);
})().catch((err) => {
  console.error(err);
  exit(1);
});
