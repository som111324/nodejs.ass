const { google } = require('googleapis');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { setGoogleCredentials, getGoogleOAuthClient } = require('./oauthGoogle');
const openai = require('openai');

// Assuming OPENAI_API_KEY is set in your environment variables
const apiKey = process.env.OPENAI_API_KEY;

const categorizeEmail = async (content) => {
    try {
        const response = await openai.completions.create({
            model: 'text-davinci-003',
            prompt: `Categorize the following email content into one of these categories: Interested, Not Interested, More Information. Email content: ${content}`,
            max_tokens: 50,
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error categorizing email:', error.message);
        throw error;
    }
};

const generateReply = async (category, content) => {
    try {
        let prompt;
        if (category === 'Interested') {
            prompt = `Generate a reply asking if the recipient is willing to hop on to a demo call and suggest a time. Email content: ${content}`;
        } else if (category === 'Not Interested') {
            prompt = `Generate a polite reply acknowledging their lack of interest. Email content: ${content}`;
        } else if (category === 'More Information') {
            prompt = `Generate a reply asking what additional information they need. Email content: ${content}`;
        }

        const response = await openai.completions.create({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 150,
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error generating reply:', error.message);
        throw error;
    }
};

const sendEmail = async (email, subject, content, tokens) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: email,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: tokens.refresh_token,
                accessToken: tokens.access_token,
            },
        });

        const mailOptions = {
            from: email,
            to: email,  // Change recipient email address if needed
            subject: subject,
            text: content,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

const handleGmail = async (tokens) => {
    try {
        setGoogleCredentials(tokens);

        const gmail = google.gmail({ version: 'v1', auth: getGoogleOAuthClient() });
        const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });
        const messages = res.data.messages;

        if (messages && messages.length) {
            for (const message of messages) {
                const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
                const snippet = msg.data.snippet;

                const category = await categorizeEmail(snippet);
                const reply = await generateReply(category, snippet);

                await sendEmail('your-email@gmail.com', `Re: ${msg.data.payload.headers.find(header => header.name === 'Subject').value}`, reply, tokens);
            }
        } else {
            console.log('No unread messages found.');
        }
    } catch (error) {
        console.error('Error handling Gmail:', error.message);
        throw error;
    }
};

module.exports = {
    categorizeEmail,
    generateReply,
    sendEmail,
    handleGmail,
};


