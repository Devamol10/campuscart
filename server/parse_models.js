import fs from 'fs';

try {
  // Try reading with utf16le which is common for PowerShell redirected output
  let content = fs.readFileSync('hf_models_full.txt', 'utf16le');
  
  // If it still looks like garbage, try other encodings, but utf16le is most likely
  console.log("TOTAL CHARS:", content.length);
  
  const lines = content.split('\n');
  const models = lines
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/[",\s\[\]]/g, ''))
    .filter(m => m.length > 5);

  console.log(`Total models found: ${models.length}`);
  console.log("ALL MODELS:");
  console.log(JSON.stringify(models, null, 2));
} catch (err) {
  console.error(err);
}
