import express from 'express';
import open from 'open';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import boxen from 'boxen';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { exec } from 'child_process';

const GITHUB_CLIENT_ID = 'Ov23ligoamHrg8WSzwAB';
const GITHUB_CLIENT_SECRET = '0153fbca7d52c2147ecc77fef7fc72dc25f9af7e';

const app = express();
const port = 3000;

let githubToken = null;
let githubUsername = null;
let vercelToken = null;

// Function to ask if the user has restarted their PC
async function askRestartQuestion() {
  const message = chalk.blue('Before logging in, please restart your PC and make sure you do not copy anything.');
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'yellow',
    backgroundColor: 'black',
    align: 'center',
  };
  const msgBox = boxen(message, boxenOptions);
  console.log(msgBox);

  const { restarted } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'restarted',
      message: 'Have you restarted your PC?',
      default: false,
    },
  ]);

  if (!restarted) {
    console.log('Please restart your PC and run the script again.');
    process.exit(0);
  }
}

// GitHub OAuth callback
app.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  const response = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
  }, {
    headers: { Accept: 'application/json' }
  });
  githubToken = response.data.access_token;

  // Fetch GitHub username
  const userResponse = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `token ${githubToken}` }
  });
  githubUsername = userResponse.data.login;

  res.send(`
    <html>
      <body>
        <p>GitHub authentication successful! You can close this tab.</p>
        <script>
          window.close();
        </script>
      </body>
    </html>
  `);

  if (githubToken) {
    showVercelMessage();
    setTimeout(async () => {
      open('https://vercel.com/account/tokens');
      startClipboardMonitor();
    }, 5000);
  }
});

// Show Vercel message
function showVercelMessage() {
  const message = chalk.blue('In a few seconds, Vercel will open. Please create a Vercel token and come back. Do not press anything.');
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'yellow',
    backgroundColor: 'black',
    align: 'center',
  };
  const msgBox = boxen(message, boxenOptions);
  console.log(msgBox);
}

// Verify Vercel token
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

// Prompt for Vercel token
async function promptForVercelToken() {
  let valid = false;
  while (!valid) {
    const { VERCEL_TOKEN } = await inquirer.prompt([
      {
        type: 'input',
        name: 'VERCEL_TOKEN',
        message: 'Enter your Vercel token:',
      },
    ]);
    const spinner = ora('Verifying Vercel token...').start();
    valid = await verifyVercelToken(VERCEL_TOKEN);
    spinner.stop();
    if (!valid) {
      console.log('Invalid token, please try again. Click here for a new one: https://vercel.com/account/tokens');
    } else {
      vercelToken = VERCEL_TOKEN;
    }
  }
}

// Save tokens to .env file
function saveTokens() {
  const envContent = `GITHUB_TOKEN=${githubToken}\nGITHUB_USERNAME=${githubUsername}\nVERCEL_TOKEN=${vercelToken}`;
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
  process.exit(0);
}

// Start clipboard monitor script
function startClipboardMonitor() {
  const clipboardMonitor = exec('node clipboard_monitor.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting clipboard monitor: ${err}`);
      return;
    }
    console.log('Clipboard monitor started.');
  });

  clipboardMonitor.stdout.on('data', (data) => {
    if (data.includes('Clipboard content changed. Closing Chrome browser...')) {
      clipboardMonitor.kill();
      console.log('Clipboard content detected, closing browser.');
      exec('taskkill /IM chrome.exe /F', (err, stdout, stderr) => {
        if (err) {
          console.error(`Error closing browser: ${err}`);
          return;
        }
        console.log('Browser closed.');
        promptForVercelToken().then(saveTokens);
      });
    }
  });
}

// Start the server and open GitHub OAuth URL
askRestartQuestion().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    open(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`);
  });
});