const {GoogleGenerativeAI} = require('@google/generative-ai');
require('dotenv').config();

// access your api key as an environemnt variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

    const prompt =
        'Does American Addiction Centers offer alcohol abuse rehab? If so, can you give me the link please?';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
}

run();
