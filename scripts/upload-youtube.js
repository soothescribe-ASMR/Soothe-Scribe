// scripts/upload-youtube.js
import { google } from 'googleapis';
import fs from 'fs';
const youtube = google.youtube('v3');
const auth = new google.auth.GoogleAuth({
  -   keyFile: 'credentials.json',
+   keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
const upload = async () => {
  const authClient = await auth.getClient();
  google.options({ auth: authClient });
  await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: { title: 'Tonight ASMR', description: '#ASMR #relax' },
      status: { privacyStatus: 'public' },
    },
    media: { body: fs.createReadStream('output/final.mp4') },
  });
  console.log('✅ YouTube done');
};
upload().catch(console.error);
