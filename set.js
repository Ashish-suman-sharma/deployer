import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import boxen from 'boxen';
import ora from 'ora';
import axios from 'axios';

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
];

async function verifyGitHubToken(token) {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    });
    return { valid: response.status === 200, username: response.data.login };
  } catch (error) {
    return { valid: false, username: null };
  }
}

async function verifyVercelToken(token) {
  try {
    const response = await axios.get('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function promptForToken(question) {
  let valid = false;
  let answer;
  let username = null;
  while (!valid) {
    const { [question.name]: token } = await inquirer.prompt([question]);
    const spinner = ora('Verifying token...').start();
    if (question.name === 'GITHUB_TOKEN') {
      const result = await verifyGitHubToken(token);
      valid = result.valid;
      username = result.username;
    } else if (question.name === 'VERCEL_TOKEN') {
      valid = await verifyVercelToken(token);
    }
    spinner.stop();
    if (!valid) {
      if (question.name === 'GITHUB_TOKEN') {
        console.log('Invalid token, please try again. Click here for a new one: https://github.com/settings/tokens');
      } else if (question.name === 'VERCEL_TOKEN') {
        console.log('Invalid token, please try again. Click here for a new one: https://vercel.com/account/tokens');
      }
    } else {
      answer = token;
    }
  }
  return { token: answer, username };
}

async function main() {
  const answers = {};
  for (const question of questions) {
    if (question.name === 'GITHUB_TOKEN' || question.name === 'VERCEL_TOKEN') {
      const result = await promptForToken(question);
      answers[question.name] = result.token;
      if (question.name === 'GITHUB_TOKEN') {
        answers['GITHUB_USERNAME'] = result.username;
      }
    } else {
      const { [question.name]: answer } = await inquirer.prompt([question]);
      answers[question.name] = answer;
    }
  }

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