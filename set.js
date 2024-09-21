import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

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
      answers.GITHUB_TOKEN = answer;
    } else if (question.includes('Vercel token')) {
      answers.VERCEL_TOKEN = answer;
    } else if (question.includes('GitHub username')) {
      answers.GITHUB_USERNAME = answer;
    }
  }

  const envContent = Object.entries(answers)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('Credentials saved to .env');
  rl.close();
}

main();