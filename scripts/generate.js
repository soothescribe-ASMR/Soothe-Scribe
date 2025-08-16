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
oauth2Client.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

async function main() {
  // 1. AI story via Gemini
  const storyResp = await model.generateContent(
    'Write a short, soothing ASMR bedtime story under 150 words.'
  );
  const story = storyResp.response.text().trim();

  // 2. AI title via Gemini
  const titleResp = await model.generateContent(
    'Create a 55-character catchy ASMR YouTube title.'
  );
  const title = titleResp.response.text().trim();
  
oauth2Client.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

async function main() {
  // 1. AI story
  const storyResp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: '110-word soothing ASMR bedtime story.' }]
  });
  const story = storyResp.choices[0].message.content.trim();

  // 2. AI title & description
  const titleResp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: '55-char ASMR YouTube title.' }]
  });
  const title = titleResp.choices[0].message.content.trim();
  const descResp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: '2-line relaxing YouTube description.' }]
  });
  const description = descResp.choices[0].message.content.trim();

  // 3. AI voice
  const mp3Buffer = await openai.audio.speech.create({ model: 'tts-1', voice: 'nova', input: story });
  await fs.writeFile('voice.mp3', Buffer.from(await mp3Buffer.arrayBuffer()));

  // 4. AI video (Kie)
  const vidResp = await axios.post(
    'https://api.kie.ai/api/v1/gpt4o-image/generate',
    { prompt: 'soft pastel clouds drifting, ultra HD, 1:1', size: '1:1' },
    { headers: { Authorization: `Bearer ${process.env.KIE_API_KEY}` } }
  );
  const videoUrl = vidResp.data.videoUrl;
  const videoStream = (await axios.get(videoUrl, { responseType: 'stream' })).data;
  const writer = fs.createWriteStream('video.mp4');
  videoStream.pipe(writer);
  await new Promise(res => writer.on('close', res));

  // 5. Merge audio + video
  execSync('ffmpeg -i video.mp4 -i voice.mp3 -c:v copy -c:a aac -shortest final.mp4');

  // 6. AI thumbnail
  const thumbResp = await openai.images.generate({
    prompt: 'Pastel ASMR thumbnail 1280x720, crescent moon with headphones, lavender gradient, bold white text "2-min story"',
    n: 1,
    size: '1280x720',
    response_format: 'url'
  });
  const thumbUrl = thumbResp.data[0].url;
  await fs.writeFile('thumb.jpg', Buffer.from((await axios.get(thumbUrl, { responseType: 'arraybuffer' })).data));

  // 7. YouTube upload
  const uploadResp = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: { title, description, tags: ['ASMR', 'bedtime', 'sleep'] },
      status: { privacyStatus: 'public' }
    },
    media: { body: fs.createReadStream('final.mp4') }
  });
  await youtube.thumbnails.set({ videoId: uploadResp.data.id, media: { body: fs.createReadStream('thumb.jpg') } });

  console.log(`✅ Uploaded: https://youtu.be/${uploadResp.data.id}`);
}

await main();
