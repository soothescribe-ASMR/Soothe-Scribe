// scripts/generate.js
// Soothe-Scribe: AI-generated ASMR bedtime story
// Auto-uploads to YouTube, Instagram & Facebook via GitHub Actions

require('dotenv').config();
const fs        = require('fs');
const path      = require('path');
const axios     = require('axios');
const OpenAI    = require('openai');
const { google } = require('googleapis');
const FB = require('facebook-nodejs-business-sdk');

// ------------------------------------------------------------------
// 1. Setup clients
// ------------------------------------------------------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

FB.FacebookAdsApi.init(process.env.FB_ACCESS_TOKEN);

// ------------------------------------------------------------------
// 2. Generate story via OpenAI
// ------------------------------------------------------------------
async function generateStory() {
  const prompt = `
You are a gentle ASMR storyteller.  
Write a calm 2-minute bedtime story (≈220–240 words) suitable for adults.  
Include soft descriptive sounds like [whispers], [gentle tapping], [page turning] etc.  
Title it with today's date in YYYY-MM-DD format.
  `.trim();

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7
  });

  return res.choices[0].message.content.trim();
}

// ------------------------------------------------------------------
// 3. Save story to /stories/YYYY-MM-DD.md
// ------------------------------------------------------------------
function saveStory(story) {
  const dir = path.join(__dirname, '..', 'stories');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${new Date().toISOString().slice(0, 10)}.md`;
  fs.writeFileSync(path.join(dir, filename), story, 'utf8');
  console.log(`Story saved: ${filename}`);
  return path.join(dir, filename);
}

// ------------------------------------------------------------------
// 4. Upload helpers (stubbed – extend as needed)
// ------------------------------------------------------------------
async function uploadToYouTube(storyPath) {
  console.log('YouTube upload placeholder – extend with scopes & OAuth.');
  // TODO: implement resumable upload
}

async function uploadToInstagram(storyPath) {
  console.log('Instagram upload placeholder – use IG Graph API.');
}

async function uploadToFacebook(storyPath) {
  console.log('Facebook upload placeholder – use Pages API.');
}

// ------------------------------------------------------------------
// 5. Main runner
// ------------------------------------------------------------------
(async () => {
  try {
    const storyText = await generateStory();
    const storyPath = saveStory(storyText);

    await uploadToYouTube(storyPath);
    await uploadToInstagram(storyPath);
    await uploadToFacebook(storyPath);

    console.log('✅ All done. Sweet dreams!');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
