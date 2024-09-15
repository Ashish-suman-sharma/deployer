import fetch from 'node-fetch';
import open from 'open';
import { exec } from 'child_process';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: 'C:\\Users\\ashis\\Desktop\\full-app\\.env' });

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

// Function to print countdown
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

// Function to prompt user for input
function promptUser(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Main function
async function main() {
  const repos = await getRepos(githubToken);

  if (repos.length === 0) {
    console.error('No repositories found.');
    return;
  }

  console.log('Select a repository to deploy:');
  repos.reverse().forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.name}`);
  });

  const input = await promptUser('Enter a number (1-20): ');
  const selectedIndex = parseInt(input, 10) - 1;

  if (selectedIndex < 0 || selectedIndex >= repos.length) {
    console.error('Invalid selection.');
    return;
  }

  const selectedRepo = repos[selectedIndex];
  console.log(`Deploying repository: ${selectedRepo.name}`);

  const projectSettings = await getProjectSettings();
  const deploymentUrl = await deployToVercel(`https://github.com/${githubUsername}/${selectedRepo.name}`, vercelToken, selectedRepo.name, selectedRepo.id, projectSettings);

  if (deploymentUrl) {
    console.log(`Successfully deployed! URL: ${deploymentUrl}`);
    const customUrl = `https://${selectedRepo.name}-ashishsumansharmas-projects.vercel.app/`;
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