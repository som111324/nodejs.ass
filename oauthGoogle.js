const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

console.log('OAuth2Client initialized.');

const getGoogleAuthUrl = () => {
    console.log('Generating Google Auth URL...');
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
};

const getGoogleOAuthClient = () => {
    console.log('Returning Google OAuth Client...');
    return oAuth2Client;
};

const setGoogleCredentials = (tokens) => {
    console.log('Setting Google credentials...');
    oAuth2Client.setCredentials(tokens);
};

module.exports = {
    getGoogleAuthUrl,
    getGoogleOAuthClient,
    setGoogleCredentials,
};
