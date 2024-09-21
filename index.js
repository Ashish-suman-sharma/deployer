import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import fs from 'fs';

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
        { name: 'Set API Key (run only when code changes)', value: '4' },
      ],
    },
  ]);

  switch (answers.choice) {
    case '1':
      console.log('Running Git Push (first script only)...');
      runScript('index1.js');
      break;
    case '2':
      console.log('Running Deploy (first and second script)...');
      runScript('index1.js', () => {
        runScript('index2.js');
      });
      break;
    case '3':
      console.log('Running Last Script (second script only)...');
      runScript('index3.js');
      break;
    case '4':
      console.log('Setting API Key...');
      runScript('set.js');
      break;
    default:
      console.log('Invalid choice. Please select a valid option.');
      break;
  }
};

// Check if .env file is empty and run set.js if it is
if (checkEnvFile()) {
  console.log('.env file is empty. Running set.js...');
  runScript('set.js');
} else {
  // Start the prompt
  promptUser();
}