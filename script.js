const fs = require('fs');
const path = require('path');

const outcomes = ['Win', 'Draw', 'Loss'];
const outputDir = path.join(process.cwd(), 'public', 'combinations');


if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}




for (let matchCount = 1; matchCount <= 10; matchCount++) {
  const totalCombos = Math.pow(3, matchCount);
  const totalElements = totalCombos * matchCount;
  const results = new Array(totalElements);
  
  let idx = 0;
  for (let i = 0; i < totalCombos; i++) {
    let temp = i;
    const currentCombo = [];
    for (let j = 0; j < matchCount; j++) {
      currentCombo.push(outcomes[temp % 3]);
      temp = Math.floor(temp / 3);
    }
    currentCombo.reverse();
    
    for (let k = 0; k < matchCount; k++) {
      results[idx++] = currentCombo[k];
    }
  }

  // Save directly to the static /public folder as compressed JSON
  fs.writeFileSync(
    path.join(outputDir, `matches-${matchCount}.json`), 
    JSON.stringify(results)
  );

}

console.log('computation matrix complete');
