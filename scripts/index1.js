import fs from 'fs';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import boxen from 'boxen';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = process.env.GITHUB_USERNAME;

// Function to create a GitHub repository
async function createRepo(token, repoName, isPrivate) {
  const url = 'https://api.github.com/user/repos';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      private: isPrivate,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 422 && errorData.errors && errorData.errors[0].message.includes('name already exists')) {
      return { error: 'Repository with this name already exists' };
    }
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
    console.log(chalk.green('✔ Git init completed'));

    exec('git remote add origin ' + repoUrl, (remoteErr) => {
      if (remoteErr) {
        console.error(`Error setting remote origin: ${remoteErr}`);
        return;
      }
      console.log(chalk.green('✔ Remote origin set'));

      exec('git fetch origin', (fetchErr) => {
        if (fetchErr) {
          console.error(`Error fetching from origin: ${fetchErr}`);
          return;
        }
        console.log(chalk.green('✔ Fetched from origin'));

        exec('git branch -M main', (branchErr) => {
          if (branchErr) {
            console.error(`Error renaming branch to main: ${branchErr}`);
            return;
          }
          console.log(chalk.green('✔ Branch renamed to main'));

          // Remove local README.md before pulling
          fs.unlinkSync('README.md');

          exec('git pull origin main --allow-unrelated-histories', (pullErr) => {
            if (pullErr) {
              console.error(`Error pulling from GitHub: ${pullErr}`);
              return;
            }
            console.log(chalk.green('✔ Pulled from GitHub'));

            // Recreate README.md file locally
            fs.writeFileSync('README.md', `# ${repoName}\nThis is the repository for ${repoName}.`);

            exec('git add .', (addErr) => { // Add all files
              if (addErr) {
                console.error(`Error adding files: ${addErr}`);
                return;
              }
              console.log(chalk.green('✔ Files added'));

              exec('git commit -m "Initial commit"', (commitErr, stdout, stderr) => {
                if (commitErr) {
                  console.error(`Error committing changes: ${commitErr}`);
                  console.error(stderr);
                  return;
                }
                console.log(chalk.green('✔ Initial commit completed'));

                exec('git push -u origin main', (pushErr, pushStdout, pushStderr) => {
                  if (pushErr) {
                    console.error(`Error pushing to GitHub: ${pushErr}`);
                    console.error(pushStderr);
                    return;
                  }
                  console.log(chalk.green('✔ Pushed to GitHub'));

                  // Display the "Git Push Completed" message box
                  const message = 'Git Push Completed';
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
async function createGitRepo(repoName, isPrivate) {
  const token = githubToken;
  const owner = githubUsername;
  // Step 1: Create the repository
  const repo = await createRepo(token, repoName, isPrivate);

  if (repo && repo.error) {
    console.error(repo.error);
    return false;
  }

  if (repo && repo.clone_url) {
    console.log(chalk.green(`✔ Repository ${repoName} created at: ${repo.clone_url}`));

    // Step 2: Create README.md on GitHub
    await createReadme(token, owner, repoName);
    console.log(chalk.green(`✔ README.md created in ${repoName}`));
    
    // Step 3: Set up Git, commit, and push
    setupGit(repo.clone_url, repoName);
    return true;
  } else {
    console.error('Error creating repository');
    return false;
  }
}

// Function to prompt for repository name and visibility
async function promptRepoDetails() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoName',
      message: 'Enter the repository name:',
    },
    {
      type: 'list',
      name: 'visibility',
      message: 'Select the repository visibility:',
      choices: ['public', 'private'],
    },
  ]);

  const isPrivate = answers.visibility === 'private';
  const success = await createGitRepo(answers.repoName, isPrivate);
  if (!success) {
    console.log('Please enter a different repository name.');
    promptRepoDetails();
  }
}

// Start the prompt
promptRepoDetails();