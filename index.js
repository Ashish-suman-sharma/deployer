import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import fs from 'fs';
import os from 'os';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute the scripts and handle interactive input/output
const runScript = (scriptName, callback) => {
  const scriptPath = path.join(__dirname, scriptName);
  console.log(`Executing script: ${scriptPath}`);

  const child = spawn('node', [scriptPath], {
    stdio: 'inherit', // Ensures that input/output is directly passed through
  });

  child.on('error', (error) => {
    console.error(`Error executing script: ${error.message}`);
  });

  child.on('exit', (code) => {
    console.log(`Script finished with exit code ${code}`);
    if (callback) callback();
  });
};

// Function to check if .env file is empty
const checkEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8').trim();
    return envContent.length === 0;
  }
  return true; // If .env file does not exist, treat it as empty
};

// Function to create or replace deploy.bat in the root folder of the repository
const createDeployBat = () => {
  const repoRootPath = __dirname;
  const deployBatPath = path.join(repoRootPath, 'deploy.bat');
  const batContent = `@echo off\nnode "${path.join(__dirname, 'index.js')}"`;

  fs.writeFileSync(deployBatPath, batContent, 'utf-8');
  console.log(`Created or replaced deploy.bat at ${deployBatPath}`);
};

// Function to add the repository path to the system environment variables
const addPathToSystemEnv = (newPath) => {
  try {
    // Get the current PATH variable
    const currentPath = execSync('echo %PATH%', { encoding: 'utf-8' }).trim();
    
    // Check if the new path is already in the PATH variable
    if (!currentPath.includes(newPath)) {
      // Add the new path to the PATH variable
      execSync(`setx PATH "${currentPath};${newPath}"`, { stdio: 'inherit' });
      console.log(`Added ${newPath} to system PATH`);
    } else {
      console.log(`${newPath} is already in the system PATH`);
    }
  } catch (error) {
    console.error(`Error adding path to system environment variables: ${error.message}`);
  }
};

// Prompt the user to select an option using inquirer
const promptUser = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select an option:',
      choices: [
        { name: 'Git Push', value: '1' },
        { name: 'Git Push and Deploy', value: '2' },
        { name: 'Only Deploy', value: '3' },
        { name: 'delete git-repo  and vercel project', value: '4' },
        { name: 'Set API Key (run only when code changes)', value: '5' },
      ],
    },
  ]);

  switch (answers.choice) {
    case '1':
      console.log('Running Git Push (first script only)...');
      runScript('scripts/index1.js');
      break;
    case '2':
      console.log('Running Deploy (first and second script)...');
      runScript('scripts/index1.js', () => {
        runScript('scripts/index2.js');
      });
      break;
    case '3':
      console.log('Running Last Script (second script only)...');
      runScript('scripts/index3.js');
      break;
    case '4':
      console.log('Running Last Script (second script only)...');
      runScript('scripts/index4.js');
      break;
    case '5':
      console.log('login to Account');
      runScript('login.js');
      break;
    default:
      console.log('Invalid choice. Please select a valid option.');
      break;
  }
};

// Check if .env file is empty and run set.js if it is
if (checkEnvFile()) {
  console.log('.env file is empty or does not exist. Running startup.js...');
  runScript('startup.js');
  createDeployBat();
  addPathToSystemEnv(path.join(__dirname)); // Add the current directory to the system PATH
} else {
  // Start the prompt
  promptUser();
}