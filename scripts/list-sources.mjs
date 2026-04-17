import { jules } from '@google/jules-sdk';
import fs from 'node:fs';

const env = fs.readFileSync(process.env.HOME + '/.env', 'utf8');
const key = env.match(/JULES_API_KEY=(.+)/)?.[1]?.trim();
const j = jules.with({ apiKey: key });

console.log('Connected GitHub sources for this Jules account:\n');
for await (const s of j.sources()) {
  if (s.type === 'githubRepo') {
    console.log(`- ${s.githubRepo.owner}/${s.githubRepo.repo} (private=${s.githubRepo.isPrivate})`);
  }
}
