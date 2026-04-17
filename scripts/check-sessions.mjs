import { jules } from '@google/jules-sdk';
import fs from 'node:fs';

const env = fs.readFileSync(process.env.HOME + '/.env', 'utf8');
const key = env.match(/JULES_API_KEY=(.+)/)?.[1]?.trim();
const j = jules.with({ apiKey: key });

const page = await j.sessions({ pageSize: 10 });
for (const s of page.sessions) {
  console.log(`${s.name.split('/').pop()}\t${s.state}\t${s.title?.slice(0, 60)}`);
}
