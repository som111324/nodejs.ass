require('dotenv').config();
const express = require('express');
const { getGoogleAuthUrl, setGoogleCredentials, getGoogleOAuthClient } = require('./oauthGoogle');
const { addEmailTask } = require('./taskScheduler');

console.log('Starting server...'); // Add this line

const app = express();
app.use(express.json());

app.get('/auth/google', (req, res) => {
    console.log('Redirecting to Google Auth...'); // Add this line
    const url = getGoogleAuthUrl();
    res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    console.log('Handling Google Auth callback...'); // Add this line
    const { code } = req.query;
    const { tokens } = await getGoogleOAuthClient().getToken(code);
    setGoogleCredentials(tokens);
    console.log('Adding email task...'); // Add this line for debugging
    addEmailTask(tokens);
    res.send('Gmail authenticated and emails are being processed.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Add this line
});
