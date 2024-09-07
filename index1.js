import fs from 'fs';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: 'C:\\Users\\ashis\\Desktop\\full-app\\.env' });

const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

// Function to create a GitHub repository
async function createRepo(token, repoName) {
  const url = 'https://api.github.com/user/repos';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      private: false, // Set to true if you want the repo to be private
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Error creating repo: ${response.status} ${response.statusText}`);
    console.error('Error details:', errorData);
    return null;
  }

  const data = await response.json();
  return data;
}

// Function to create a README.md file on GitHub
async function createReadme(token, owner, repoName) {
  const url = `https://api.github.com/repos/${owner}/${repoName}/contents/README.md`;
  const content = Buffer.from(`# ${repoName}\nThis is the repository for ${repoName}.`).toString('base64');
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Add README.md',
      content: content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Error creating README: ${response.status} ${response.statusText}`);
    console.error('Error details:', errorData);
    return null;
  }

  const data = await response.json();
  return data;
}

// Function to initialize Git, set the remote origin, and create initial commit
function setupGit(repoUrl, repoName) {
  // Create README.md file locally
  fs.writeFileSync('README.md', `# ${repoName}\nThis is the repository for ${repoName}.`);

  exec('git init', (initErr) => {
    if (initErr) {
      console.error(`Error initializing Git: ${initErr}`);
      return;
    }

    exec('git remote add origin ' + repoUrl, (remoteErr) => {
      if (remoteErr) {
        console.error(`Error setting remote origin: ${remoteErr}`);
        return;
      }

      exec('git fetch origin', (fetchErr) => {
        if (fetchErr) {
          console.error(`Error fetching from origin: ${fetchErr}`);
          return;
        }

        exec('git branch -M main', (branchErr) => {
          if (branchErr) {
            console.error(`Error renaming branch to main: ${branchErr}`);
            return;
          }

          // Remove local README.md before pulling
          fs.unlinkSync('README.md');

          exec('git pull origin main --allow-unrelated-histories', (pullErr) => {
            if (pullErr) {
              console.error(`Error pulling from GitHub: ${pullErr}`);
              return;
            }

            // Recreate README.md file locally
            fs.writeFileSync('README.md', `# ${repoName}\nThis is the repository for ${repoName}.`);

            exec('git add .', (addErr) => { // Add all files
              if (addErr) {
                console.error(`Error adding files: ${addErr}`);
                return;
              }

              exec('git commit -m "Initial commit"', (commitErr, stdout, stderr) => {
                if (commitErr) {
                  console.error(`Error committing changes: ${commitErr}`);
                  console.error(stderr);
                  return;
                }

                console.log(stdout);

                exec('git push -u origin main', (pushErr, pushStdout, pushStderr) => {
                  if (pushErr) {
                    console.error(`Error pushing to GitHub: ${pushErr}`);
                    console.error(pushStderr);
                    return;
                  }
                  console.log('Pushed to GitHub:', pushStdout);
                });
              });
            });
          });
        });
      });
    });
  });
}

// Main function to automate GitHub repo creation and setup
async function createGitRepo(repoName) {
  const token = githubToken;
  const owner = githubUsername;
  // Step 1: Create the repository
  const repo = await createRepo(token, repoName);

  if (repo && repo.clone_url) {
    console.log(`Repository ${repoName} created at: ${repo.clone_url}`);

    // Step 2: Create README.md on GitHub
    await createReadme(token, owner, repoName);
    console.log(`README.md created in ${repoName}`);
    
    // Step 3: Set up Git, commit, and push
    setupGit(repo.clone_url, repoName);
  } else {
    console.error('Error creating repository');
  }
}

// Use readline to prompt the user for the repo name
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the repository name
rl.question('Enter the repository name: ', (repoName) => {
  createGitRepo(repoName);
  rl.close();
});