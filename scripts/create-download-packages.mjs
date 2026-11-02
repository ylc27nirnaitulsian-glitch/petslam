import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function createExportZip() {
  console.log('Creating PET_SLAM_Claude_Context_Package.zip...');
  const zip = new JSZip();

  const filesToAdd = [
    'CLAUDE.md',
    'PROJECT_CONTEXT_CLAUDE.md',
    'CLAUDE_CODEBASE_BUNDLE.md',
    'package.json',
    '.env.example',
    'DEPLOYMENT_GUIDE.md',
    '.agents/product-marketing.md'
  ];

  for (const relPath of filesToAdd) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath);
      zip.file(relPath, content);
      console.log(`Added to context zip: ${relPath}`);
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outPath = path.join(ROOT_DIR, 'PET_SLAM_Claude_Context_Package.zip');
  fs.writeFileSync(outPath, zipBuffer);
  console.log(`Saved ${outPath} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

async function createFullSourceZip() {
  console.log('\nCreating PET_SLAM_Complete_Project_Source.zip...');
  const zip = new JSZip();

  const IGNORED = new Set([
    'node_modules',
    'dist',
    '.git',
    '.vscode',
    '.antigravity',
    '.system_generated',
    'artifacts',
    'brain',
    '.env',
    '.env.local',
    'package-lock.json',
    'PET_SLAM_Claude_Context_Package.zip',
    'PET_SLAM_Complete_Project_Source.zip'
  ]);

  function addDir(dir, zipFolder) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nextZipFolder = zipFolder ? zipFolder.folder(entry.name) : zip.folder(entry.name);
        addDir(fullPath, nextZipFolder);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        (zipFolder || zip).file(entry.name, content);
      }
    }
  }

  addDir(ROOT_DIR, null);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const outPath = path.join(ROOT_DIR, 'PET_SLAM_Complete_Project_Source.zip');
  fs.writeFileSync(outPath, zipBuffer);
  console.log(`Saved ${outPath} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
}

async function run() {
  await createExportZip();
  await createFullSourceZip();
  console.log('\nAll download packages created successfully!');
}

run().catch((err) => {
  console.error('Packaging error:', err);
  process.exit(1);
});
