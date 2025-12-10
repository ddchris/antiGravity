const fs = require('fs');
const path = require('path');
// Node 18+ has global fetch

const REMOTE_URL = 'https://ddchris.github.io/my-widget/base-all.js';
const OUTPUT_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'base-all.js');

async function download() {
  console.log(`Downloading ${REMOTE_URL}...`);
  try {
    const res = await fetch(REMOTE_URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    
    const content = await res.text();
    
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`✅ Successfully saved to ${OUTPUT_FILE}`);
    console.log(`Size: ${content.length} bytes`);
  } catch (err) {
    console.error('❌ Download failed:', err);
    process.exit(1);
  }
}

download();
