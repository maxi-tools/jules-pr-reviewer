import { jules } from '@google/jules-sdk';
import fs from 'node:fs';

const env = fs.readFileSync(process.env.HOME + '/.env', 'utf8');
const key = env.match(/JULES_API_KEY=(.+)/)?.[1]?.trim();
const j = jules.with({ apiKey: key });

try {
  const session = await j.session({
    prompt: 'Say "hello world" then stop.',
    source: { github: 'sanjay3290/jules-pr-reviewer-testbed', baseBranch: 'main' },
  });
  console.log('Session created:', session.id);
  await new Promise(r => setTimeout(r, 3000));
  const info = await session.info();
  console.log('Session info:', JSON.stringify(info, null, 2).slice(0, 500));
} catch (err) {
  console.error('Error:', err?.message || err);
  console.error('Full:', err);
}
