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

  // 3. AI description
  const descResp = await model.generateContent(
    'Write a 200-character YouTube description for an ASMR bedtime story.'
  );
  const description = descResp.response.text().trim();

  // 4. Save files & continue rendering (rest of your original logic)
  fs.writeFileSync('outputs/story.txt', story);
  fs.writeFileSync('outputs/title.txt', title);
  fs.writeFileSync('outputs/description.txt', description);

  console.log('✅ Story, title & description ready.');
}

main().catch(console.error);
