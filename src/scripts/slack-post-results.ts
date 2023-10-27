import axios from "axios";
import { apiErrorMsg, fetchAwsSecret } from "./utils";

const slackWebhookEndpoint = "https://hooks.slack.com/services/";
const slackChannelIdKeyPath = "slack/channelId";
const slackTeam = "dev-team";

export interface SlackMessage {
  blocks: Block[];
}

interface Block {
  type: string;
  text?: Text;
}

interface Text {
  type: string;
  text: string;
}

export async function postToSlack(
  testResultStatus: string,
  testRunStatus: string,
  testResultsUrl: string
) {
  const testResultsStatusMarkup =
    testResultStatus === "Passed"
      ? `${testResultStatus} :success:`
      : `${testResultStatus} :failure:`;

  const data: SlackMessage = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `Scheduled ${test!.name} (api) test run has completed`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `• Test Run Status: *${testRunStatus}*\n\n • Test Results Status: *${testResultsStatusMarkup}*\n\n`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${testResultsUrl}|View test results>`,
        },
      },
    ],
  };

  const teamChannelId: string = await fetchAwsSecret(
    `${slackChannelIdKeyPath}/${slackTeam}`,
    "channel_id"
  );
  await sendSlackNotification(teamChannelId, data);
}

export async function sendSlackNotification(
  slackChannel: string,
  data: SlackMessage
) {
  try {
    const webhookUrl = slackWebhookEndpoint + slackChannel;
    const res = await axios.post(webhookUrl, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

    return res;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw Error(apiErrorMsg(err));
    } else {
      throw err;
    }
  }
}
