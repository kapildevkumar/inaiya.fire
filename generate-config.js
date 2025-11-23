// generate-config.js
const fs = require('fs');
const path = require('path');

// 1. Define the content, pulling from the Environment Variables
const configContent = `
window.SITE_CONFIG = {
    firebaseConfig: {
        apiKey: "${process.env.FIREBASE_API_KEY}",
        authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
        projectId: "${process.env.FIREBASE_PROJECT_ID}",
        storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
        messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
        appId: "${process.env.FIREBASE_APP_ID}"
    },
    SpouseName: "${process.env.SPOUSE_NAME}",
    theme: "${process.env.THEME || 'default'}", 
    appPasswordHash: "${process.env.APP_PASSWORD_HASH}"
};
`;

// 2. Ensure the "secret" folder exists
const secretDir = path.join(__dirname, 'secret');
if (!fs.existsSync(secretDir)){
    fs.mkdirSync(secretDir);
}

// 3. Write the file
fs.writeFileSync(path.join(secretDir, 'config.js'), configContent);

console.log("✅ Configuration file generated successfully for: " + process.env.SPOUSE_NAME);