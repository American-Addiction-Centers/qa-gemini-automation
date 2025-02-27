const {GoogleGenerativeAI} = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const fastcsv = require('fast-csv');
const Slack = require('./components/slack');

// access your api key as an environemnt variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const questions = [];
const results = [];

// Read questions from input.csv
fs.createReadStream(path.join(__dirname, 'data', 'input.csv'))
    .pipe(csv())
    .on('data', (row) => {
        questions.push({questions: row.questions});
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        run();
    })
    .on('error', (error) => {
        console.error('Error reading the CSV file', error);
    });

async function run() {
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

    for (const question of questions) {
        const result = await model.generateContent(question.questions, {
            temperature: 0.7,
        });
        const response = await result.response;
        const text = response.text();
        console.log(text);
        results.push({question: question.questions, answer: text});
    }

    writeresultsToCSV(results);
    // writeResultsToText(results);
}

function writeresultsToCSV(results) {
    const filePath = path.join(__dirname, 'data', 'output.csv');
    const ws = fs.createWriteStream(filePath);

    fastcsv
        .write(results, {headers: true})
        .pipe(ws)
        .on('finish', () => {
            console.log('Output CSV file successfully written');
            postToSlack();
        })
        .on('error', (error) => {
            console.error('Error writing to CSV file', error);
        });
}

const writeResultsToText = () => {
    const filePath = path.join(__dirname, 'data', 'output.txt');
    const fileContent = results
        .map((result) => `Question: ${result.question}\nAnswer: ${result.answer}\n`)
        .join('\n');

    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.error('Error writing to text file', err);
        } else {
            console.log('Output text file successfully written');
            postToSlack();
        }
    });
};

const postToSlack = () => {
    let myMessage = formatResultsForSlack(results);

    const slackProps = {
        slack_bot_api_token: process.env.SLACK_BOT_API_TOKEN,
        slack_channel_webhook: process.env.SLACK_QA_AI_AUTOMATION,
        slack_channel_name: 'qa-ai-automation',
        filePath: path.join(__dirname, 'data', 'output.csv'),
        fileName: 'output.csv',
        attachments: myMessage,
    };

    const sc = new Slack();
    sc.sendSlackMessage(slackProps);
};

const formatResultsForSlack = (results) => {
    let attachments = [];
    results.forEach((result) => {
        attachments.push(
            {
                fallback: 'Question Attachment',
                color: '#FF0000', // Red color for questions
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Question:* ${result.question}`,
                        },
                    },
                    {
                        type: 'divider',
                    },
                ],
            },
            {
                fallback: 'Answer Attachment',
                color: '#00FF00', // Green color for answers
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Answer:* ${result.answer}`,
                        },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: '──────────────────────────────────────────────────────────────────────────────────────────────────────', // Visual divider
                        },
                    },
                ],
            },
        );
    });
    return attachments;
};
