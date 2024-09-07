import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { exec } from 'child_process';

// Load environment variables from .env file
dotenv.config({ path: 'C:\\Users\\ashis\\Desktop\\full-app\\.env' });

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

// Countdown function
function countdown(seconds, callback) {
  let remaining = seconds;
  const interval = setInterval(() => {
    if (remaining > 0) {
      console.log(`Opening URL in ${remaining} seconds...`);
      remaining--;
    } else {
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

// Main function
async function main() {
  // Step 1: Get all GitHub repos
  const repos = await getRepos(githubToken);

  if (repos.length === 0) {
    console.error('No repositories found.');
    return;
  }

  // Step 2: Select the latest repo
  const latestRepo = repos[0];
  console.log(`Deploying the latest repository: ${latestRepo.name}`);

  // Step 3: Get default project settings
  const projectSettings = await getProjectSettings();

  // Step 4: Deploy the repo to Vercel
  const deploymentUrl = await deployToVercel(`https://github.com/Ashish-suman-sharma/${latestRepo.name}`, vercelToken, latestRepo.name, latestRepo.id, projectSettings);

  if (deploymentUrl) {
    console.log(`Successfully deployed! URL: ${deploymentUrl}`);
    // Construct the new URL using the latest repo name
    const customUrl = `https://${latestRepo.name}-ashishsumansharmas-projects.vercel.app/`;
    // Print countdown and open the constructed URL in Chrome after 4 seconds
    countdown(10, () => {
      exec(`start chrome "${customUrl}"`, (error) => {
        if (error) {
          console.error(`Error opening URL in Chrome: ${error.message}`);
        }
      });
    });
  }
}

main().catch(error => console.error(error));