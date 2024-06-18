const {WebClient} = require('@slack/web-api');
const {IncomingWebhook} = require('@slack/webhook');
const fs = require('fs');

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
            const result = await client.files.upload({
                channels: slack_channel_name,
                title: 'Results CSV',
                file: fileContent,
                filetype: 'auto',
                filename: 'output.csv',
            });

            console.log(result);
        } catch (error) {
            console.error(`Error sending message: ${error}`);
        }
    }
}

module.exports = SlackClient;
