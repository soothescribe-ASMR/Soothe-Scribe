// scripts/upload-instagram.js
import fetch from 'node-fetch';
import fs from 'fs';

const token   = process.env.INSTAGRAM_ACCESS_TOKEN;
const igId    = process.env.INSTAGRAM_USER_ID; // YOUR IG user ID
const video   = 'output/final.mp4';

// 1. upload
const upload = await fetch(
  `https://graph.facebook.com/v18.0/${igId}/media`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'VIDEO',
      video_url: 'https://your-public-link.com/final.mp4', // temporary
      caption: '#ASMR #relax #shorts'
    })
  }
);
const { id: creationId } = await upload.json();

// 2. publish
await fetch(
  `https://graph.facebook.com/v18.0/${igId}/media_publish`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId })
  }
);
console.log('✅ Instagram posted');
