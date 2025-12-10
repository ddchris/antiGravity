// Node 18+ has global fetch

const urls = [
  'https://ddchris.github.io/my-widget/base-all.js',
  'https://ddchris.github.io/my-widget/dist/base-all.js'
];

async function checkUrls() {
  console.log('Checking URLs...');
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
      console.log(`Content-Type: ${res.headers.get('content-type')}`);
      console.log(`Content-Length: ${res.headers.get('content-length')}`);
      console.log('---');
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }
}

checkUrls();
