#!/usr/bin/env node
/**
 * Exa API Connector for PET SLAM
 * Follows the canonical Exa API guidelines from build-with-exa skill.
 */

import Exa from 'exa-js';
import fs from 'fs';
import path from 'path';

// Resolve EXA_API_KEY from environment or .env
let apiKey = process.env.EXA_API_KEY;

if (!apiKey) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/EXA_API_KEY\s*=\s*(.*)/i);
    if (match && match[1]) {
      apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

if (!apiKey) {
  console.error(JSON.stringify({
    error: 'MISSING_EXA_API_KEY',
    message: 'Please provide EXA_API_KEY in .env or environment variable.'
  }));
  process.exit(1);
}

const exa = new Exa(apiKey);

const args = process.argv.slice(2);
const query = args[0] || 'popular pet video games 2026';

async function main() {
  try {
    // Canonical Exa search request: query + type: "auto" + contents: { highlights: true }
    const response = await exa.search(query, {
      type: 'auto',
      contents: { highlights: true }
    });

    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Exa search error:', err.message);
    process.exit(1);
  }
}

main();
