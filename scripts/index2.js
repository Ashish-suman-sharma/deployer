import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import chalk from 'chalk';

// Load environment variables from .env file
dotenv.config({ path: 'C:\\Users\\ashis\\Desktop\\Deployer\\.env' });

const githubToken = process.env.GITHUB_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

// Function to get all GitHub repositories
async function getRepos(token) {
  let repos = [];
  let page = 1;
  const perPage = 100; // Maximum allowed per page

  while (true) {
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

  // Sort repositories by creation date (latest first)
  repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return repos.map(repo => ({ name: repo.name, id: repo.id }));
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
  return data.url; // Deployment URL
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

// Main function
async function main() {
  // Step 1: Get all GitHub repos
  const spinner = ora('Fetching GitHub repositories...').start();
  const repos = await getRepos(githubToken);
  spinner.succeed('Fetched GitHub repositories.');

  if (repos.length === 0) {
    console.error('No repositories found.');
    return;
  }

  // Step 2: Select the latest repo
  const latestRepo = repos[0];
  console.log(chalk.green(`✔ Deploying the latest repository: ${latestRepo.name}`));

  // Step 3: Get default project settings
  const projectSettings = await getProjectSettings();

  // Step 4: Deploy the repo to Vercel
  const deploySpinner = ora('Deploying to Vercel...').start();
  const deploymentUrl = await deployToVercel(`https://github.com/${githubUsername}/${latestRepo.name}`, vercelToken, latestRepo.name, latestRepo.id, projectSettings);

  if (deploymentUrl) {
    deploySpinner.succeed('Successfully deployed to Vercel.');
    console.log(chalk.green(`✔ Deployment URL: ${deploymentUrl}`));
    
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

    // Construct the new URL using the latest repo name
    const customUrl = `https://${latestRepo.name}-ashishsumansharmas-projects.vercel.app/`;

    // Show inquirer loading animation for 6-7 seconds before opening the URL
    const loadingSpinner = ora('Opening URL...').start();
    await delay(6500); 
    loadingSpinner.succeed('Opening URL in Chrome.');

    // Open the constructed URL in Chrome
    exec(`start chrome "${customUrl}"`, (error) => {
      if (error) {
        console.error(`Error opening URL in Chrome: ${error.message}`);
      }
    });
  } else {
    deploySpinner.fail('Failed to deploy to Vercel.');
  }
}

// Prompt the user to start the deployment process
async function promptUser() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'deploy',
      message: 'Do you want to deploy the latest GitHub repository to Vercel?',
      default: true,
    },
  ]);

  if (answers.deploy) {
    main().catch(error => console.error(error));
  } else {
    console.log('Deployment cancelled.');
  }
}

// Start the prompt
promptUser();