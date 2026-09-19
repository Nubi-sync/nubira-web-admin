const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/shaws/.gemini/antigravity-ide/brain/62772ed3-08c0-4872-864b-0ef0ab75f64b/.system_generated/logs/transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 9660) {
        if (obj.type === 'USER_INPUT') {
          console.log('\n=== STEP ' + obj.step_index + ' [USER_INPUT] ===\n' + obj.content);
        } else if (obj.type === 'PLANNER_RESPONSE' && obj.content) {
          console.log('\n--- STEP ' + obj.step_index + ' [AGENT] ---\n' + obj.content.slice(0, 1000));
        }
      }
    } catch(e) {}
  }
}

processLineByLine();
