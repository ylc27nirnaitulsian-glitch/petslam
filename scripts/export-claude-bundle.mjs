/**
 * PET SLAM - Codebase Exporter for Claude / Claude Projects
 * 
 * Generates a clean, comprehensive markdown bundle containing all codebase files,
 * structured with XML tags for optimal Claude prompt-caching and retrieval.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.resolve(ROOT_DIR, 'CLAUDE_CODEBASE_BUNDLE.md');

// Extensions to include
const INCLUDED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs',
  '.json', '.css', '.html', '.md', '.toml',
]);

// Directories to ignore
const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.vscode',
  '.antigravity',
  '.system_generated',
  'brain',
  'artifacts',
  'day-1',
]);

// Files to ignore
const IGNORED_FILES = new Set([
  'package-lock.json',
  '.env',
  '.env.local',
  'CLAUDE_CODEBASE_BUNDLE.md',
  '55360a55-fd84-4161-8092-34cde226585f.pbtxt',
]);

// Max file size to include in full bundle (150KB)
const MAX_FILE_SIZE = 150 * 1024;

function collectFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      results = results.concat(collectFiles(fullPath));
    } else if (entry.isFile()) {
      if (IGNORED_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!INCLUDED_EXTENSIONS.has(ext)) continue;

      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_FILE_SIZE) {
        console.log(`Skipping large file (${(stat.size / 1024).toFixed(1)} KB): ${relPath}`);
        continue;
      }

      results.push({ fullPath, relPath, size: stat.size });
    }
  }

  return results;
}

console.log('Collecting project files...');
const files = collectFiles(ROOT_DIR);
console.log(`Found ${files.length} relevant source files.`);

let output = '';
output += `# PET SLAM - Complete Codebase Context Export for Claude\n\n`;
output += `**Generated At:** ${new Date().toISOString()}\n`;
output += `**Total Files Included:** ${files.length}\n`;
output += `**Application:** PET SLAM (https://www.petslam.app)\n\n`;
output += `> This bundle is formatted for Claude.ai Projects, Claude Code CLI, and Claude prompt windows.\n`;
output += `> It includes project architecture, configuration, frontend/backend logic, services, and types.\n\n`;

output += `## File Directory Index\n\n`;
for (const file of files) {
  output += `- \`${file.relPath}\` (${(file.size / 1024).toFixed(1)} KB)\n`;
}
output += `\n---\n\n`;

output += `<documents>\n`;

let docIndex = 1;
for (const file of files) {
  try {
    let content = fs.readFileSync(file.fullPath, 'utf-8');

    // Redact sensitive patterns if any
    content = content.replace(/(DODO_PAYMENTS_API_KEY\s*=\s*['"])([^'"]+)(['"])/g, '$1[REDACTED]$3');
    content = content.replace(/(GEMINI_API_KEY\s*=\s*['"])([^'"]+)(['"])/g, '$1[REDACTED]$3');
    content = content.replace(/(EXA_API_KEY\s*=\s*['"])([^'"]+)(['"])/g, '$1[REDACTED]$3');
    content = content.replace(/(RESEND_API_KEY\s*=\s*['"])([^'"]+)(['"])/g, '$1[REDACTED]$3');

    output += `<document index="${docIndex}">\n`;
    output += `<source>${file.relPath}</source>\n`;
    output += `<document_content>\n${content}\n</document_content>\n`;
    output += `</document>\n\n`;
    docIndex++;
  } catch (err) {
    console.warn(`Error reading file ${file.relPath}:`, err.message);
  }
}

output += `</documents>\n`;

fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
const bundleStat = fs.statSync(OUTPUT_FILE);
console.log(`Successfully generated ${OUTPUT_FILE}`);
console.log(`Bundle Size: ${(bundleStat.size / (1024 * 1024)).toFixed(2)} MB`);
