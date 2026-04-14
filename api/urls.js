export const config = { runtime: 'edge' };

const URLS = [
  "https://youtu.be/Ol6de-f808g",
  "https://youtu.be/u5S3VEx9mFc",
  "https://youtu.be/bgQ1dcuUhSs",
  "https://youtu.be/F-Jdnl25AKc"
];

export default async function handler(req) {
  const random = URLS[Math.floor(Math.random() * URLS.length)];
  return new Response(JSON.stringify({ url: random }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
