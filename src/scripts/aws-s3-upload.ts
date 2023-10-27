import { readFileSync } from "fs";
import { exit } from "node:process";

import { type PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";
import * as yargs from "yargs";

interface Arguments {
  bucketName: string;
  contentType: string;
  filePath: string;
  key: string;
}

/**
 * Argument parser with the following options; filePath, bucketName, key, contentType (optional)
 * @returns accepted arguments
 */
function Parser() {
  return yargs
    .option("filePath", {
      description: "Path to file to be uploaded",
      type: "string",
      default: "",
    })
    .option("bucketName", {
      description: "S3 bucket that file is to uploaded to",
      type: "string",
      default: "",
    })
    .option("key", {
      description: "file path in S3 bucket",
      type: "string",
      default: "",
    })
    .option("contentType", {
      description: "MIME type of file to be uploaded",
      type: "string",
      default: "text/csv",
    }).argv;
}

async function s3FileUpload(
  filePath: string,
  bucket: string,
  key: string,
  contentType: string
): Promise<number> {
  const s3 = new S3({ region: "ap-southeast-2" });

  const fileContent = readFileSync(filePath);
  const params = {
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    Body: fileContent,
  };

  const res: PutObjectCommandOutput = await s3.putObject(params);

  const statusCode = res.$metadata.httpStatusCode as number;

  return statusCode;
}

async function executeUploadFile(args: Arguments) {
  console.log("--- Uploading file to S3 bucket");
  console.log("    --- S3 bucket:", args.bucketName);
  console.log("    --- S3 key:", args.key);
  console.log("    --- Content Type:", args.contentType);
  console.log("    --- File path:", args.filePath);

  const httpStatusCode = await s3FileUpload(
    args.filePath,
    args.bucketName,
    args.key,
    args.contentType
  );

  if (httpStatusCode === 200) {
    console.log("--- File was successfully uploaded");
    return;
  }

  throw Error(
    `File uploaded encountered an error and returned httpStatusCode ${httpStatusCode}`
  );
}

(async function () {
  // parse the passed in arguments
  const argv = await Parser();

  await executeUploadFile(argv);
})().catch((err) => {
  console.error(err);
  exit(1);
});
