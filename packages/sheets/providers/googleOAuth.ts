import { OAuth2Client as GoogleOAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_SECRET = {
	"clientId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
	"clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxx",
	"googleRedirectUri": "http://localhost:3000/callback"
};

const GOOGLE_PERSISTENCE_TOKEN = {
	"access_token": null,
	"refresh_token": null,
	"scope": "https://www.googleapis.com/auth/spreadsheets",
	"token_type": "Bearer",
	"expiry_date": 1617888298259
};

/*
function getPersistenceToken(oauth2Client) {
	const authUrl = oauth2Client.generateAuthUrl({
		"access_type": "offline",
		"scope": [
			"https://www.googleapis.com/auth/admin.directory.user.readonly",
			"https://www.googleapis.com/auth/calendar",
			"https://www.googleapis.com/auth/drive.file",
			"https://www.googleapis.com/auth/drive.metadata",
			"https://www.googleapis.com/auth/spreadsheets"
		],
		"prompt": "consent"
	});

	console.log("Authorize this app by visiting this url: " + authUrl);

	const readline = createInterface({
		"input": process.stdin,
		"output": process.stdout
	});

	return new Promise(function(resolve, reject) {
		readline.question("Enter the code from the `code` query string parameter here: ", function(code) {
			readline.close();

			oauth2Client.getToken(code, function(error, token) {
				console.log("You should update this token:");
				console.log(JSON.stringify(token, undefined, "\t"));

				resolve(token);
			});
		});
	});
}
*/

export async function getOauth2Client() {
	const { clientId, clientSecret, googleRedirectUri } = GOOGLE_CLIENT_SECRET;
	const persistenceToken = GOOGLE_PERSISTENCE_TOKEN;

	const oauth2Client = new GoogleOAuth2Client(clientId, clientSecret, googleRedirectUri);

	oauth2Client.setCredentials(persistenceToken /* ?? await getPersistenceToken(oauth2Client) */);

	return oauth2Client;
}
