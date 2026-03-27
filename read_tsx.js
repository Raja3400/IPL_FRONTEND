const fs = require('fs');
const files = [
  'src/components/AppShell.tsx',
  'src/pages/MatchDetailPage.tsx',
  'src/pages/MyPredictionsPage.tsx',
  'src/pages/MatchLeaderboardPage.tsx',
  'src/pages/TournamentLeaderboardPage.tsx',
  'src/pages/PredictionScorePage.tsx'
];
let out = '';
for (let file of files) {
  out += '===' + file + '===\n';
  try {
    out += fs.readFileSync(file, 'utf8') + '\n';
  } catch(e) { out += 'not found\n'; }
}
fs.writeFileSync('out.txt', out);
