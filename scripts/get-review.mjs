import { jules } from '@google/jules-sdk';
import fs from 'node:fs';

const env = fs.readFileSync(process.env.HOME + '/.env', 'utf8');
const key = env.match(/JULES_API_KEY=(.+)/)?.[1]?.trim();
const j = jules.with({ apiKey: key });

const sessionId = process.argv[2];
const session = j.session(sessionId);
await session.hydrate();

let last = '';
for await (const a of session.history()) {
  if (a.type === 'agentMessaged') last = a.message;
}
console.log('---- REVIEW ----');
console.log(last);
