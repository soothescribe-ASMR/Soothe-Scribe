import { google } from 'googleapis';
import fs from 'fs';

const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);
oauth2Client.setCredentials({
  access_token: process.env.YT_ACCESS_TOKEN,
  refresh_token: process.env.YT_REFRESH_TOKEN
});

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

const upload = async () => {
  await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: fs.readFileSync('./temp/title.txt', 'utf8').trim(),
        description: fs.readFileSync('./temp/description.txt', 'utf8').trim(),
        tags: ['ASMR', 'bedtime', 'relax', 'sleep']
      },
      status: { privacyStatus: 'public' }
    },
    media: { body: fs.createReadStream('./temp/final.mp4') }
  });
  console.log('✅ YouTube uploaded');
};

upload().catch(console.error);
