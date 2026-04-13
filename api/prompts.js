export const config = { runtime: 'edge' };

const DEFAULT_PROMPTS = [
  {
    name: "Threads投稿",
    prompt: "Threads投稿を1つ生成して。テキストのみ出力、説明・前置き・記号は不要。\n\n設定：\n- 投資で稼いでいる20代女性\n- 投資・FX・トレード・株などのワードは一切使わない\n- 金額は「稼ぐ・取る・入る・狙う」側の話のみ（使う・消費する話はNG）\n- 未確定の表現のみ使う（狙いたい・いけそう・取れそう・入ってきそう など）\n- 確定・達成表現は禁止（取れた・稼げた・達成・できた など）\n- 20代女性のゆるい口調\n- 1〜2行のみ\n- 毎回違うシチュエーション・感情トーンで生成\n- 今に限定した内容（週末・今月・朝など時間帯・曜日・時期のワード禁止）\n- 以下の例文のどれとも似た文章を出さないこと\n\n例：\nなんか流れきてる気がする、3万くらいいけるかな\n久しぶりにちゃんと狙いにいく日、5万目標で頑張る\nなんか今日の感じ悪くない、4万後半狙えそう\nいま集中できそうだし2万以上は取りたいな\nなんとなく勝てる気がしてる、根拠はないけど5万いきたい\nここから一気にいけそうな気しかしない、7万狙う"
  }
];

function parseRedisUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || '6379',
    password: u.password,
  };
}

async function redisCommand(redisUrl, ...args) {
  const { host, port, password } = parseRedisUrl(redisUrl);
  const baseUrl = `https://${host}:${port}`;
  const res = await fetch(`${baseUrl}/${args.map(encodeURIComponent).join('/')}`, {
    headers: {
      Authorization: `Bearer ${password}`,
    },
  });
  const data = await res.json();
  return data.result;
}

export default async function handler(req) {
  const redisUrl = process.env.REDIS_URL;

  if (req.method === 'GET') {
    try {
      const raw = await redisCommand(redisUrl, 'GET', 'prompts');
      const prompts = raw ? JSON.parse(raw) : DEFAULT_PROMPTS;
      return new Response(JSON.stringify(prompts), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    } catch {
      return new Response(JSON.stringify(DEFAULT_PROMPTS), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const value = JSON.stringify(body);
      await redisCommand(redisUrl, 'SET', 'prompts', value);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
