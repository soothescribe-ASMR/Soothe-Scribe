// scripts/upload-instagram.js
import fetch from 'node-fetch';
import fs from 'fs';

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const igUserId = process.env.BUFFER_IG_ID;   // your IG account ID
const mediaUrl = 'https://graph.facebook.com/v18.0/' + igUserId + '/media';

// 1. Upload media
const res = await fetch(mediaUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_url: 'https://example.com/cover.jpg',   // or local file via fs.createReadStream
    caption: '#ASMR #relax'
  })
});
const { id: mediaId } = await res.json();

// 2. Publish
await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ creation_id: mediaId })
});

console.log('✅ Instagram posted');
