const {WebClient} = require('@slack/web-api');
const {IncomingWebhook} = require('@slack/webhook');
const fs = require('fs');
const axios = require('axios');

class SlackClient {
    /**
     * Sends a particular message to a specified Slack channel
     *
     * @async
     * @param {Object} slackObject: Object containing slack channel webhook and attachments
     */
    async sendSlackMessage(slackObject) {
        const {
            slack_channel_webhook,
            slack_channel_name,
            attachments,
            filePath,
            fileName,
            slack_bot_api_token,
        } = slackObject;
        const webhook = new IncomingWebhook(slack_channel_webhook);
        const client = new WebClient(slack_bot_api_token);
        try {
            await webhook.send({
                text: 'Gemini Question & Answer Automation Report:',
                attachments: attachments, // Send the attachments payload
            });

            console.log('Message sent successfully');

            //posts logs.txt to slack
            const fileContent = fs.readFileSync(filePath);
            const externalUrlResponse = await client.files.getUploadURLExternal({
                token: process.env.SLACK_BOT_API_TOKEN,
                filename: fileName,
                length: fileContent.length,
            });

            const uploadUrl = externalUrlResponse.upload_url;
            const fileId = externalUrlResponse.file_id;

            await axios.post(uploadUrl, fileContent, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });

            const result = await client.files.completeUploadExternal({
                token: process.env.SLACK_BOT_API_TOKEN,
                files: [{"id": fileId, "title": "Results CSV:"}],
                channel_id: "C075PQP4BM4",
                initial_comment: 'Results CSV:',
            });

            console.log(result);
        } catch (error) {
            console.error(`Error sending message: ${error}`);
        }
    }
}

module.exports = SlackClient;
