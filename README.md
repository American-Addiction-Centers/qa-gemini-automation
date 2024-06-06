# QA Gemini Automation  

## Introduction ##
This app grabs questions from the ./data/input.csv file and asks them to Google's Gemini.  
Next, the app will store the question and answer in the ./data/output.csv file.  
Lastly, the app will post the ./data/output.csv file to the qa-ai-automation Slack channel.  

## Prerequisites ##
Requires node v18.12.1  
Type 'npm i' in the terminal to install necessary packages  
In the root directory add a .env file with the following:  
```
GEMINI_API_KEY=
SLACK_BOT_API_TOKEN=
```

## To run ##
In the root directory via terminal type 'node index.js' to run the app.
