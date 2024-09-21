import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import boxen from 'boxen';

const questions = [
  {
    type: 'input',
    name: 'GITHUB_TOKEN',
    message: 'Enter your GitHub token:',
  },
  {
    type: 'input',
    name: 'VERCEL_TOKEN',
    message: 'Enter your Vercel token:',
  },
  {
    type: 'input',
    name: 'GITHUB_USERNAME',
    message: 'Enter your GitHub username:',
  },
];

async function main() {
  const answers = await inquirer.prompt(questions);

  const envContent = Object.entries(answers)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);

  const message = 'Setup Completed';
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'green',
    backgroundColor: 'black',
    align: 'center',
  };
  const msgBox = boxen(message, boxenOptions);

  console.log(msgBox);
}

main();