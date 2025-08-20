// scripts/upload-facebook.js
import fetch from 'node-fetch';
import fs from 'fs';

const token = process.env.FACEBOOK_ACCESS_TOKEN;
const pageId = process.env.FACEBOOK_PAGE_ID; // your FB page ID
const video = 'output/final.mp4';

// 1. upload
const upload = await fetch(
  `https://graph.facebook.com/v18.0/${pageId}/videos`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'ASMR Short',
      description: '#ASMR #relax',
      source: 'https://your-public-link.com/final.mp4' // temporary
    })
  }
);
const { id: videoId } = await upload.json();

console.log('✅ Facebook posted: ' + videoId);
