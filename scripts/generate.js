import axios from 'axios';
import fs from 'fs-extra';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from 'googleapis';
import { execSync } from 'child_process';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  'http://localhost:3000/callback'
);
oauth2Client.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
fs.ensureDirSync('./outputs');

// 1-second silent test video (1280×720, 30 fps)
execSync(
  'ffmpeg -f lavfi -i testsrc=duration=1:size=1280x720:rate=30 -f lavfi -i anullsrc -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest ./outputs/final.mp4 -y',
  { stdio: 'inherit' }
);

// tiny dummy thumbnail & text
fs.writeFileSync('./outputs/thumbnail.jpg', Buffer.alloc(1024));
fs.writeFileSync('./outputs/title.txt', 'Tonight ASMR Title');
fs.writeFileSync('./outputs/description.txt', 'Generated ASMR bedtime story.');

// ---------- rest of your AI + upload logic ----------

// ---------- helpers ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- main ----------
async function main() {
  // 1. AI content
  const storyResp = await model.generateContent('Write a short, soothing ASMR bedtime story under 150 words.');
  const story = storyResp.response.text().trim();

  const titleResp = await model.generateContent('Create a 55-character catchy ASMR YouTube title.');
  const title = titleResp.response.text().trim();

  const descResp = await model.generateContent('Write a 200-character YouTube description for an ASMR bedtime story.');
  const description = descResp.response.text().trim();

  // 2. Render video (replace with your actual command)
  execSync('node scripts/render.js', { stdio: 'inherit' });
  const videoPath = './outputs/final.mp4';   // rendered video

  // 3. YouTube upload (unlisted)
  const media = {
    body: fs.createReadStream(videoPath)
  };
  const ytRes = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: { title, description, tags: ['ASMR', 'bedtime', 'sleep'] },
      status: { privacyStatus: 'public' }
    },
    media
  });
  console.log('✅ YouTube uploaded:', ytRes.data.id);

  // 4. Facebook Reel
  const fbUrl = `https://graph.facebook.com/v19.0/${process.env.FB_PAGE_ID}/videos`;
  const fbForm = new FormData();
  fbForm.append('access_token', process.env.FACEBOOK_ACCESS_TOKEN);
  fbForm.append('description', title + '\n\n' + description);
  fbForm.append('source', fs.createReadStream(videoPath));
  const fbRes = await axios.post(fbUrl, fbForm, { headers: fbForm.getHeaders() });
  console.log('✅ Facebook Reel:', fbRes.data.id);

  // 5. Instagram Reel
  const igUploadUrl = `https://graph.facebook.com/v19.0/${process.env.IG_USER_ID}/media`;
  const igBody = {
    access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
    media_type: 'REELS',
    video_url: 'https://soothescribe-asmr.github.io/Soothe-Scribe/final.mp4', // replace with actual public URL
    caption: title + '\n\n#ASMR #SleepStory #Reels'
  };
  const igUpload = await axios.post(igUploadUrl, igBody);
  const igContainerId = igUpload.data.id;
  await sleep(10000); // wait for processing
  await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.IG_USER_ID}/media_publish`,
    { access_token: process.env.INSTAGRAM_ACCESS_TOKEN, creation_id: igContainerId }
  );
  console.log('✅ Instagram Reel published');

  // 6. Save local copies if needed
  fs.ensureDirSync('outputs');
  fs.writeFileSync('outputs/story.txt', story);
  fs.writeFileSync('outputs/title.txt', title);
  fs.writeFileSync('outputs/description.txt', description);
}

main().catch(console.error);

