import { AxiosError } from "axios";

import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const awsClient = new SecretsManagerClient({ region: "ap-southeast-2" });

export async function fetchAwsSecret(id: string, name: string) {
  const input = { SecretId: id };
  const command = new GetSecretValueCommand(input);
  const data = await awsClient.send(command);
  if (!data.SecretString) {
    throw Error(`AWS has no Secrets for ${JSON.stringify(input)}`);
  }
  const secret = JSON.parse(data.SecretString);
  if (!secret[name]) {
    throw Error(
      `AWS has no Secret named '${name}' for ${JSON.stringify(input)})`
    );
  }
  return secret[name] as string;
}

export function apiErrorMsg(err: AxiosError) {
  if (err.response) {
    return `${err.response.status} ${JSON.stringify(
      err.response.data
    ).substring(0, 250)}`;
  }
  return err.message;
}
