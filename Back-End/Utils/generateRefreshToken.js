// generateRefreshToken.js
const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config({ path: "./config.env" });

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Scopes needed to send emails
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

async function getNewRefreshToken() {
  try {
    // Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline", // gets refresh token
      prompt: "consent",      // forces new refresh token
      scope: SCOPES,
    });

    console.log("Authorize this app by visiting this URL:\n", authUrl);

    // Ask user to input code from URL
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\nEnter the code from the page here: ", async (code) => {
      rl.close();
      try {
        // Exchange code for tokens
        const { tokens } = await oAuth2Client.getToken(code);
        console.log("\n✅ Here are your tokens:");
        console.log(tokens);

        if (tokens.refresh_token) {
          console.log(
            "\n💾 Copy the refresh token to your .env as GMAIL_REFRESH_TOKEN:"
          );
          console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
        } else {
          console.log(
            "\n⚠️ No refresh token returned. Make sure you set access_type: 'offline' and prompt: 'consent'"
          );
        }
      } catch (err) {
        console.error("Error retrieving tokens:", err);
      }
    });
  } catch (err) {
    console.error("Error generating auth URL:", err);
  }
}

getNewRefreshToken();
