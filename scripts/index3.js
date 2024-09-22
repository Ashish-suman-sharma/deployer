import fetch from 'node-fetch';
import open from 'open';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import boxen from 'boxen';
import ora from 'ora';

import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const githubToken = process.env.GITHUB_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

// Function to get all GitHub repositories
async function getRepos(token) {
  let repos = [];
  let page = 1;
  const perPage = 100;

  while (repos.length < 20) {
    const url = `https://api.github.com/user/repos?per_page=${perPage}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching repos: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();
    if (data.length === 0) {
      break;
    }

    repos = repos.concat(data);
    page++;
  }

  repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return repos.slice(0, 20).map(repo => ({ name: repo.name, id: repo.id }));
}

// Function to deploy to Vercel
async function deployToVercel(repoUrl, vercelToken, repoName, repoId, projectSettings) {
  const deployUrl = 'https://api.vercel.com/v13/deployments';
  
  const response = await fetch(deployUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: repoName,
      gitSource: {
        type: 'github',
        repoUrl: repoUrl,
        ref: 'main',
        repoId: repoId
      },
      projectSettings: projectSettings
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Error deploying repo: ${response.status} ${response.statusText}`);
    console.error('Error details:', errorData);
    return null;
  }

  const data = await response.json();
  return data.url;
}

// Function to get default project settings
async function getProjectSettings() {
  return {
    devCommand: null,
    installCommand: null,
    buildCommand: null,
    outputDirectory: null,
    rootDirectory: null,
    framework: null
  };
}

// Delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check URL
async function checkUrl(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Function to open URL with retry
async function openUrlWithRetry(url, maxWaitTime, checkInterval) {
  const startTime = Date.now();
  const loadingSpinner = ora('Checking URL...').start();

  while (Date.now() - startTime < maxWaitTime) {
    const isUrlValid = await checkUrl(url);

    if (isUrlValid) {
      loadingSpinner.succeed('Opening URL in Chrome.');
      exec(`start chrome "${url}"`, (error) => {
        if (error) {
          console.error(`Error opening URL in Chrome: ${error.message}`);
        }
      });
      return;
    }

    await delay(checkInterval);
  }

  loadingSpinner.warn('Opening URL in Chrome after 60 seconds despite errors.');
  exec(`start chrome "${url}"`, (error) => {
    if (error) {
      console.error(`Error opening URL in Chrome: ${error.message}`);
    }
  });
}

// Main function
async function main() {
  const repos = await getRepos(githubToken);

  if (repos.length === 0) {
    console.error('No repositories found.');
    return;
  }

  const choices = repos.reverse().map((repo, index) => ({
    name: repo.name,
    value: index
  }));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedRepoIndex',
      message: 'Select a repository to deploy:',
      choices: choices
    }
  ]);

  const selectedRepo = repos[answers.selectedRepoIndex];
  console.log(`Deploying repository: ${selectedRepo.name}`);

  const projectSettings = await getProjectSettings();
  const deploymentUrl = await deployToVercel(`https://github.com/${githubUsername}/${selectedRepo.name}`, vercelToken, selectedRepo.name, selectedRepo.id, projectSettings);

  if (deploymentUrl) {
    console.log(`Successfully deployed! URL: ${deploymentUrl}`);
    const customUrl = `https://${selectedRepo.name}-ashishsumansharmas-projects.vercel.app/`;

    // Display the "Deployment Completed" message box
    const message = 'Deployment Completed';
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

    // Show loading animation for 6-7 seconds before opening the URL
    await openUrlWithRetry(customUrl, 60000, 5000);
  }
}

main().catch(error => console.error(error));