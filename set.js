// set.js
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  "Enter your GitHub token: ",
  "Enter your Vercel token: ",
  "Enter your GitHub username: "
];

const askQuestion = (rl, question) => {
  return new Promise(resolve => rl.question(question, resolve));
};

async function main() {
  const answers = {};
  for (const question of questions) {
    const answer = await askQuestion(rl, question);
    if (question.includes('GitHub token')) {
      answers.githubToken = answer;
    } else if (question.includes('Vercel token')) {
      answers.vercelToken = answer;
    } else if (question.includes('GitHub username')) {
      answers.githubUsername = answer;
    }
  }

  fs.writeFileSync('credentials.json', JSON.stringify(answers, null, 2));
  console.log('Credentials saved to credentials.json');
  rl.close();
}

main();