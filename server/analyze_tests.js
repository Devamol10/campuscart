import fs from 'fs';

try {
  const content = fs.readFileSync('test_report_final.txt', 'utf16le');
  const lines = content.split('\n');
  
  console.log("--- FAILING TESTS ANALYSIS ---");
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('fail') || line.toLowerCase().includes('error')) {
      // Print context (previous 2 and next 5 lines)
      console.log(`\n[Line ${index + 1}]`);
      for (let i = Math.max(0, index - 2); i < Math.min(lines.length, index + 8); i++) {
        const marker = i === index ? ">>" : "  ";
        console.log(`${marker} ${lines[i].trim()}`);
      }
    }
  });

} catch (err) {
  console.error("Parse Error:", err);
}
