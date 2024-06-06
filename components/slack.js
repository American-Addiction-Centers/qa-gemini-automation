const {WebClient} = require('@slack/web-api');
const {IncomingWebhook} = require('@slack/webhook');
const fs = require('fs');

class SlackClient {
    /**
     * Sends a particular message to a specified Slack channel
     *
     * @async
     * @param {String} slack_channel_webhook: your webhook for a particular slack channel
     * @param {String} message: your message to be displayed in slack
     */
    async sendSlackMessage(slackObject) {
        const {slack_channel_webhook, message} = slackObject;
        const webhook = new IncomingWebhook(slack_channel_webhook);
        try {
            const attachments = [
                {
                    fallback: 'Attachment',
                    color: '#FFFFFF',
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: message,
                            },
                        },
                        {
                            type: 'divider',
                        },
                    ],
                },
            ];

            // Send the message with blocks to the specified channel using the IncomingWebhook
            await webhook.send({
                channel: slackObject.slack_channel_name,
                attachments: attachments,
            });

            console.log('Message sent successfully');
        } catch (error) {
            console.error(`Error sending message: ${error}`);
        }
    }

    /**
     * Sends a file to a particular channel in Slack
     *
     * @async
     * @param {String} slack_bot_api_token: your token string for slack
     * @param {String} filePath: location of your file
     * @param {String} channel: the channel you want the file to be posted to
     * @param {String} comment: your comment to be displayed in slack
     * @param {String} file_name: name of your file e.g. "output.csv"
     */
    async postFile(props) {
        const {slack_bot_api_token, filePath, channel, comment, file_name} = props;
        try {
            const client = new WebClient(slack_bot_api_token);

            // Read the file content
            const fileContent = fs.readFileSync(filePath);

            // Post the file to Slack
            const result = await client.files.upload({
                channels: channel,
                initial_comment: comment,
                title: file_name,
                file: fileContent,
                filetype: 'auto',
                filename: file_name,
            });

            console.log(result);
        } catch (error) {
            console.error(`Error sending message: ${error}`);
        }
    }
}

module.exports = SlackClient;
