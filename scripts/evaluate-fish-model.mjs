import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [apiUrl, manifestPath] = process.argv.slice(2);

if (!apiUrl || !manifestPath) {
  console.error('Usage: node scripts/evaluate-fish-model.mjs <Netlify-function-URL> <test-manifest.jsonl>');
  process.exit(1);
}

const resolvedManifest = resolve(manifestPath);
const manifestDirectory = dirname(resolvedManifest);
const lines = (await readFile(resolvedManifest, 'utf8'))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (lines.length === 0) {
  throw new Error('The evaluation manifest is empty.');
}

function normalizeLabel(label) {
  return label.toLowerCase().replace(/[_-]/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function contentTypeForPath(path) {
  const extension = path.toLowerCase().split('.').at(-1);
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

let correct = 0;
let total = 0;

for (const [index, line] of lines.entries()) {
  const entry = JSON.parse(line);
  if (typeof entry.imagePath !== 'string' || typeof entry.label !== 'string') {
    throw new Error(`Manifest line ${index + 1} must contain imagePath and label strings.`);
  }

  const imagePath = resolve(manifestDirectory, entry.imagePath);
  const image = await readFile(imagePath);
  const imageData = `data:${contentTypeForPath(imagePath)};base64,${image.toString('base64')}`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Evaluation failed at row ${index + 1}: ${result.error || response.statusText}`);
  }
  if (!Array.isArray(result.predictions) || typeof result.predictions[0]?.label !== 'string') {
    throw new Error(`The model returned no valid top prediction at row ${index + 1}.`);
  }

  if (normalizeLabel(result.predictions[0].label) === normalizeLabel(entry.label)) {
    correct += 1;
  }
  total += 1;
}

console.log(`Top-1 accuracy: ${(100 * correct / total).toFixed(2)}% (${correct}/${total})`);
console.log('This measurement applies only to the supplied labeled manifest and is not a general accuracy guarantee.');
